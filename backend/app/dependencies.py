# backend/app/dependencies.py (FINAL SECURE VERSION)

import os
import urllib3
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Generator
from sqlalchemy.orm import Session
from elasticsearch import Elasticsearch

from .database import SessionLocal
from .schemas import UserSchema
from .config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# ==================== PostgreSQL Database Dependency ====================
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================== User Authentication Dependency ====================
def get_current_user(token: str = Depends(oauth2_scheme)) -> UserSchema:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None: raise credentials_exception
        user = UserSchema(id=user_id, username="dummy_user")
        return user
    except JWTError: raise credentials_exception

# ==================== Centralized Elasticsearch Client ====================

# Read connection details from settings (which read from environment variables)
es_host = settings.ELASTICSEARCH_URI
es_user = settings.ELASTIC_USER
es_password = settings.ELASTIC_PASSWORD
es_ca_certs = settings.ELASTICSEARCH_SSL_CA_CERTS

# Create the connection options dictionary
client_options = {
    "timeout": 60,
    "retry_on_timeout": True,
    "max_retries": 3,
    "basic_auth": (es_user, es_password)
}

# If the path to a CA certificate is provided, configure the client for secure TLS.
if es_ca_certs:
    print(f"INFO: Central ES client configured for TLS verification with CA at: {es_ca_certs}")
    client_options['ca_certs'] = es_ca_certs
    client_options['verify_certs'] = True
# Otherwise, fall back to insecure mode and suppress the associated warnings.
else:
    print("WARNING: Central ES client is configured with TLS verification disabled.")
    client_options['verify_certs'] = False
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Create the SINGLE, SHARED client instance for the entire application
es_client = Elasticsearch(hosts=[es_host], **client_options)


def get_es_client() -> Elasticsearch:
    """
    FastAPI dependency that returns the single, shared Elasticsearch client instance.
    """
    return es_client