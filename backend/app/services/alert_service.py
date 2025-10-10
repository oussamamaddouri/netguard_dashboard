# backend/app/services/alert_service.py (CORRECTED)
from datetime import datetime
from elasticsearch import RequestError

# Use the single, shared client from the dependencies file
from app.dependencies import es_client


def get_latest_alerts(limit: int = 500):
    """
    Queries Elasticsearch for the latest Suricata alerts.
    """
    index_name = "netguard-suricata-*"

    if not es_client.indices.exists(index=index_name):
        print(f"Index {index_name} does not exist.")
        return []

    try:
        query = {
            "query": {
                "bool": {
                    "must": [
                        { "match": { "event_type": "alert" } }
                    ]
                }
            },
            "sort": [
                { "@timestamp": "desc" }
            ],
            "size": limit
        }
        res = es_client.search(index=index_name, body=query)
        return [hit['_source'] for hit in res['hits']['hits']]
    except Exception as e:
        print(f"ERROR: Alert Service failed to query Elasticsearch: {e}")
        return []