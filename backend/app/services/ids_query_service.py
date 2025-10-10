# backend/app/services/ids_query_service.py

from datetime import datetime, timedelta
import json
from elasticsearch import Elasticsearch
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app import models
from app.dependencies import es_client



#define the new, correct index aliases here ---
ZEEK_INDEX_ALIAS = "netguard-zeek-*"
SURICATA_INDEX_ALIAS = "netguard-suricata-*"

def get_latest_zeek_connections(limit: int = 100):
    """
    Queries Elasticsearch for the latest Zeek connection logs.
    NOW USES THE CORRECT ROLLOVER ALIAS.
    """
    if not es_client.indices.exists_alias(name=ZEEK_INDEX_ALIAS):
        print(f"WARNING: Zeek alias '{ZEEK_INDEX_ALIAS}' not found.")
        return []
    try:
        query = {
            "size": limit,
            "sort": [{"@timestamp": {"order": "desc"}}],
            "query": {
                "bool": {
                    "must": [
                        { "exists": { "field": "proto" } }
                    ]
                }
            }
        }
        res = es_client.search(index=ZEEK_INDEX_ALIAS, body=query)
        return [hit['_source'] for hit in res['hits']['hits']]
    except Exception as e:
        print(f"ERROR: Failed to query Zeek connections: {e}")
        return []

def get_latest_suricata_flows(limit: int = 100):
    """
    Queries Elasticsearch for the latest Suricata flow logs.
    NOW USES THE CORRECT ROLLOVER ALIAS.
    """
    if not es_client.indices.exists_alias(name=SURICATA_INDEX_ALIAS):
        print(f"WARNING: Suricata alias '{SURICATA_INDEX_ALIAS}' not found.")
        return []
    try:
        query = {
            "query": {
                "bool": {
                    "must": [
                        {"match": {"event_type": "flow"}}
                    ]
                }
            },
            "sort": [{"@timestamp": {"order": "desc"}}],
            "size": limit
        }
        res = es_client.search(index=SURICATA_INDEX_ALIAS, body=query)
        return [hit['_source'] for hit in res['hits']['hits']]
    except Exception as e:
        print(f"ERROR: Failed to query Suricata flows: {e}")
        return []

def get_zeek_protocol_distribution(limit: int = 10):
    """
    Queries Elasticsearch for the top protocols by total bytes transferred.
    NOW USES THE CORRECT ROLLOVER ALIAS and a time range filter.
    """
    if not es_client.indices.exists_alias(name=ZEEK_INDEX_ALIAS):
        print(f"WARNING: Zeek alias '{ZEEK_INDEX_ALIAS}' not found for protocol distribution.")
        return []
    try:
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=1)
        # Using .isoformat() and appending 'Z' is correct for UTC time in Elasticsearch
        time_window_start = start_time.isoformat() + 'Z'
        time_window_end = end_time.isoformat() + 'Z'

        query = {
            "size": 0,
            "query": {
                "bool": {
                    "must": [
                        { "exists": { "field": "proto" } },
                        { "exists": { "field": "orig_ip_bytes" } },
                        { "exists": { "field": "resp_ip_bytes" } },
                        { "range": { "@timestamp": { "gte": time_window_start, "lte": time_window_end } } }
                    ]
                }
            },
            "aggs": {
                "protocol_traffic": {
                    "terms": {
                        "script": {
                            "lang": "painless",
                            "source": """
                                def final_protocol = "UNKNOWN";
                                if (doc.containsKey('proto') && !doc['proto'].empty) {
                                    final_protocol = doc['proto'].value.toUpperCase();
                                }
                                int port = 0;
                                if (doc.containsKey('id_orig_p') && !doc['id_orig_p'].empty) {
                                    port = (int) doc['id_orig_p'].value;
                                } else if (doc.containsKey('id_resp_p') && !doc['id_resp_p'].empty) {
                                    port = (int) doc['id_resp_p'].value;
                                }
                                if (port == 80) return "HTTP"; if (port == 443) return "HTTPS"; if (port == 21) return "FTP";
                                if (port == 22) return "SSH"; if (port == 23) return "TELNET"; if (port == 25) return "SMTP";
                                if (port == 53) return "DNS"; if (port == 110) return "POP3"; if (port == 143) return "IMAP";
                                if (port == 3389) return "RDP"; if (port == 445) return "SMB";
                                return final_protocol;
                            """
                        },
                        "size": limit,
                        "order": { "total_bytes": "desc" }
                    },
                    "aggs": {
                        "total_bytes": {
                            "sum": {
                                "script": {
                                    "source": "doc['orig_ip_bytes'].value + doc['resp_ip_bytes'].value",
                                    "lang": "painless"
                                }
                            }
                        }
                    }
                }
            }
        }

        res = es_client.search(index=ZEEK_INDEX_ALIAS, body=query)
        distribution_data = []
        if 'aggregations' in res and 'protocol_traffic' in res['aggregations'] and 'buckets' in res['aggregations']['protocol_traffic']:
            for bucket in res['aggregations']['protocol_traffic']['buckets']:
                distribution_data.append({
                    "protocol": bucket.get('key', "UNKNOWN"),
                    "count": bucket.get('total_bytes', {}).get('value', 0)
                })
        return distribution_data
    except Exception as e:
        print(f"ERROR: An unexpected error occurred during protocol distribution: {e}")
        return []

def query_alerts_by_ip_and_time(target_ip: str, start_time: datetime, end_time: datetime):
    """
    Queries Elasticsearch for Suricata alerts.
    NOW USES THE CORRECT ROLLOVER ALIAS.
    """
    if not es_client.indices.exists_alias(name=SURICATA_INDEX_ALIAS):
        print(f"WARNING: Suricata alias '{SURICATA_INDEX_ALIAS}' not found.")
        return []

    try:
        import time
        time.sleep(10)
        time_window_start = start_time.isoformat() + 'Z'
        time_window_end = end_time.isoformat() + 'Z'

        query = {
            "query": {
                "bool": {
                    "must": [
                        # NOTE: The field name `event_type` is from your new file.
                        { "match": { "event_type": "alert" } },
                        { "range": { "@timestamp": { "gte": time_window_start, "lte": time_window_end } } }
                    ],
                    "filter": [
                        { "bool": { "should": [
                            # Using 'term' is better for exact IP matching.
                            { "term": { "src_ip": target_ip } },
                            { "term": { "dest_ip": target_ip } }
                        ], "minimum_should_match": 1 } }
                    ]
                }
            }
        }
        res = es_client.search(index=SURICATA_INDEX_ALIAS, body=query, size=100)
        return [hit['_source'] for hit in res['hits']['hits']]
    except Exception as e:
        print(f"ERROR: IDS Query Service failed to query Elasticsearch: {e}")
        return []

def get_top_ips_by_traffic(time_range="24h", top_n=100):
    """
    Gets the top N destination IPs from Zeek logs.
    NOW USES THE CORRECT ROLLOVER ALIAS.
    """
    if not es_client.indices.exists_alias(name=ZEEK_INDEX_ALIAS):
        print(f"WARNING: Zeek alias '{ZEEK_INDEX_ALIAS}' not found.")
        return []

    query = {
        "size": 0,
        "query": {
            # FIXED: Added the 'bool' and 'filter' clauses back from the old file.
            # This ensures we are only aggregating on actual Zeek logs if the alias
            # were to ever contain other documents.
            "bool": {
                "filter": [
                    { "term": { "log_source": "zeek" } },
                    { "range": { "@timestamp": { "gte": f"now-{time_range}" } } }
                ]
            }
        },
        "aggs": {
            "top_ips": {
                "terms": {
                    # NOTE: Your mapping must have this field as a 'keyword' type for aggregation.
                    "field": "id_resp_h",
                    "size": top_n
                }
            }
        }
    }
    try:
        response = es_client.search(index=ZEEK_INDEX_ALIAS, body=query)
        buckets = response.get('aggregations', {}).get('top_ips', {}).get('buckets', [])
        return [{"ip": bucket['key'], "count": bucket['doc_count']} for bucket in buckets]
    except Exception as e:
        print(f"Error querying Elasticsearch for top IPs: {e}")
        return []

def get_zeek_traffic_timeline(time_range_hours=1, interval_minutes=1):
    """
    Creates a time-bucketed aggregation of traffic volume per protocol.
    NOW USES THE CORRECT ROLLOVER ALIAS.
    """
    if not es_client.indices.exists_alias(name=ZEEK_INDEX_ALIAS):
        print(f"WARNING: Zeek alias '{ZEEK_INDEX_ALIAS}' not found.")
        return []

    query = {
        "size": 0,
        "query": {
            # FIXED: Added the 'bool' and 'filter' clauses back from the old file.
            # This prevents errors by ensuring the fields exist before aggregation.
            "bool": {
                "filter": [
                    {"range": {"@timestamp": {"gte": f"now-{time_range_hours}h"}}},
                    {"exists": {"field": "proto"}},
                    {"exists": {"field": "orig_ip_bytes"}},
                    {"exists": {"field": "resp_ip_bytes"}}
                ]
            }
        },
        "aggs": {
            "traffic_over_time": {
                "date_histogram": {
                    "field": "@timestamp",
                    "fixed_interval": f"{interval_minutes}m"
                },
                "aggs": {
                    "by_protocol": {
                        "terms": {"field": "proto"},
                        "aggs": {
                            "total_bytes": {
                                "sum": {
                                    # FIXED: Restored the full script definition with explicit language.
                                    "script": {
                                        "source": "doc['orig_ip_bytes'].value + doc['resp_ip_bytes'].value",
                                        "lang": "painless"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    try:
        response = es_client.search(index=ZEEK_INDEX_ALIAS, body=query)
        buckets = response.get('aggregations', {}).get('traffic_over_time', {}).get('buckets', [])
        timeline_data = []
        for bucket in buckets:
            time_point = {"time": bucket['key']}
            for proto_bucket in bucket.get('by_protocol', {}).get('buckets', []):
                time_point[proto_bucket['key'].upper()] = proto_bucket['total_bytes']['value']
            timeline_data.append(time_point)
        return timeline_data
    except Exception as e:
        print(f"Error querying Elasticsearch for traffic timeline: {e}")
        return []

def get_zeek_conn_state_distribution(client: Elasticsearch, time_range_hours: int = 1):
    """
    Aggregates Zeek connection logs by connection state using a provided client.
    """
    if not client.indices.exists_alias(name=ZEEK_INDEX_ALIAS):
        print(f"WARNING: Zeek alias '{ZEEK_INDEX_ALIAS}' not found.")
        return []
    
    query = {
        "size": 0,
        "query": {
            "bool": {
                "filter": [
                    {"range": {"@timestamp": {"gte": f"now-{time_range_hours}h/h", "lte": "now/h"}}},
                    {"exists": {"field": "conn_state"}}
                ]
            }
        },
        "aggs": { "conn_state_breakdown": { "terms": { "field": "conn_state", "size": 20 }}}
    }
    
    response = client.search(index=ZEEK_INDEX_ALIAS, body=query)
    buckets = response.get('aggregations', {}).get('conn_state_breakdown', {}).get('buckets', [])
    return [{"name": bucket['key'], "value": bucket['doc_count']} for bucket in buckets]



def get_detailed_zeek_conn_state_timeline(time_range_hours: int = 24, interval_minutes: int = 30):
    """
    Creates a time-bucketed aggregation of connection states for a detailed modal view.
    NOW USES THE CORRECT ROLLOVER ALIAS.
    """
    if not es_client.indices.exists_alias(name=ZEEK_INDEX_ALIAS):
        print(f"WARNING: Zeek alias '{ZEEK_INDEX_ALIAS}' not found.")
        return []
    query = {
        "size": 0,
        "query": { "range": {"@timestamp": {"gte": f"now-{time_range_hours}h"}}},
        "aggs": {
            "states_over_time": {
                "date_histogram": {
                    "field": "@timestamp",
                    "fixed_interval": f"{interval_minutes}m"
                },
                "aggs": { "by_state": { "terms": {"field": "conn_state", "size": 10}}}
            }
        }
    }
    try:
        response = es_client.search(index=ZEEK_INDEX_ALIAS, body=query)
        buckets = response.get('aggregations', {}).get('states_over_time', {}).get('buckets', [])
        timeline_data = []
        for bucket in buckets:
            time_point = {"time": bucket['key_as_string']}
            for state_bucket in bucket.get('by_state', {}).get('buckets', []):
                time_point[state_bucket['key']] = state_bucket['doc_count']
            timeline_data.append(time_point)
        return timeline_data
    except Exception as e:
        print(f"Error querying Elasticsearch for detailed connection state timeline: {e}")
        return []


def get_packetstreamer_details_for_ip(db: Session, ip_address: str, limit: int = 200):
    """
    Queries PostgreSQL for Packet-Streamer logs related to a specific IP address.
    """
    try:
        # Assumes your SQLAlchemy model for the 'network_packets' table is named 'NetworkPacket' in app/models.py
        results = db.query(models.NetworkPacket).filter(
            or_(
                models.NetworkPacket.source_ip == ip_address,
                models.NetworkPacket.destination_ip == ip_address
            )
        ).order_by(models.NetworkPacket.timestamp.desc()).limit(limit).all()

        # Convert SQLAlchemy objects to a list of dictionaries to be JSON serializable
        packet_logs = []
        for log in results:
            packet_logs.append({
                "id": log.id,
                "@timestamp": log.timestamp.isoformat(),
                "proto": log.protocol,
                # Note: We use the correct column names from the DB (e.g., log.source_ip)
                # and map them to keys consistent with our other data sources (e.g., "src_ip")
                "src_ip": log.source_ip,
                "src_port": log.source_port,
                "dest_ip": log.destination_ip,
                "dest_port": log.destination_port,
                "payload_snippet": f"Flags: {log.flags}, TTL: {log.ttl}" # Example snippet
            })
        return packet_logs

    except Exception as e:
        print(f"ERROR: Could not query PostgreSQL for Packet-Streamer data for IP {ip_address}: {e}")
        return []
