# backend/app/models.py

from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime, Index, Text, ForeignKey, JSON, Float, func
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

# --- UNIFIED VULNERABILITY MODEL ---
# The goal is to have a central table for the UI that aggregates findings
# from Nmap (Scripts), Nuclei, and GVM (OpenVAS).

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    id = Column(Integer, primary_key=True, index=True)
    host_ip = Column(String(45), index=True, nullable=False)
    port = Column(Integer, nullable=True) # Port might be null for some findings
    service = Column(String(100), nullable=True)
    severity = Column(String(20), index=True)
    cve = Column(String(50), index=True, nullable=True)
    description = Column(Text, nullable=False)
    
    # ### --- KEY ADDITION --- ###
    # This column will store the source of the finding ('Nmap', 'Nuclei', 'GVM').
    source = Column(String(50), nullable=False, index=True)

    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    host_id = Column(Integer, ForeignKey('hosts.id'), nullable=True)
    host = relationship("Host", back_populates="vulnerabilities")

# --- Original & Raw Data Models (We keep these) ---

class NetworkPacket(Base):
    __tablename__ = "network_packets"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False)
    source_ip = Column(String(45), nullable=False)
    destination_ip = Column(String(45), nullable=False)
    source_mac = Column(String(17), nullable=True)
    destination_mac = Column(String(17), nullable=True)
    protocol = Column(String(10), nullable=False)
    length = Column(Integer, nullable=False)
    source_port = Column(Integer, nullable=True)
    destination_port = Column(Integer, nullable=True)
    ttl = Column(Integer, nullable=True)
    flags = Column(String(10), nullable=True)

class NetworkPort(Base):
    __tablename__ = "network_ports"
    id = Column(Integer, primary_key=True, index=True)
    host_ip = Column(String(45), index=True)
    port_number = Column(Integer, nullable=False)
    protocol = Column(String(10), nullable=False)
    service_name = Column(String(100), nullable=True)
    timestamp = Column(DateTime)
    host_id = Column(Integer, ForeignKey('hosts.id'), nullable=True)
    host = relationship("Host", back_populates="ports")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)



class SecurityAlert(Base):
    __tablename__ = "security_alerts"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    source_ip = Column(String(45), index=True) 
    source_port = Column(Integer)
    destination_ip = Column(String(45), index=True) 
    destination_port = Column(Integer)
    protocol = Column(String(10)) 
    severity = Column(String(50))
    signature = Column(String(255))
    event_type = Column(String(50))
    raw_log = Column(Text, nullable=True)


class Host(Base):
    __tablename__ = 'hosts'
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(45), unique=True, index=True, nullable=False)
    mac_address = Column(String(17), nullable=True)
    hostname = Column(String(255), nullable=True)
    os_name = Column(String(255), nullable=True)
    vendor = Column(String(255), nullable=True)
    status = Column(String(10), default='down', nullable=False)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), default=func.now, onupdate=func.now, nullable=False)
    ports = relationship("NetworkPort", back_populates="host", cascade="all, delete-orphan")
    vulnerabilities = relationship("Vulnerability", back_populates="host", cascade="all, delete-orphan")