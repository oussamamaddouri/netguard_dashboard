#!/bin/sh
set -e

if [ -n "$ELASTIC_PASSWORD_FILE" ]; then
    export ELASTIC_PASSWORD=$(cat "$ELASTIC_PASSWORD_FILE")
fi


# Define variables for curl for easier reading
ES_URL="https://elasticsearch:9200"
CURL_OPTS="--cacert /certs/ca/ca.crt -u elastic:${ELASTIC_PASSWORD}"

# Wait for Elasticsearch to be ready using HTTPS
until curl -s $CURL_OPTS "${ES_URL}/_cluster/health?wait_for_status=yellow" > /dev/null; do
  echo "Waiting for Elasticsearch to be ready..."
  sleep 5
done
echo "Elasticsearch is ready."


echo "Creating/Updating healthcheck user..."
curl -X PUT $CURL_OPTS "${ES_URL}/_security/user/health_user" -H "Content-Type: application/json" -d"
{
  \"password\": \"${HEALTHCHECK_PASSWORD}\",
  \"roles\": [ \"monitoring_user\" ],
  \"full_name\": \"Internal Healthcheck User\"
}"
echo "" # for a newline
echo "Healthcheck user configured."


# 1. Create the Index Lifecycle Policy
POLICY_NAME="netguard-delete-after-30-days"
POLICY_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" $CURL_OPTS "${ES_URL}/_ilm/policy/${POLICY_NAME}")
if [ "$POLICY_EXISTS" -eq "404" ]; then
  echo "Creating ILM policy: ${POLICY_NAME}"
  curl -X PUT $CURL_OPTS "${ES_URL}/_ilm/policy/${POLICY_NAME}" -H "Content-Type: application/json" -d'
  { "policy": { "phases": { "hot": {"min_age":"0ms","actions":{"rollover":{"max_age":"7d","max_size":"25gb"}}}, "delete": {"min_age":"30d","actions":{"delete":{}}} } } }'
else
  echo "ILM policy already exists."
fi

# 2. Create the Suricata Index Template
echo "Creating/Updating Suricata index template..."
curl -X PUT $CURL_OPTS "${ES_URL}/_index_template/netguard-suricata-template" -H "Content-Type: application/json" -d'
{ "index_patterns": ["netguard-suricata-*"], "template": { "settings": { "index.lifecycle.name": "netguard-delete-after-30-days", "index.lifecycle.rollover_alias": "suricata-logs" }, "mappings": { "properties": { "@timestamp": { "type": "date" }, "src_ip": { "type": "ip" }, "dest_ip": { "type": "ip" }, "proto": { "type": "keyword" }, "event_type": { "type": "keyword" } } } } }'

# 3. Create the Zeek Index Template
echo "Creating/Updating Zeek index template..."
curl -X PUT $CURL_OPTS "${ES_URL}/_index_template/netguard-zeek-template" -H "Content-Type: application/json" -d'
{ "index_patterns": ["netguard-zeek-*"], "template": { "settings": { "index.lifecycle.name": "netguard-delete-after-30-days", "index.lifecycle.rollover_alias": "zeek-logs" }, "mappings": { "properties": { "@timestamp": { "type": "date" }, "id_orig_h": { "type": "ip" }, "id_orig_p": { "type": "long" }, "id_resp_h": { "type": "ip" }, "id_resp_p": { "type": "long" }, "proto": { "type": "keyword" }, "conn_state": { "type": "keyword" }, "service": { "type": "keyword" } } } } }'

# 4. Bootstrap the Suricata Alias
SURICATA_ALIAS_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" $CURL_OPTS "${ES_URL}/_alias/suricata-logs")
if [ "$SURICATA_ALIAS_EXISTS" -eq "404" ]; then
  echo "Bootstrapping Suricata rollover alias."
  curl -X PUT $CURL_OPTS "${ES_URL}/netguard-suricata-000001" -H "Content-Type: application/json" -d'
  { "aliases": { "suricata-logs": { "is_write_index": true } } }'
else
  echo "Suricata rollover alias already exists."
fi

# 5. Bootstrap the Zeek Alias
ZEEK_ALIAS_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" $CURL_OPTS "${ES_URL}/_alias/zeek-logs")
if [ "$ZEEK_ALIAS_EXISTS" -eq "404" ]; then
  echo "Bootstrapping Zeek rollover alias."
  curl -X PUT $CURL_OPTS "${ES_URL}/netguard-zeek-000001" -H "Content-Type: application/json" -d'
  { "aliases": { "zeek-logs": { "is_write_index": true } } }'
else
  echo "Zeek rollover alias already exists."
fi

echo "Elasticsearch setup is complete."
