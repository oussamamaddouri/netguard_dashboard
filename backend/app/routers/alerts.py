# backend/app/routers/alerts.py
from fastapi import APIRouter
from typing import List
from app.services import alert_service, ids_query_service
from app import schemas

router = APIRouter()

# This is the existing endpoint
@router.get("/alerts")
def read_alerts():
    alerts = alert_service.get_latest_alerts()
    return {"alerts": alerts}

# This is the new endpoint for Suricata flow data
@router.get("/api/suricata/flows", response_model=List[schemas.SuricataFlowSchema], tags=["Suricata"])
def get_suricata_flows():
    """
    Returns the most recent flow logs captured by Suricata from Elasticsearch.
    """
    flows = ids_query_service.get_latest_suricata_flows(limit=200)
    return flows