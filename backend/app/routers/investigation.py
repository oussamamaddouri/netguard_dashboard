# backend/app/routers/investigation.py (CORRECTED)

from fastapi import APIRouter, Depends, HTTPException, Body
from elasticsearch import Elasticsearch, ConnectionError as ESConnectionError, RequestError
from pydantic import BaseModel, Field
from typing import List, Dict, Any

# Import the corrected, centralized dependency function
from app.dependencies import get_es_client
from app.config import settings

router = APIRouter(
    prefix="/api/v1/investigation",
    tags=["Investigation Workbench"],
)

# NOTE: The old, local get_es_client() function has been DELETED.

class SearchQuery(BaseModel):
    """Defines the structure for a search API request."""
    query_string: str = Field(..., example="protocol:TCP AND destination_port:443", description="Query using Lucene syntax.")
    time_range_hours: int = Field(default=24, ge=1, description="Time range in hours to search back from now.")
    size: int = Field(default=100, ge=1, le=1000, description="Number of results to return.")
    index: str = Field(default="netguard-packets", description="Elasticsearch index to search.")

@router.post("/query", response_model=List[Dict[str, Any]])
def search_network_data(
    query: SearchQuery = Body(...),
    es: Elasticsearch = Depends(get_es_client) # This now uses the centralized function
):
    """
    Perform a flexible search query against stored network data in Elasticsearch.
    """
    try:
        es_query = {
            "query": {
                "bool": {
                    "must": {
                        "query_string": {
                            "query": query.query_string,
                            "analyze_wildcard": True,
                            "time_zone": "UTC"
                        }
                    },
                    "filter": {
                        "range": {
                            "@timestamp": {
                                "gte": f"now-{query.time_range_hours}h/h",
                                "lte": "now/h"
                            }
                        }
                    }
                }
            },
            "sort": [
                {"@timestamp": {"order": "desc", "unmapped_type": "boolean"}}
            ]
        }
        response = es.search(index=query.index, body=es_query, size=query.size)
        return [hit['_source'] for hit in response['hits']['hits']]
    except RequestError as e:
        raise HTTPException(status_code=400, detail=f"Invalid search query syntax: {e.info['error']['root_cause'][0]['reason']}")
    except ESConnectionError as e:
        raise HTTPException(status_code=503, detail=f"Elasticsearch connection error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")