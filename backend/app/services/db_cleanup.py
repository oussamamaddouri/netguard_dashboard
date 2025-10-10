# backend/app/services/db_cleanup.py

import logging
import time
from datetime import datetime, timedelta, timezone
from app.database import SessionLocal
from app.models import NetworkPacket

logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
RETENTION_DAYS = 7  # Keep 7 days of packet data
CLEANUP_INTERVAL_SECONDS = 86400  # Run once every 24 hours

def delete_old_packets():
    """
    Connects to the database and deletes records from the network_packets table
    that are older than the specified retention period.
    """
    db = None
    try:
        db = SessionLocal()
        retention_period = datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)
        
        logger.info(f"Running cleanup task. Deleting packets older than {retention_period.isoformat()}...")
        
        rows_deleted = db.query(NetworkPacket).filter(
            NetworkPacket.timestamp < retention_period
        ).delete(synchronize_session=False)

        db.commit()
        logger.info(f"Cleanup complete. Deleted {rows_deleted} old packet records.")

    except Exception as e:
        logger.error(f"An error occurred during database cleanup: {e}", exc_info=True)
        if db:
            db.rollback()
    finally:
        if db:
            db.close()


def db_cleanup_loop():
    """
    An infinite loop that calls the cleanup function on a schedule.
    This is designed to be run in a separate daemon thread.
    """
    logger.info("Scheduled DB cleanup task started.")
    time.sleep(60) # Initial delay to let the app fully start up
    while True:
        delete_old_packets()
        time.sleep(CLEANUP_INTERVAL_SECONDS)