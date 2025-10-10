# elastic-setup.dockerfile

FROM curlimages/curl:latest
WORKDIR /scripts

COPY setup-elastic.sh .
COPY zeek_template.json .
COPY suricata_template.json .

# --- THIS IS THE FIX ---
# Switch to the root user to gain permission to run chmod
USER root
# -------------------------

RUN chmod +x setup-elastic.sh
CMD ["./setup-elastic.sh"]
