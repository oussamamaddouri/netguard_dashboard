#!/bin/bash

# Directory where Suricata drops PCAP files
PCAP_DIR="/pcaps"
# Directory to store Zeek logs
LOG_DIR="/opt/zeek/logs"
# Directory to move processed PCAPs to
PROCESSED_DIR="/pcaps/processed"
# Define retention period for old PCAPs in days
RETENTION_DAYS=7

# Define the full path to the Zeek executable
ZEEK_CMD="/opt/zeek/bin/zeek"

echo "PCAP processing script started. Watching ${PCAP_DIR} for files..."

mkdir -p "${PROCESSED_DIR}"
mkdir -p "${LOG_DIR}"

while true; do
  # Find and delete any processed pcap files older than the retention period.
  echo "Cleaning up old processed PCAPs (older than ${RETENTION_DAYS} days)..."
  find "${PROCESSED_DIR}" -name "pcap.*" -type f -mtime +${RETENTION_DAYS} -delete

  echo "Scanning for completed PCAP files..."
  # Use a 3-second stability wait time (+0.05 minutes)
  find "${PCAP_DIR}" -maxdepth 1 -type f -name "*pcap*" -mmin +0.05 -print0 | while IFS= read -r -d $'\0' file; do
    echo "Found PCAP file: ${file}"
    
    # Change into the log directory to ensure Zeek writes logs here
    cd "${LOG_DIR}"

    # Run Zeek against the found pcap file
    ${ZEEK_CMD} -r "${file}" local.zeek

    if [ $? -eq 0 ]; then
      echo "Successfully processed ${file} with Zeek."
      mv "${file}" "${PROCESSED_DIR}/"
    else
      echo "ERROR: Zeek failed to process ${file}. It will be moved to an 'errored' directory."
      mkdir -p "${PROCESSED_DIR}/errored"
      mv "${file}" "${PROCESSED_DIR}/errored/"
    fi
  done
  
  # Check for new files every 1 second
  echo "Scan complete. Waiting for 1 second before the next scan."
  sleep 1
done