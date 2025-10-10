#!/bin/sh
# This script waits for a file to have content before executing another command.

# Exit immediately if a command fails
set -e

PCAP_FILE="/stream/live.pcap"
echo "[$0] Waiting for pcap file at ${PCAP_FILE} to contain data..."

while [ ! -s "${PCAP_FILE}" ]; do
  sleep 2
done

echo "[$0] Pcap file has data. Executing command: $@"
# Replace the script's own process with the command passed as arguments
exec "$@"