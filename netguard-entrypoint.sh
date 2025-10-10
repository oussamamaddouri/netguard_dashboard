#!/bin/sh

# This script is run by Docker as the root user when the container starts.

# Abort on any error
set -e

# Read the secrets from their root-only files and export them
# as environment variables. These will be available to the application process.
export ELASTIC_PASSWORD=$(cat /run/secrets/elastic_password)
export DB_PASSWORD=$(cat /run/secrets/postgres_password)

# IMPORTANT: Drop privileges from root to the specified non-root user ('netguard' here).
# Then, execute the main command passed to this script (from the Dockerfile's CMD).
# The "$@" represents whatever command is in the Dockerfile's CMD.
exec gosu netguard "$@"
