#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# --- This part runs as ROOT ---
# Read the secret file and export its content as an environment variable.
# This variable will be available to the child process.
export ELASTIC_PASSWORD=$(cat /run/secrets/elastic_password)
export HEALTHCHECK_PASSWORD=$(cat /run/secrets/healthcheck_password)
# Fix permissions on the main script
chmod +x /usr/local/bin/setup-elastic.sh

# --- Dropping Privileges ---
# Use su-exec (a lightweight tool similar to gosu) to switch from the root user
# to a non-root user ('curl_user', for example, but we will use UID 1000)
# and then execute the main command passed to this script ("$@").
exec su-exec 1000:1000 "$@"
