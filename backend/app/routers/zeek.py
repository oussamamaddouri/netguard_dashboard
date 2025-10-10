# backend/app/routers/zeek.py (FINALIZED - Uses Elasticsearch for Zeek data)

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session # Keep Session import for models in other routers, but not used in new function
from typing import List, Dict, Any
from collections import Counter
import geoip2.database
import os
from collections import Counter, defaultdict

from app import models 
from app.dependencies import get_db # Keep get_db if other functions in this router use Postgres
from app.services import ids_query_service
from app import schemas
from fastapi_cache.decorator import cache

# --- SETUP: GeoIP Database Reader ---
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'GeoLite2-Country.mmdb')
try:
    geoip_reader = geoip2.database.Reader(DB_PATH)
except FileNotFoundError:
    print(f"FATAL ERROR: GeoIP database not found at {DB_PATH}. Country lookups will fail.")
    geoip_reader = None

router = APIRouter(
    tags=["Zeek Data"] # More descriptive tag for this router
)

# --- CORRECTED ENDPOINT: /api/zeek/top-countries ---
@router.get("/top-countries", response_model=List[Dict[str, Any]], tags=["Zeek"])
async def get_top_countries_by_traffic():
    """
    Finds the top countries by connection count from Zeek logs IN THE LAST 24 HOURS.
    """
    if not geoip_reader:
        raise HTTPException(status_code=503, detail="GeoIP database is unavailable.")

    # --- CHANGE 1: Call the new, efficient aggregation service ---
    # This gets a list of IPs and their counts, e.g., [{'ip': '8.8.8.8', 'count': 500}]
    top_ips_with_counts = ids_query_service.get_top_ips_by_traffic(time_range="24h", top_n=200)

    # --- CHANGE 2: Sum the counts for each country ---
    country_counts = defaultdict(int)
    for item in top_ips_with_counts:
        ip = item['ip']
        count = item['count']
        try:
            response = geoip_reader.country(ip)
            country_code = response.country.iso_code
            if country_code:
                country_counts[country_code] += count
        except (geoip2.errors.AddressNotFoundError, ValueError):
            continue

    # Sort the dictionary by count and get the top 5
    sorted_countries = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    chart_data = [{"country": country, "count": count} for country, count in sorted_countries]
    return chart_data


# --- EXISTING ENDPOINTS (UNCHANGED) ---
@router.get("/connections", response_model=List[schemas.ZeekConnectionSchema], tags=["Zeek"])
async def get_zeek_connections():
    """
    Returns the most recent connection logs captured by Zeek from Elasticsearch.
    """
    connections = ids_query_service.get_latest_zeek_connections(limit=1000)
    return connections


@router.get("/protocol-distribution", response_model=List[schemas.ProtocolDistribution], tags=["Zeek"])
@cache(expire=60)
async def get_zeek_protocol_distribution():
    """
    Returns the top 10 most used protocols by traffic volume from Zeek data in Elasticsearch.
    """
    protocol_distribution = ids_query_service.get_zeek_protocol_distribution(limit=5)
    return protocol_distribution



@router.get("/traffic-timeline", response_model=List[Dict[str, Any]], tags=["Zeek"])
async def get_traffic_timeline():
    """
    Returns time-bucketed data for the 'Traffic Over Time' chart.
    """
    # Gets data for the last 1 hour in 1-minute intervals.
    timeline_data = ids_query_service.get_zeek_traffic_timeline(time_range_hours=1, interval_minutes=1)
    return timeline_data




@router.get("/conn-state-distribution", response_model=List[Dict[str, Any]], tags=["Zeek"])
@cache(expire=30)
async def get_conn_state_distribution():
    """
    Returns the distribution of Zeek connection states from the last hour.
    """
    distribution_data = ids_query_service.get_zeek_conn_state_distribution(time_range_hours=1)
    return distribution_data


@router.get("/conn-state-distribution/detailed", response_model=List[Dict[str, Any]], tags=["Zeek"])
@cache(expire=300) # Cache for 5 minutes
async def get_detailed_conn_state_timeline_endpoint(
    hours: int = Query(24, ge=1, le=168, description="The time range in hours to query. Min 1, Max 168 (7 days).")
):
    """
    Returns a time-series breakdown of connection states over a specified number of hours.
    """
    if hours <= 1:
        interval_minutes = 2
    elif hours <= 6:
        interval_minutes = 10
    elif hours <= 24:
        interval_minutes = 30
    else: 
        interval_minutes = 60 # 1 hour interval

    timeline_data = ids_query_service.get_detailed_zeek_conn_state_timeline(
        time_range_hours=hours, 
        interval_minutes=interval_minutes
    )
    return timeline_data