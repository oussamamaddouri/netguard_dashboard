# backend/app/services/packet_capture.py
import logging
import multiprocessing
import queue
import json
import asyncio
import os
import time
from datetime import datetime, timezone

# --- START OF FINAL FIX: Import 'text' from SQLAlchemy ---
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, InterfaceError
from app.database import SessionLocal
from app.models import NetworkPacket
# --- END OF FINAL FIX ---

from app.routers.connection_manager import manager
from app.state import app_state

logger = logging.getLogger(__name__)

# No changes to the sniffer process
def json_sniffer_process(packet_queue: multiprocessing.Queue, pipe_path: str, stop_event: multiprocessing.Event):
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - [json_sniffer_process] - %(levelname)s - %(message)s')
    proc_logger = logging.getLogger(__name__)
    proc_logger.info(f"JSON sniffer process started. Monitoring pipe: '{pipe_path}'.")
    while not stop_event.is_set():
        try:
            proc_logger.info(f"Opening pipe '{pipe_path}'. Waiting for data stream...")
            with open(pipe_path, 'r') as f:
                for line in f:
                    if stop_event.is_set(): break
                    try:
                        ek_doc = json.loads(line)
                        layers = ek_doc.get("layers")
                        if not layers: continue
                        timestamp_str = ek_doc.get("timestamp")
                        packet_data = {
                            "@timestamp": datetime.fromtimestamp(float(timestamp_str)/1000, tz=timezone.utc).isoformat(),
                            "source_ip": layers.get("ip", {}).get("ip_ip_src"), "destination_ip": layers.get("ip", {}).get("ip_ip_dst"),
                            "length": int(layers.get("frame", {}).get("frame_frame_len", 0)), "ttl": int(layers.get("ip", {}).get("ip_ip_ttl", 0)),
                            "protocol": "UNKNOWN", "source_mac": layers.get("eth", {}).get("eth_eth_src"), "destination_mac": layers.get("eth", {}).get("eth_eth_dst"),
                            "source_port": None, "destination_port": None, "flags": None
                        }
                        if "tcp" in layers:
                            packet_data["protocol"] = "TCP"; packet_data["source_port"] = int(layers["tcp"].get("tcp_tcp_srcport", 0)); packet_data["destination_port"] = int(layers["tcp"].get("tcp_tcp_dstport", 0))
                        elif "udp" in layers:
                            packet_data["protocol"] = "UDP"; packet_data["source_port"] = int(layers["udp"].get("udp_udp_srcport", 0)); packet_data["destination_port"] = int(layers["udp"].get("udp_udp_dstport", 0))
                        elif "icmp" in layers: packet_data["protocol"] = "ICMP"
                        if packet_data["source_ip"] and packet_data["destination_ip"]: packet_queue.put(packet_data)
                    except (json.JSONDecodeError, KeyError, AttributeError): continue
            proc_logger.warning("Stream ended. Will attempt to reopen in 2 seconds."); time.sleep(2)
        except Exception as e:
            proc_logger.error(f"An unexpected error occurred in the JSON sniffer loop: {e}", exc_info=True); proc_logger.info("Restarting sniffer loop after a 5 second delay..."); time.sleep(5)
    proc_logger.info("Sniffer process received stop signal and is shutting down.")


def data_handler_thread(packet_queue: multiprocessing.Queue, stop_event: multiprocessing.Event):
    logger.info("PostgreSQL Writer & Broadcaster thread started.")
    db_session = None
    while not stop_event.is_set():
        try:
            if db_session is None:
                logger.info("Packet handler is attempting to connect to the database...")
                try:
                    db_session = SessionLocal()
                    # --- START OF FINAL FIX: Wrap the SQL in text() ---
                    db_session.execute(text('SELECT 1'))
                    # --- END OF FINAL FIX ---
                    logger.info("✅ Database connection successful in packet handler.")
                except (OperationalError, InterfaceError) as e:
                    logger.warning(f"Database connection failed in packet handler: {e}. Retrying in 5 seconds...")
                    if db_session: db_session.close()
                    db_session = None
                    time.sleep(5)
                    continue
            packet_data = packet_queue.get(timeout=1.0)
            broadcast_message = {"type": "packet_data", "data": packet_data}
            json_string_message = json.dumps(broadcast_message, default=str)
            main_loop = app_state.main_event_loop
            if main_loop and main_loop.is_running():
                asyncio.run_coroutine_threadsafe(manager.broadcast(json_string_message), main_loop)
            try:
                db_packet_data = packet_data.copy()
                iso_timestamp = db_packet_data.pop("@timestamp")
                db_packet_data["timestamp"] = datetime.fromisoformat(iso_timestamp)
                new_packet = NetworkPacket(**db_packet_data)
                db_session.add(new_packet)
                db_session.commit()
            except (OperationalError, InterfaceError) as e:
                logger.error(f"Lost PostgreSQL connection, will attempt to reconnect: {e}")
                db_session.close()
                db_session = None
            except Exception as e:
                logger.error(f"Failed to write packet to PostgreSQL: {e}")
                db_session.rollback()
        except queue.Empty:
            continue
        except Exception as e:
            logger.error(f"An unexpected outer loop error occurred in data handler: {e}", exc_info=True)
            time.sleep(5)
    if db_session:
        db_session.close()
    logger.info("PostgreSQL data handler thread shutting down.")