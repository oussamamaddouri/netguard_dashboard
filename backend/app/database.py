# backend/app/database.py (Corrected Version)

import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings  # <--- CHANGED: Import the settings object

logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)


logger.info(f"--- Configuring Database Engine to connect to {settings.DB_HOST}:{settings.DB_PORT} ---")

try:
    # Build the engine using the configuration from the settings object
    engine = create_engine(
        "postgresql+pg8000://",
        connect_args={
            "user": settings.DB_USER,
            "password": settings.DB_PASSWORD,
            "host": settings.DB_HOST,
            "port": settings.DB_PORT,
            "database": settings.DB_NAME
        }
    )

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

    def get_db():
        db = SessionLocal()
        try: yield db
        finally: db.close()

    def create_db_and_tables():
        from app import models
        logger.info("--- Creating database tables if they do not exist... ---")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables are ready.")

except Exception as e:
    logger.critical(f"FATAL: A critical error occurred while creating the database engine: {e}", exc_info=True)
    raise