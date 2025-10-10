#!/bin/bash
set -e

# === SCRIPT START ===
echo "--- Starting Automated Local SSL Certificate Generation ---"

# 1. Check for required '.env' file.
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please create a .env file with a SERVER_HOSTNAME entry (e.g., SERVER_HOSTNAME=192.168.1.10)."
    exit 1
fi

# 2. Source the .env file to load variables.
source .env

# 3. Check if SERVER_HOSTNAME is set.
if [ -z "$SERVER_HOSTNAME" ]; then
  echo "ERROR: SERVER_HOSTNAME is not set in your .env file."
  echo "Please set it to the IP address of this machine."
  exit 1
fi

echo "--- Target IP Address found: ${SERVER_HOSTNAME} ---"

# 4. Define the output directory for SSL certificates.
SSL_DIR="./nginx/ssl"

# Create the directory if it doesn't exist.
mkdir -p "$SSL_DIR"

# 5. Generate the Self-Signed Certificate using OpenSSL.
# This command is non-interactive due to the "-subj" flag.
# It creates a certificate valid for 365 days.
echo "INFO: Generating new self-signed certificate..."
openssl req -x509 \
  -newkey rsa:4096 \
  -keyout "${SSL_DIR}/privkey.pem" \
  -out "${SSL_DIR}/fullchain.pem" \
  -sha256 \
  -days 365 \
  -nodes \
  -subj "/CN=${SERVER_HOSTNAME}"

echo "✅ Certificate and Private Key have been generated successfully in ${SSL_DIR}/"
echo ""
echo "--- SSL Script Finished ---"
