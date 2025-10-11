#!/bin/bash

set -e



# --- Helper Functions ---
update_env_var() {
  local var_name=$1
  local var_value=$2
  if ! grep -q "^${var_name}=" .env; then
    echo "${var_name}=${var_value}" >> .env
  else
    # Use a different separator for sed to handle complex values like URLs
    sed -i "/^${var_name}=/c\\${var_name}=${var_value}" .env
  fi
}

# --- Stage 1: Ensuring All Scripts Are Executable ---
# (This section remains unchanged)
echo "--- Stage 1: Making all shell scripts in the project executable ---"
find . -type f -name "*.sh" -print0 | xargs -0 chmod +x
echo "✅ All .sh scripts are now executable."
echo ""

echo ""
rm -rf backend/venv/ build/ node_modules/ packet_stream/ package-lock.json .env .secrets/
 find . -type d -name '__pycache__' -exec rm -r {} +

# --- ASCII Art ---
clear


# Define required packages and find which ones are missing
required_packages=("figlet" "toilet")
packages_to_install=()
for pkg in "${required_packages[@]}"; do
    if ! command -v "$pkg" &> /dev/null; then
        packages_to_install+=("$pkg")
    fi
done

# If packages are missing, show a simple message and install them silently
if [ ${#packages_to_install[@]} -gt 0 ]; then
    sudo apt-get update -y > /dev/null 2>&1
    sudo apt-get install -y "${packages_to_install[@]}" > /dev/null 2>&1
    # You can add a "Done" message, but the cool banner appearing is a good signal itself
    # echo "✅ Done."
    echo ""
fi

# Final check: Display the welcome screen based on what's available
if command -v figlet &> /dev/null && command -v toilet &> /dev/null; then
    # This will now run if the tools were already there OR if our install just succeeded
    figlet -c "Welcome"
    figlet -c "To"
    toilet -f big -F gay "CybersecurityX"
    echo ">>> Disrupt. Expose. Prevail. <<<"
else
    # This only runs as a fallback if the installation failed
    echo "##################################################"
    echo "### Welcome to the CybersecurityX Setup Script ###"
    echo "##################################################"
    echo "(INFO: Attempted to install 'figlet' and 'toilet' automatically but failed.)"
fi
echo ""


# --- Stage 1.5: Pre-flight System Check & Automatic Installation ---
echo "--- Stage 1.5: Checking for required tools ---"

# This variable will hold our docker command. It may be 'docker' or 'sudo docker'.
DOCKER_CMD=""
COMPOSE_CMD=""

# The most reliable check is to see if we can actually connect to the docker daemon.
if docker ps &> /dev/null; then
    echo "INFO: Docker is installed and permissions are correct."
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker compose"
else
    echo "WARNING: Docker is not installed or the current user lacks permissions."    
    # Prompt for sudo password once at the beginning of the install process.
    sudo -v
    
    # Run the installation using the stored sudo credentials.
    sudo apt-get update -y > /dev/null
    sudo apt-get install -y ca-certificates curl > /dev/null
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    
    # <<< THE FIX IS HERE: Ensure the sources directory exists before writing to it >>>
    sudo mkdir -p /etc/apt/sources.list.d

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      
    sudo apt-get update -y > /dev/null
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add the current user to the docker group for FUTURE convenience (after next login).
    sudo usermod -aG docker $USER
    
    # For THIS script run, we must use sudo to run docker.
    DOCKER_CMD="sudo docker"
    COMPOSE_CMD="sudo docker compose"
    
    echo "✅ Docker installed successfully."
    echo "INFO: The script will use 'sudo' for all Docker commands for this session."
    echo "NOTE: For future runs, you have been added to the 'docker' group. Please log out and log back in after the script finishes."
fi

echo "INFO: Using '$COMPOSE_CMD' for Docker operations."

# Check for other required tools (installation requires sudo)
if ! command -v "python3" &> /dev/null || ! command -v "npm" &> /dev/null || ! command -v "ip" &> /dev/null || ! command -v "openssl" &> /dev/null; then
    echo "INFO: Installing other required tools (Python, NPM, IP tools, OpenSSL)..."
    # Add 'openssl' to the list of packages to install
    sudo apt-get install -y python3-full npm iproute2 openssl
fi
echo "✅ All required tools are present."
echo ""








# --- Stage 2: Setting up Python Host Environment ---
# (This section remains unchanged)
echo "--- Stage 2: Setting up Python virtual environment for host-side scripts ---"
REQUIREMENTS_FILE="backend/requirements.txt"
VENV_DIR="backend/venv"

if [ -f "$REQUIREMENTS_FILE" ]; then
    if [ ! -d "$VENV_DIR" ]; then
        echo "INFO: Creating Python virtual environment in '$VENV_DIR'..."
        python3 -m venv "$VENV_DIR"
    else
        echo "INFO: Python virtual environment already exists."
    fi

    echo "INFO: Installing/updating Python dependencies from '$REQUIREMENTS_FILE'..."
    (
        source "${VENV_DIR}/bin/activate"
        python3 -m pip install --upgrade pip > /dev/null
        python3 -m pip install -r "$REQUIREMENTS_FILE"
    )
    echo "✅ Host Python environment is ready."
    echo "   To use it manually: source ${VENV_DIR}/bin/activate"
else
    echo "WARNING: Could not find '$REQUIREMENTS_FILE'. Skipping Python venv setup."
fi
echo ""




echo "--- Stage 3: Preparing Node.js dependencies for Docker build ---"
if [ -f "package.json" ]; then
    echo "INFO: Found package.json. Preparing to install dependencies."

    # --- Check for Yarn, the preferred and more stable installer ---
    if ! command -v yarn &> /dev/null; then
        echo "INFO: Yarn not found. Attempting to install it globally via npm..."
        # Use npm to install yarn itself, which is a simpler, more reliable operation.
        if ! sudo npm install -g yarn; then
            echo "WARN: npm failed to install yarn. Attempting to install via apt..."
            sudo apt-get update -y
            sudo apt-get install -y yarn
        fi
    fi

    # Check one last time, and exit if Yarn is still not available.
    if ! command -v yarn &> /dev/null; then
        echo "ERROR: CRITICAL! Yarn could not be installed. Cannot proceed with Node.js setup."
        exit 1
    fi
    
    echo "INFO: Using Yarn for a more stable installation."

    # --- Pristine Cleanup ---
    # Force a clean slate by removing old files from previous failed attempts.
    echo "INFO: Performing pristine cleanup by removing node_modules and lock files..."
    rm -rf node_modules package-lock.json yarn.lock

    echo "INFO: Running 'yarn install' (this may take a long time on slow networks)..."
    if ! yarn install; then
        echo "ERROR: 'yarn install' failed. The network may be too unstable to continue."
        exit 1
    fi
    
    echo "✅ Node.js dependencies are now ready for the Docker build."
else
    echo "WARNING: 'package.json' not found. If the Docker build needs a 'node_modules' directory, it may fail."
fi
echo ""
echo "--- Stage 3.5: Configuring System Environment ---"
> .env
echo "INFO: Cleared previous .env file."

INTERFACE=$(ip -4 route ls | grep default | grep -Po '(?<=dev )(\S+)' | head -1)
[ -z "$INTERFACE" ] && { echo "ERROR: Could not automatically detect network interface. Exiting."; exit 1; }
update_env_var "IFACE" "$INTERFACE"
echo "INFO: Network interface detected as: ${INTERFACE}."

echo "INFO: Dynamically setting interface in suricata.yaml to '${INTERFACE}'..."
sed -i "s/^\(\s*interface:\s*\).*/\1${INTERFACE}/" suricata.yaml
echo "INFO: suricata.yaml has been updated."

SCAN_TARGET_CIDR=$(ip -o -f inet addr show "$INTERFACE" | awk '/scope global/ {print $4}' | head -1)
[ -z "$SCAN_TARGET_CIDR" ] && { echo "ERROR: Could not automatically detect network CIDR. Exiting."; exit 1; }
update_env_var "SCAN_TARGET_CIDR" "$SCAN_TARGET_CIDR"
echo "INFO: LAN scan target automatically set to: ${SCAN_TARGET_CIDR}."
echo ""


SERVER_IP=${SCAN_TARGET_CIDR%/*}
update_env_var "SERVER_HOSTNAME" "$SERVER_IP"
echo "INFO: Extracted server hostname for Nginx/Kibana: ${SERVER_IP}."






echo "--- Stage 4: Setting up all credentials and application configuration ---"

if [ -z "$MASTER_PASSWORD" ]; then
  echo "ERROR: The MASTER_PASSWORD environment variable is not set."
  exit 1
fi
echo "✅ MASTER password received from environment."






echo "INFO: Creating local secret files..."
mkdir -p ./.secrets

# The '-n' flag is the CRITICAL FIX. It prevents echo from adding a newline.
echo -n "$MASTER_PASSWORD" > ./.secrets/postgres_password.secret
echo -n "$MASTER_PASSWORD" > ./.secrets/elastic_password.secret
echo "INFO: Generating secure encryption keys for Kibana..."
openssl rand -hex 32 > ./.secrets/kibana_security_key.secret
openssl rand -hex 32 > ./.secrets/kibana_savedobjects_key.secret
openssl rand -hex 32 > ./.secrets/kibana_reporting_key.secret
openssl rand -base64 32 > ./.secrets/healthcheck_password.secret


chmod 600 ./.secrets/*
echo "✅ Local secret files created."
echo ""

# --- CRITICAL SECURITY STEP: Ensure secrets are not committed to Git ---
if [ -f ".gitignore" ]; then
    # Add the secrets directory to .gitignore if it's not already there
    grep -qxF ".secrets/" .gitignore || echo ".secrets/" >> .gitignore
else
    # Create a .gitignore file if it doesn't exist
    echo ".secrets/" > .gitignore
fi
echo "INFO: Ensured secret files are ignored by Git."
echo ""




echo "INFO: Saving NON-SENSITIVE configuration to the .env file..."

# Define static user/db names
DB_USER="netguard_user"
DB_NAME="netguard_db"

# Write all necessary NON-SENSITIVE variables to the .env file
update_env_var "IFACE" "$INTERFACE"
update_env_var "SCAN_TARGET_CIDR" "$SCAN_TARGET_CIDR"
update_env_var "SERVER_HOSTNAME" "$SERVER_IP"
update_env_var "ELASTIC_VERSION" "8.19.4"
update_env_var "ELASTIC_USER" "elastic"
update_env_var "POSTGRES_USER" "$DB_USER"
update_env_var "POSTGRES_DB" "$DB_NAME"
update_env_var "DB_HOST" "db"
update_env_var "DB_PORT" "5432"

# Note: ELASTIC_PASSWORD, POSTGRES_PASSWORD, and DATABASE_URL are now REMOVED from .env
# The backend application will construct its own DATABASE_URL using secrets.

echo "✅ .env file has been configured with non-sensitive data."
echo ""



# --- Stage 4.5: Preparing Host & Docker Environment ---
echo "--- Stage 4.5: Preparing Host & Docker Environment ---"
echo "INFO: Checking for and disabling any conflicting host services..."
if command -v systemctl &> /dev/null; then
    # This will attempt to stop/disable and continue even if it fails (|| true)
    sudo systemctl disable --now suricata || true > /dev/null 2>&1
fi
sudo pkill -f suricata || true
echo "INFO: Host is clean."

echo "INFO: Removing obsolete 'version' tag from docker-compose.yml to prevent warnings..."
# Use sed -i.bak to be safer, but the original script uses this.
sed -i '/^version:/d' docker-compose.yml

echo "INFO: Tearing down any previous Docker instances to ensure a clean start..."
if ! $COMPOSE_CMD --env-file .env down -v --remove-orphans; then
    echo "Notice: '$COMPOSE_CMD down' reported an error. This is normal on the first run."
fi

echo "INFO: Performing a deep clean of Docker resources (unused volumes, images, cache)..."
$DOCKER_CMD system prune -af --volumes
echo "INFO: Docker system is clean."



# --- Stage 5: Building and Starting Docker Services ---
echo "--- Stage 5: Starting services in sequence to ensure stability ---"
export COMPOSE_HTTP_TIMEOUT=180

echo "INFO: Starting database and Elasticsearch services..."
$COMPOSE_CMD --env-file .env up -d db elasticsearch

echo "INFO: Waiting for dependencies to initialize (this may take up to a minute)..."
while [ -z "$($COMPOSE_CMD ps -a | grep 'postgres_db' | grep '(healthy)')" ] || [ -z "$($COMPOSE_CMD ps -a | grep 'elasticsearch' | grep '(healthy)')" ]; do
    printf "."
    sleep 5
done
echo ""
echo "✅ SUCCESS: Database and Elasticsearch are healthy."


echo "INFO: Force-rebuilding custom services to bypass cache..."
$COMPOSE_CMD --env-file .env build --no-cache elastic-setup zeek netguard_app packet-streamer nmap-scanner


echo "INFO: Starting all remaining application services..."
if ! $COMPOSE_CMD --env-file .env up -d --no-build; then
    echo "ERROR: Docker Compose failed to start the main application stack. Please check the logs."
    exit 1
fi


echo "--- Stage 6: Configuring SSL Certificate ---"
echo "INFO: The following script will ask for your domain name, email,"
echo "      and will require sudo privileges to set up a trusted SSL certificate."
sudo ./ssl.sh
echo "INFO: SSL certificate configured. Restarting Nginx to apply changes..."
$COMPOSE_CMD --env-file .env restart nginx
echo "✅ Frontend secured successfully."
echo ""


echo "--- Final Step: Resetting file permissions for the runner ---"
# The $SUDO_USER variable holds the name of the user who called sudo (e.g., 'cybersecurityx')
# We recursively change the ownership of the entire directory back to that user.
chown -R $SUDO_USER:$SUDO_USER .
echo "✅ Permissions reset."
echo ""


echo ""
echo "================================================================"
echo "✅✅✅         ENVIRONMENT SETUP IS COMPLETE!         ✅✅✅"
echo "================================================================"
echo ""
  
