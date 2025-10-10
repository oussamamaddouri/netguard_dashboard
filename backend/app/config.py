# backend/app/config.py

import os
import socket
from dotenv import load_dotenv
from pathlib import Path


def get_secret(secret_name: str) -> str | None:
    """
    Reads a secret from the Docker secrets path.
    Handles errors if the file doesn't exist or permissions are denied.
    Returns the secret value as a string, or None on failure.
    """
    try:
        secret_path = Path(f"/run/secrets/{secret_name}")
        if secret_path.is_file():
            # Read the file and strip any trailing newlines
            return secret_path.read_text().strip()
    except (PermissionError, FileNotFoundError):
        # If we can't read the file, gracefully return None.
        # This allows the fallback to an environment variable.
        return None
    return None



env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

    # Existing database URI


    ELASTICSEARCH_URI: str = os.getenv("ELASTICSEARCH_URI")
    ELASTIC_USER: str = os.getenv("ELASTIC_USER")
    ELASTICSEARCH_SSL_CA_CERTS: str = os.getenv("ELASTICSEARCH_SSL_CA_CERTS")
    
    # Prioritize Docker secret, fall back to environment variable for development
    ELASTIC_PASSWORD: str = get_secret("elastic_password") or os.getenv("ELASTIC_PASSWORD")
    
    #if not all([ELASTICSEARCH_URI, ELASTIC_USER, ELASTIC_PASSWORD, ELASTICSEARCH_SSL_CA_CERTS]):
        #raise ValueError("❌ Missing required Elasticsearch configuration.")
        
    # --- NEW: Securely load Database credentials here ---
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: int = int(os.getenv("DB_PORT", 5432))
    DB_USER: str = os.getenv("DB_USER")
    DB_NAME: str = os.getenv("DB_NAME")
    
    # Prioritize Docker secret, fall back to environment variable for development
    DB_PASSWORD: str = get_secret("postgres_password") or os.getenv("DB_PASSWORD")

    if not all([DB_HOST, DB_USER, DB_PASSWORD, DB_NAME]):
        raise ValueError("❌ Missing required Database configuration.")

    _host_ip = "127.0.0.1"  
    try:
        _host_ip = socket.gethostbyname(socket.gethostname())
    except socket.gaierror:
        print("⚠️  Warning: Could not determine hostname's IP address via socket.gethostname(). The health score might be affected by self-scans.")


    TRUSTED_SCANNER_IPS: list[str] = list(set(["127.0.0.1", _host_ip]))
settings = Settings()
