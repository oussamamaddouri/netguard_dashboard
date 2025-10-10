import os
import sys
import nmap
import logging
import time
from datetime import datetime, timezone

# Add project root to path to allow importing from the 'app' module
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Imports from YOUR application code
from app.database import SessionLocal
from app.models import Host, NetworkPort, Vulnerability
from sqlalchemy import select, update, delete, text

# Configure logging for this specific service
logging.basicConfig(level=logging.INFO, format='%(asctime)s - SCANNER - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)



def wait_for_db_tables(max_retries=15, delay=10):
    """
    Waits for the essential 'hosts' table to be created in the database.
    This prevents the scanner from crashing if it starts before the main app
    has initialized the database schema.
    """
    logger.info("Verifying that database tables are ready...")
    for attempt in range(max_retries):
        db = None
        try:
            db = SessionLocal()
            # Use a simple, efficient query to check if the 'hosts' table exists.
            db.execute(text("SELECT 1 FROM hosts LIMIT 1"))
            logger.info("✅ Database tables are ready.")
            return True
        except Exception as e:
            # Check for the specific error related to the missing table
            if 'relation "hosts" does not exist' in str(e):
                 logger.warning(f"Database tables not ready yet. Retrying in {delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                 time.sleep(delay)
            else:
                 # Log other unexpected DB errors but still retry
                 logger.error(f"An unexpected database error occurred while waiting: {e}")
                 time.sleep(delay)
        finally:
            if db:
                db.close()
    
    logger.error(f"FATAL: Database tables did not become available after {max_retries} attempts. Exiting.")
    return False


def parse_vulnerability_scripts(host_data: dict, host_ip: str, host_id: int):
    """
    Parses nmap script outputs for vulnerabilities.
    """
    vulnerabilities = []
    SCAN_SOURCE = 'Nmap'

    for proto in host_data.all_protocols():
        if proto not in ['tcp', 'udp']: continue
        
        for port, port_data in host_data[proto].items():
            if port_data.get('state') != 'open' or 'script' not in port_data: continue

            service_name = f"{port_data.get('product', '')} {port_data.get('version', '')}".strip() or port_data.get('name', 'unknown')

            if 'vulners' in port_data['script']:
                for line in port_data['script']['vulners'].split('\n'):
                    if 'CVE-' in line:
                        parts = line.strip().split()
                        cve = next((p for p in parts if p.startswith('CVE-')), None)
                        if not cve: continue

                        try:
                            score = float(parts[0])
                            if score >= 9.0: severity = "Critical"
                            elif score >= 7.0: severity = "High"
                            elif score >= 4.0: severity = "Medium"
                            else: severity = "Low"
                        except ValueError:
                            severity = "Info"
                        
                        vulnerabilities.append(Vulnerability(
                            host_ip=host_ip, port=int(port), service=service_name,
                            severity=severity, cve=cve,
                            description=' '.join(parts[1:]), source=SCAN_SOURCE, host_id=host_id
                        ))
    return vulnerabilities

def discover_hosts(db, cidr: str) -> list[str]:
    """
    Performs a fast ping scan to find live hosts.
    """
    logger.info("--- Stage 1: Host Discovery ---")
    logger.info(f"Pinging hosts in CIDR: {cidr}...")
    nm = nmap.PortScanner()
    nm.scan(hosts=cidr, arguments='-sn -T4')
    live_hosts_ips = sorted(nm.all_hosts())
    logger.info(f"Discovery complete. Found {len(live_hosts_ips)} live host(s): {live_hosts_ips}")

    db.execute(update(Host).values(status="down"))

    for ip in live_hosts_ips:
        host = db.scalars(select(Host).where(Host.ip_address == ip)).first()
        if host:
            host.status = 'up'
        else:
            logger.info(f"New host found: {ip}. Creating new record.")
            host = Host(ip_address=ip, status='up', hostname='N/A', os_name='Unknown')
            db.add(host)
    
    db.commit()
    return live_hosts_ips

def scan_ports_and_details(db, host_ip: str):
    """
    Performs a service and OS scan on a single host.
    """
    logger.info(f"--- Stage 2: Port & OS Scan for {host_ip} ---")
    nm = nmap.PortScanner()
    nm.scan(hosts=host_ip, arguments='-sV -O -T4 -Pn')

    if host_ip not in nm.all_hosts():
        logger.warning(f"Host {host_ip} went offline during port scan. Skipping.")
        return

    host_data = nm[host_ip]
    host = db.scalars(select(Host).where(Host.ip_address == host_ip)).one()

    host.hostname = host_data.hostname() or 'N/A'
    host.mac_address = host_data['addresses'].get('mac')
    host.vendor = next(iter(host_data.get('vendor', {}).values()), None)
    host.os_name = next((match['name'] for match in host_data.get('osmatch', []) if 'name' in match), "Unknown OS")

    db.execute(delete(NetworkPort).where(NetworkPort.host_id == host.id))
    db.flush()

    ports_added_count = 0
    for proto in host_data.all_protocols():
        if proto in ['tcp', 'udp']:
            for port, data in host_data[proto].items():
                if data['state'] == 'open':
                    db.add(NetworkPort(
                        host_ip=host_ip, port_number=int(port), protocol=proto,
                        service_name=f"{data.get('product', '')} {data.get('version', '')}".strip() or data.get('name', 'unknown'),
                        timestamp=datetime.now(timezone.utc), host_id=host.id
                    ))
                    ports_added_count += 1
    
    if ports_added_count > 0:
        logger.info(f"Found and saved {ports_added_count} open ports for {host_ip}.")
    db.commit()

def scan_vulnerabilities(db, host_ip: str):
    """
    Performs a vulnerability scan on a single host.
    """
    logger.info(f"--- Stage 3: Vulnerability Scan for {host_ip} ---")
    nm = nmap.PortScanner()
    nm.scan(hosts=host_ip, arguments='-sV --script vuln -T4 -Pn')
    
    if host_ip not in nm.all_hosts():
        logger.warning(f"Host {host_ip} went offline during vulnerability scan. Skipping.")
        return

    host_data = nm[host_ip]
    host = db.scalars(select(Host).where(Host.ip_address == host_ip)).one()

    db.execute(delete(Vulnerability).where(Vulnerability.host_id == host.id, Vulnerability.source == 'Nmap'))
    db.flush()

    new_vulns = parse_vulnerability_scripts(host_data, host_ip, host.id)
    if new_vulns:
        db.add_all(new_vulns)
        logger.info(f"Found and saved {len(new_vulns)} potential vulnerabilities on {host_ip}.")

    db.commit()






def run_scan_cycle():
    """
    Main orchestrated scan cycle.
    """
    cidr = os.environ.get("SCAN_TARGET_CIDR")
    if not cidr:
        logger.error("FATAL: SCAN_TARGET_CIDR environment variable not set. Exiting.")
        return

    logger.info("--- Starting New Scan Cycle ---")
    db = SessionLocal()
    try:
        live_hosts_ips = discover_hosts(db, cidr)
        for ip in live_hosts_ips:
            try:
                scan_ports_and_details(db, ip)
                scan_vulnerabilities(db, ip)
                logger.info(f"✅ Successfully completed all scans for {ip}.")
            except Exception as e:
                 logger.error(f"An error occurred while scanning host {ip}. Rolling back changes for this host. Error: {e}", exc_info=True)
                 db.rollback()
        
    except Exception as e:
        logger.error(f"A critical error occurred in the main scan cycle. Error: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()
        logger.info("--- Scan Cycle Complete ---")

if __name__ == "__main__":
    logger.info("Scanner service started. Waiting for dependent services...")
    time.sleep(15) 
    
    # NEW: Wait for DB tables to be created by the main app
    if not wait_for_db_tables():
        sys.exit(1) # Exit if tables are not found after retries
    
    while True:
        run_scan_cycle()
        logger.info("Scanner is sleeping for 30 minutes...")
        time.sleep(1800)