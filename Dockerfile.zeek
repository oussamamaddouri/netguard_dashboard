# Start from the stable Ubuntu LTS base image.
FROM ubuntu:22.04

# Avoid interactive prompts during the build process.
ENV DEBIAN_FRONTEND=noninteractive

# STEP 1: Install prerequisites for adding a new repository.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    bash \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# STEP 2: Add the official Zeek repository and install Zeek LTS.
RUN echo "deb http://download.opensuse.org/repositories/security:/zeek/xUbuntu_22.04/ /" > /etc/apt/sources.list.d/security-zeek.list \
    && curl -fsSL "https://download.opensuse.org/repositories/security:zeek/xUbuntu_22.04/Release.key" | gpg --dearmor -o /etc/apt/trusted.gpg.d/security-zeek.gpg \
    && apt-get update && apt-get install -y --no-install-recommends zeek-lts \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# STEP 3: Copy your automation script into the container.
COPY process_pcaps.sh /usr/local/bin/process_pcaps.sh
RUN chmod +x /usr/local/bin/process_pcaps.sh

# STEP 4: Set the final working directory.
WORKDIR /opt/zeek