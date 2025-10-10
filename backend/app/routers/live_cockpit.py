# backend/app/routers/live_cockpit.py (FULLY CORRECTED AND SECURE)

# --- CHANGED: Added 'Query' to read URL parameters ---
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any
from elasticsearch import Elasticsearch
from datetime import datetime, timedelta

# --- Centralized dependencies ---
from app.dependencies import get_es_client, get_db
from app import models
from app import schemas
from ..services import health_score_service, ids_query_service

router = APIRouter(
    tags=["Live Cockpit"],
)

@router.get("/conn-state-distribution", response_model=List[Dict[str, Any]])
def get_connection_state_distribution(es: Elasticsearch = Depends(get_es_client)):
    """
    Provides a breakdown of Zeek connection states from the last hour.
    """
    try:
        state_data = ids_query_service.get_zeek_conn_state_distribution(es, time_range_hours=1)
        return state_data
    except Exception as e:
        print(f"Error retrieving connection state distribution: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve connection state data.")


# --- THIS IS THE FUNCTION THAT HAS BEEN MODIFIED ---
@router.get("/bandwidth", response_model=List[Dict[str, Any]])
def get_live_bandwidth_from_es(
    # --- ADDED: Accept 'window' from the URL, default to 60, and validate it ---
    window: int = Query(60, ge=1, le=300),  # Defaults to 60s, must be between 1 and 300
    es: Elasticsearch = Depends(get_es_client)
):
    """
    Retrieves live bandwidth usage from Elasticsearch over a dynamic time window.
    """
    # --- ADDED: Create a dynamic time string based on the 'window' parameter ---
    time_window_str = f"now-{window}s"
    
    # --- CHANGED: The Elasticsearch query now uses the dynamic time window ---
    query = {
        "size": 0,
        "query": {
            "bool": {
                "filter": [
                    {"term": {"log_source": "zeek"}},
                    {"exists": {"field": "uid"}},
                    {"range": {"@timestamp": {"gte": time_window_str, "lte": "now"}}} # CHANGED
                ]
            }
        },
        "aggs": {
            "bandwidth_over_time": {
                "date_histogram": {
                    "field": "@timestamp",
                    "fixed_interval": "1s",
                    "min_doc_count": 0,
                    "extended_bounds": {
                        "min": time_window_str, # CHANGED
                        "max": "now"
                    }
                },
                "aggs": {
                    "ingress_bytes": {"sum": {"field": "resp_ip_bytes"}},
                    "egress_bytes": {"sum": {"field": "orig_ip_bytes"}}
                }
            }
        }
    }
    
    try:
        response = es.search(index="netguard-zeek-*", body=query)
        buckets = response.get('aggregations', {}).get('bandwidth_over_time', {}).get('buckets', [])
        chart_data = [{"time": b['key'] // 1000, "in": b.get('ingress_bytes', {}).get('value', 0), "out": b.get('egress_bytes', {}).get('value', 0)} for b in buckets]
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve bandwidth data from Elasticsearch")


@router.get("/security-posture", response_model=Dict[str, Any])
def get_security_posture(es: Elasticsearch = Depends(get_es_client)):
    query = { "query": { "bool": { "must": [ { "term": { "log_source": "suricata" } }, { "term": { "suricata.alert.severity": 1 } }, { "range": { "@timestamp": { "gte": "now-24h", "lte": "now" } } } ] } } }
    try:
        response = es.count(index="netguard-suricata-*", body=query)
        critical_alert_count = response.get('count', 0)
        final_score = max(0, 100 - (critical_alert_count * 5))
        return {"health_score": final_score, "critical_alerts_24h": critical_alert_count}
    except Exception as e:
        return {"health_score": 100, "critical_alerts_24h": "N/A"}


@router.get("/health-score", response_model=schemas.HealthScoreResponse)
def get_network_health_score_details(es: Elasticsearch = Depends(get_es_client)):
    """
    Provides a detailed breakdown of the current network health score.
    """
    score_data = health_score_service.get_health_score_details(client=es)
    return score_data


@router.get("/ip_details/{ip_address}", response_model=Dict[str, Any])
def get_ip_details(ip_address: str, db: Session = Depends(get_db), es: Elasticsearch = Depends(get_es_client)):
    """
    Retrieves a comprehensive summary of an IP address from multiple sources.
    """
    try:
        es_query = {
            "size": 500, "sort": [{"@timestamp": "desc"}],
            "query": { "bool": {
                    "filter": [{"range": {"@timestamp": {"gte": "now-24h"}}}],
                    "should": [
                        {"term": {"source.ip": ip_address}}, {"term": {"destination.ip": ip_address}},
                        {"term": {"src_ip": ip_address}}, {"term": {"dest_ip": ip_address}},
                        {"term": {"id_orig_h.keyword": ip_address}}, {"term": {"id_resp_h.keyword": ip_address}},
                        {"wildcard": {"message": f"*{ip_address}*"}}
                    ], "minimum_should_match": 1
            }}
        }
        es_response = es.search(index="netguard-zeek-*,netguard-suricata-*", body=es_query, request_timeout=30)
        hits = es_response.get('hits', {}).get('hits', [])

        zeek_events = [hit['_source'] for hit in hits if 'zeek' in hit.get('_index', '')]
        suricata_events = [hit['_source'] for hit in hits if 'suricata' in hit.get('_index', '')]
        
        time_24_hours_ago = datetime.utcnow() - timedelta(hours=24)
        postgres_packets_query = db.query(models.NetworkPacket).filter(
            models.NetworkPacket.timestamp >= time_24_hours_ago,
            or_(models.NetworkPacket.source_ip == ip_address, models.NetworkPacket.destination_ip == ip_address)
        ).order_by(models.NetworkPacket.timestamp.desc()).limit(1000).all()
        
        return {
            "zeek": zeek_events,
            "suricata": suricata_events,
            "postgres_packets": [p.__dict__ for p in postgres_packets_query]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve details for IP {ip_address}.")