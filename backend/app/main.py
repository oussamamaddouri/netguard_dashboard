# backend/app/main.py (MODIFIED)

import logging
import asyncio
import multiprocessing
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

from app.routers import (
    auth, debug, hosts, ports, security, threat_intel,
    zeek, packets, alerts, live_cockpit, investigation
)
from app.routers.connection_manager import manager
from app.services import (
    packet_capture, evasive_scanner, host_discovery, port_scanner,
    vulnerability_scanner, db_cleanup
)
from app.database import create_db_and_tables, SessionLocal
from app.models import Vulnerability
from app.config import settings
from app.state import app_state
from elasticsearch import Elasticsearch

logging.basicConfig(level="INFO", format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logging.getLogger("elastic_transport").setLevel(logging.WARNING)
logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
    logger.info("========================================")
    logger.info("  CybReon Application Starting Up...   ")
    logger.info("========================================")
    create_db_and_tables()
    logger.info("Cleaning up old vulnerability scan data from previous runs...")
    db = SessionLocal()
    try:
        db.query(Vulnerability).filter(Vulnerability.source == 'Nmap-Vulners').delete(synchronize_session=False)
        db.commit()
        logger.info("✅ Old vulnerability data cleared successfully.")
    except Exception as e:
        logger.error(f"Failed to clear old vulnerability data on startup: {e}"); db.rollback()
    finally: db.close()
    es_client = Elasticsearch(settings.ELASTICSEARCH_URI)
    while True:
        try:
            if es_client.ping(): logger.info("✅ Elasticsearch is connected and healthy."); break
        except Exception: pass
        logger.warning("🟡 Elasticsearch not ready, waiting 5 seconds..."); await asyncio.sleep(5)
    es_client.close()
    app_state.main_event_loop = asyncio.get_running_loop()
    logger.info("Starting background services...")
    threading.Thread(target=host_discovery_loop, daemon=True).start()
    threading.Thread(target=port_scanner_loop, daemon=True).start()
    threading.Thread(target=vuln_scanner_loop, daemon=True).start()
    threading.Thread(target=evasive_scanner.start_automated_evasion_scanner, daemon=True).start()
    threading.Thread(target=db_cleanup.db_cleanup_loop, daemon=True).start()
    try:
        pipe_path_in_container = "/stream/scapy.pcap"
        logger.info(f"✅ Scapy analysis service will read from shared stream: '{pipe_path_in_container}'")
        packet_queue = multiprocessing.Queue()
        stop_event = multiprocessing.Event()
        app.state.packet_capture_stop_event = stop_event
        sniffer_process = multiprocessing.Process(target=packet_capture.json_sniffer_process, args=(packet_queue, pipe_path_in_container, stop_event), daemon=True)
        handler_thread = threading.Thread(target=packet_capture.data_handler_thread, args=(packet_queue, stop_event), daemon=True)
        sniffer_process.start(); handler_thread.start()
        logger.info("✅ Scapy analysis service started successfully.")
    except Exception as e: logger.error(f"❌ FATAL: Failed to start Scapy analysis service: {e}", exc_info=True)
    logger.info("✅ Application startup sequence complete. CybReon is running.")
    yield
    logger.info("--- Shutting Down ---")
    if hasattr(app.state, 'packet_capture_stop_event'): app.state.packet_capture_stop_event.set()
    logger.info("✅ Shutdown complete.")

def host_discovery_loop():
    import time; time.sleep(10)
    while True:
        try: host_discovery.discover_hosts()
        except Exception as e: logger.error(f"Host discovery error: {e}", exc_info=True)
        time.sleep(300)
def port_scanner_loop():
    import time; time.sleep(30)
    while True:
        try: port_scanner.scan_ports()
        except Exception as e: logger.error(f"Port scanning error: {e}", exc_info=True)
        time.sleep(600)
def vuln_scanner_loop():
    import time; time.sleep(60)
    while True:
        try: vulnerability_scanner.run_vuln_scan()
        except Exception as e: logger.error(f"Vuln scanning error: {e}", exc_info=True)
        time.sleep(1800)

app = FastAPI(title="CybReon", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(hosts.router, prefix="/hosts", tags=["Hosts"])
api_router.include_router(ports.router, prefix="/ports", tags=["Ports"])
api_router.include_router(packets.router, prefix="/packets", tags=["Packets"])
api_router.include_router(security.router, prefix="/security", tags=["Security"])
api_router.include_router(debug.router, prefix="/debug", tags=["Debug"])
api_router.include_router(threat_intel.router, prefix="/threat-intel", tags=["Threat Intelligence"])
api_router.include_router(zeek.router, prefix="/zeek", tags=["Zeek"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(live_cockpit.router, prefix="/v1/cockpit")
api_router.include_router(investigation.router, prefix="/investigation", tags=["Investigation"])

@api_router.websocket("/ws/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

app.include_router(api_router)

class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except Exception:
            return await super().get_response("index.html", scope)
app.mount("/", SPAStaticFiles(directory="/app/build", html=True), name="spa")
