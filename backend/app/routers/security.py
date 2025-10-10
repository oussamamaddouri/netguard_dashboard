# backend/app/routers/security.py (CORRECTED)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app import models, schemas

router = APIRouter()

@router.get("/alerts", response_model=List[schemas.SecurityAlertSchema])
def get_all_security_alerts(db: Session = Depends(get_db)):
    """Retrieve all security alert records from the database."""
    alerts = db.query(models.SecurityAlert).order_by(models.SecurityAlert.timestamp.desc()).limit(100).all()
    return alerts