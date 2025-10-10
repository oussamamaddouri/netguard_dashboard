# backend/app/routers/threat_intel.py (Corrected with 24-hour filter)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from collections import Counter
import geoip2.database
import os
# --- ADDITION 1: Import datetime and timedelta for time-based filtering ---
from datetime import datetime, timedelta

from app import models
from app.dependencies import get_db

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'GeoLite2-Country.mmdb')
try:
    geoip_reader = geoip2.database.Reader(DB_PATH)
except FileNotFoundError:
    geoip_reader = None

router = APIRouter(
    tags=["Threat Intelligence"]
)

@router.get("/origins", response_model=List[Dict[str, Any]])
def get_threat_origins(db: Session = Depends(get_db)):
    """
    Finds source IPs from security alerts IN THE LAST 24 HOURS, translates them
    to country codes, and returns the top 5 countries by alert count.
    """
    if not geoip_reader:
        raise HTTPException(status_code=503, detail="GeoIP database is not available.")

    # --- ADDITION 2: Define the time window for the query ---
    time_window_start = datetime.utcnow() - timedelta(hours=24)

    # Step 1: Query source IPs from the security alerts table within the time window.
    # Assumes your SecurityAlert model has a 'timestamp' field. If it's named differently
    # (e.g., 'created_at'), change 'models.SecurityAlert.timestamp' accordingly.
    results = db.query(models.SecurityAlert.source_ip)\
                .filter(models.SecurityAlert.source_ip.isnot(None))\
                .filter(models.SecurityAlert.timestamp >= time_window_start)\
                .all()
    
    source_ips = [item[0] for item in results]

    # The rest of the function remains the same...
    country_codes = []
    for ip in source_ips:
        try:
            response = geoip_reader.country(ip)
            country_codes.append(response.country.iso_code)
        except geoip2.errors.AddressNotFoundError:
            continue
        except Exception:
            continue
            
    country_counts = Counter(country_codes)
    top_countries = country_counts.most_common(5)
    chart_data = [{"country": country, "risk": count} for country, count in top_countries]
    return chart_data