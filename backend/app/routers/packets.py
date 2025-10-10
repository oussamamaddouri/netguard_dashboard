# backend/app/routers/packets.py

# ### --- START OF CHANGES --- ###
# We no longer need Elasticsearch in this file.
# We DO need dependencies and models for PostgreSQL.
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from .. import schemas, dependencies, models
# ### --- END OF CHANGES --- ###

router = APIRouter()

# ### --- START OF CHANGES --- ###
# The Elasticsearch client dependency is no longer needed and has been removed.
# We will use the existing get_db dependency.

@router.get("", response_model=List[schemas.PacketSchema])
def get_all_packets(db: Session = Depends(dependencies.get_db), limit: int = 100):
    """
    Retrieves the most recent captured packets from PostgreSQL.
    """
    try:
        # Query the NetworkPacket table in PostgreSQL
        # Order by timestamp descending to get the latest packets first
        packets = (
            db.query(models.NetworkPacket)
            .order_by(models.NetworkPacket.timestamp.desc())
            .limit(limit)
            .all()
        )
        
        # We need to manually convert the @timestamp field name
        # to match the schema expected by the frontend.
        # Your schema likely expects "@timestamp", but the DB model uses "timestamp".
        packet_dicts = []
        for packet in packets:
            packet_dict = {
                "@timestamp": packet.timestamp,
                "source_ip": packet.source_ip,
                "destination_ip": packet.destination_ip,
                "length": packet.length,
                "ttl": packet.ttl,
                "protocol": packet.protocol,
                "source_mac": packet.source_mac,
                "destination_mac": packet.destination_mac,
                "source_port": packet.source_port,
                "destination_port": packet.destination_port,
                "flags": packet.flags,
            }
            packet_dicts.append(packet_dict)
        
        return packet_dicts

    except Exception as e:
        # Log the actual error for debugging
        print(f"An unexpected error occurred while querying the database: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected server error occurred while querying the database."
        )

# ### --- END OF CHANGES --- ###


# The protocol-distribution endpoint below is now correct,
# as the packet data is being written to PostgreSQL where this query runs.
# The warning comment can be removed.

from sqlalchemy import func

@router.get("/protocol-distribution", response_model=List[schemas.ProtocolDistribution])
def get_protocol_distribution(db: Session = Depends(dependencies.get_db)):
    """
    Calculates the distribution of network traffic volume (in bytes)
    for each protocol (TCP, UDP, ICMP, etc.) from the PostgreSQL database.
    """
    try:
        protocol_bytes = (
            db.query(
                models.NetworkPacket.protocol,
                func.sum(models.NetworkPacket.length).label("count")
            )
            .group_by(models.NetworkPacket.protocol)
            .order_by(func.sum(models.NetworkPacket.length).desc())
            .all()
        )
        return [{"protocol": protocol, "count": count} for protocol, count in protocol_bytes]

    except Exception as e:
        print(f"An unexpected error occurred while fetching protocol distribution: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")