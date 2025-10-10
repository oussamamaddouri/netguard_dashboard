# backend/app/services/health_score_service.py (CORRECTED)

from elasticsearch import Elasticsearch
from ..config import settings

# <--- ALL OLD CLIENT LOGIC (get_es_client, close_es_client) IS REMOVED FROM THIS FILE --->

def get_health_score_details(client: Elasticsearch) -> dict:
    """
    Calculates the health score using a provided, authenticated Elasticsearch client.
    """
    try:
        # The 'client' is now passed in from the router, already authenticated.
        time_filter = {"range": {"@timestamp": {"gte": "now-1h", "lt": "now"}}}
        
        alert_query = { "size": 0, "query": {"bool": {"must": [time_filter, {"term": {"event_type": "alert"}}]}}, "aggs": {"alerts_by_severity": {"terms": {"field": "alert.severity"}}} }
        alert_response = client.search(index="netguard-suricata-*", body=alert_query)
        
        buckets = alert_response.get('aggregations', {}).get('alerts_by_severity', {}).get('buckets', [])
        critical_alerts_count, high_alerts_count = 0, 0
        for bucket in buckets:
            if bucket.get('key') == 1: critical_alerts_count = bucket.get('doc_count', 0)
            elif bucket.get('key') == 2: high_alerts_count = bucket.get('doc_count', 0)

        scan_query = {
            "size": 0,
            "query": { "bool": { "must": [time_filter, {"term": {"conn_state": "S0"}}], "must_not": [{"terms": {"id_orig_h": settings.TRUSTED_SCANNER_IPS}}] } },
            "aggs": {
                "unique_scanner_count": { "cardinality": { "field": "id_orig_h" } },
                "top_scanners": { "terms": { "field": "id_orig_h", "size": 5 } } 
            }
        }
        scan_response = client.search(index="netguard-zeek-*", body=scan_query)
        
        aggs = scan_response.get('aggregations', {})
        unique_scanners_count = aggs.get('unique_scanner_count', {}).get('value', 0)
        top_scanner_buckets = aggs.get('top_scanners', {}).get('buckets', [])
        scanner_ips_list = [bucket['key'] for bucket in top_scanner_buckets]

        critical_deduction = critical_alerts_count * getattr(settings, 'HEALTH_SCORE_CRITICAL_WEIGHT', 10)
        high_deduction = high_alerts_count * getattr(settings, 'HEALTH_SCORE_HIGH_WEIGHT', 5)
        scanner_deduction = unique_scanners_count * getattr(settings, 'HEALTH_SCORE_SCANNING_IP_WEIGHT', 2)

        details = [
            {"reason": "Critical Severity Alerts", "count": critical_alerts_count, "deduction": critical_deduction, "items": []},
            {"reason": "High Severity Alerts", "count": high_alerts_count, "deduction": high_deduction, "items": []},
            {"reason": "External Scanning IPs", "count": unique_scanners_count, "deduction": scanner_deduction, "items": scanner_ips_list}
        ]

        base_score = getattr(settings, 'HEALTH_SCORE_BASE', 100)
        total_deduction = critical_deduction + high_deduction + scanner_deduction
        final_score = max(0, base_score - total_deduction)

        return { "score": int(final_score), "base_score": base_score, "total_deduction": total_deduction, "details": details }

    except Exception as e:
        print(f"CRITICAL ERROR calculating health score details: {e}")
        return { "score": 50, "base_score": 100, "total_deduction": 0, "details": [{"reason": f"Error: Could not retrieve data. Check backend logs.", "count": 0, "deduction": 0, "items": []}] }