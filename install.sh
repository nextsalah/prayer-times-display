#!/bin/bash
set -e

# Script for installing Prayer Times Display
REPO_OWNER=${REPO_OWNER:-"nextsalah"}
REPO_NAME=${REPO_NAME:-"prayer-times-display"}
INSTALL_DIR=${INSTALL_DIR:-"/opt/prayer-times-display"}
LOG_FILE="$INSTALL_DIR/install.log"

# Function for logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>/dev/null || true
}

# Create installation directory if it doesn't exist
sudo mkdir -p "$INSTALL_DIR"
sudo chown "$(whoami):$(whoami)" "$INSTALL_DIR"
touch "$LOG_FILE" || true

log "Starting installation of Prayer Times Display..."

# Check if already installed and get current version
CURRENT_VERSION=""
if [ -f "$INSTALL_DIR/package.json" ]; then
  CURRENT_VERSION=$(grep -o '"version": *"[^"]*"' "$INSTALL_DIR/package.json" | cut -d'"' -f4)
  log "Found existing installation, version: $CURRENT_VERSION"
fi

# Determine the release version (fetch latest if not specified)
if [ -z "$VERSION" ] || [ "$VERSION" = "latest" ]; then
  log "Fetching latest release version..."
  VERSION=$(curl -s https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest | 
            grep -o '"tag_name": *"[^"]*"' | cut -d'"' -f4)
  
  if [ -z "$VERSION" ]; then
    log "Error: Failed to fetch latest version from GitHub. Check your internet connection or repository access."
    exit 1
  fi
  
  log "Latest version: $VERSION"
fi

# Remove leading "v" if present (for URL construction)
VERSION_CLEAN="${VERSION#v}"

# Check if we're already on the latest version
if [ "$CURRENT_VERSION" = "$VERSION_CLEAN" ]; then
  log "Already running the latest version ($VERSION_CLEAN). No update needed."
  exit 0
fi

# Check if Bun is installed; if not, install it
if ! command -v bun &> /dev/null; then
  log "Installing Bun runtime..."
  curl -fsSL https://bun.sh/install | bash
  
  # Source the appropriate profile file to make bun available
  if [ -f "$HOME/.bashrc" ]; then
    source "$HOME/.bashrc"
  elif [ -f "$HOME/.profile" ]; then
    source "$HOME/.profile"
  elif [ -f "$HOME/.zshrc" ]; then
    source "$HOME/.zshrc"
  fi
  
  # Add bun to PATH for this session if not available
  if ! command -v bun &> /dev/null; then
    export PATH="$HOME/.bun/bin:$PATH"
  fi
  
  # Verify bun is now available
  if ! command -v bun &> /dev/null; then
    log "Error: Failed to install or access Bun. Please install manually and retry."
    exit 1
  fi
fi

# Create temporary directory for downloads
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# Download the release tarball from GitHub
TARBALL_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$VERSION/prayer-times-display-$VERSION_CLEAN.tar.gz"
log "Downloading release tarball from $TARBALL_URL..."

# Download with proper error handling
if ! curl -L --fail -o "$TMP_DIR/release.tar.gz" "$TARBALL_URL"; then
  # Try alternate URL format if the first one fails
  TARBALL_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$VERSION/prayer-times-display-v$VERSION_CLEAN.tar.gz"
  log "First download attempt failed. Trying alternate URL: $TARBALL_URL"
  
  if ! curl -L --fail -o "$TMP_DIR/release.tar.gz" "$TARBALL_URL"; then
    log "Error: Failed to download release. Please check the version and repository."
    exit 1
  fi
fi

# Verify the download was successful
if [ ! -s "$TMP_DIR/release.tar.gz" ]; then
  log "Error: Downloaded file is empty. Installation failed."
  exit 1
fi

# Extract the tarball
log "Extracting release tarball..."
mkdir -p "$TMP_DIR/extract"
if ! tar -xzf "$TMP_DIR/release.tar.gz" -C "$TMP_DIR/extract"; then
  log "Error: Failed to extract the tarball. The file might be corrupted."
  exit 1
fi

# Find the directory containing the app
EXTRACT_DIR="$TMP_DIR/extract"
if [ -d "$TMP_DIR/extract/prayer-times-display" ]; then
  EXTRACT_DIR="$TMP_DIR/extract/prayer-times-display"
elif [ -d "$TMP_DIR/extract/app" ]; then
  EXTRACT_DIR="$TMP_DIR/extract/app"
fi

# Backup current installation if it exists
if [ -d "$INSTALL_DIR/node_modules" ] || [ -f "$INSTALL_DIR/package.json" ]; then
  BACKUP_DIR="$INSTALL_DIR.backup-$(date +%Y%m%d%H%M%S)"
  log "Backing up current installation to $BACKUP_DIR"
  cp -a "$INSTALL_DIR" "$BACKUP_DIR"
fi

# Stop the service if it's running
if systemctl is-active --quiet prayer-times.service; then
  log "Stopping prayer-times service..."
  sudo systemctl stop prayer-times.service
fi

# Copy the extracted files to the installation directory
log "Installing files to $INSTALL_DIR..."
rsync -av --delete "$EXTRACT_DIR/" "$INSTALL_DIR/" --exclude "node_modules" --exclude "update.log" --exclude "install.log"

# Install dependencies
log "Installing dependencies..."
cd "$INSTALL_DIR"
if ! bun install; then
  log "Error: Failed to install dependencies. Restoring from backup..."
  if [ -d "$BACKUP_DIR" ]; then
    rsync -av "$BACKUP_DIR/" "$INSTALL_DIR/"
    sudo systemctl start prayer-times.service || true
  fi
  exit 1
fi

# Copy the update script to the installation directory
log "Installing update script..."
cat > "$INSTALL_DIR/update.sh" << 'EOL'
#!/bin/bash
set -e

# Script for updating Prayer Times Display
REPO_OWNER=${REPO_OWNER:-"nextsalah"}
REPO_NAME=${REPO_NAME:-"prayer-times-display"}
INSTALL_DIR=${INSTALL_DIR:-"/opt/prayer-times-display"}
LOG_FILE="$INSTALL_DIR/update.log"

# Function for logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>/dev/null || true
}

# Make sure log file exists and is writable
touch "$LOG_FILE" 2>/dev/null || sudo touch "$LOG_FILE"
[ -w "$LOG_FILE" ] || sudo chmod 666 "$LOG_FILE"

log "Starting update check for Prayer Times Display..."

# Get current version from package.json
if [ -f "$INSTALL_DIR/package.json" ]; then
  CURRENT_VERSION=$(grep -o '"version": *"[^"]*"' "$INSTALL_DIR/package.json" | cut -d'"' -f4)
  log "Current installed version: $CURRENT_VERSION"
else
  log "Error: Cannot find package.json. Is Prayer Times Display installed correctly?"
  exit 1
fi

# Fetch latest release version
log "Checking for updates..."
LATEST_VERSION=$(curl -s https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest | 
  grep -o '"tag_name": *"[^"]*"' | cut -d'"' -f4)

if [ -z "$LATEST_VERSION" ]; then
  log "Error: Failed to fetch latest version from GitHub."
  exit 1
fi

# Remove leading "v" if present
LATEST_VERSION_CLEAN="${LATEST_VERSION#v}"
log "Latest available version: $LATEST_VERSION_CLEAN"

# Compare versions
if [ "$CURRENT_VERSION" = "$LATEST_VERSION_CLEAN" ]; then
  log "Already running the latest version. No update needed."
  exit 0
fi

log "Update available: $CURRENT_VERSION → $LATEST_VERSION_CLEAN"

# Create temporary directory for downloads
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# Download the release tarball from GitHub
TARBALL_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$LATEST_VERSION/prayer-times-display-$LATEST_VERSION_CLEAN.tar.gz"
log "Downloading release tarball from $TARBALL_URL..."

# Download with proper error handling
if ! curl -L --fail -o "$TMP_DIR/release.tar.gz" "$TARBALL_URL"; then
  # Try alternate URL format if the first one fails
  TARBALL_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$LATEST_VERSION/prayer-times-display-v$LATEST_VERSION_CLEAN.tar.gz"
  log "First download attempt failed. Trying alternate URL: $TARBALL_URL"
  
  if ! curl -L --fail -o "$TMP_DIR/release.tar.gz" "$TARBALL_URL"; then
    log "Error: Failed to download release. Update failed."
    exit 1
  fi
fi

# Verify the download was successful
if [ ! -s "$TMP_DIR/release.tar.gz" ]; then
  log "Error: Downloaded file is empty. Update failed."
  exit 1
fi

# Extract the tarball
log "Extracting release tarball..."
mkdir -p "$TMP_DIR/extract"
if ! tar -xzf "$TMP_DIR/release.tar.gz" -C "$TMP_DIR/extract"; then
  log "Error: Failed to extract the tarball. The file might be corrupted."
  exit 1
fi

# Find the directory containing the app
EXTRACT_DIR="$TMP_DIR/extract"
if [ -d "$TMP_DIR/extract/prayer-times-display" ]; then
  EXTRACT_DIR="$TMP_DIR/extract/prayer-times-display"
elif [ -d "$TMP_DIR/extract/app" ]; then
  EXTRACT_DIR="$TMP_DIR/extract/app"
fi

# Backup current installation
BACKUP_DIR="$INSTALL_DIR.backup-$(date +%Y%m%d%H%M%S)"
log "Backing up current installation to $BACKUP_DIR"
cp -a "$INSTALL_DIR" "$BACKUP_DIR"

# Stop the service if it's running
if systemctl is-active --quiet prayer-times.service; then
  log "Stopping prayer-times service..."
  sudo systemctl stop prayer-times.service
fi

# Copy the extracted files to the installation directory
log "Installing updated files to $INSTALL_DIR..."
rsync -av --delete "$EXTRACT_DIR/" "$INSTALL_DIR/" --exclude "node_modules" --exclude "update.log" --exclude "install.log"

# Install dependencies
log "Updating dependencies..."
cd "$INSTALL_DIR"
if ! command -v bun &> /dev/null; then
  log "Bun is not available. Adding to PATH..."
  export PATH="$HOME/.bun/bin:$PATH"
fi

if ! bun install; then
  log "Error: Failed to update dependencies. Restoring from backup..."
  rsync -av "$BACKUP_DIR/" "$INSTALL_DIR/"
  sudo systemctl start prayer-times.service || true
  exit 1
fi

# Start the service
log "Starting updated service..."
sudo systemctl start prayer-times.service

# Verify service is running
if systemctl is-active --quiet prayer-times.service; then
  log "Update successful! Prayer Times Display updated to version $LATEST_VERSION_CLEAN"
else
  log "Warning: Service failed to start after update. Check the systemd logs."
  log "You can try to manually start it with: sudo systemctl start prayer-times.service"
  exit 1
fi

# Clean up old backups (keep the 3 most recent)
log "Cleaning up old backups..."
ls -1d "$INSTALL_DIR".backup-* 2>/dev/null | sort -r | tail -n +4 | xargs -r rm -rf

log "Update process completed."
EOL

chmod +x "$INSTALL_DIR/update.sh"

# Install and start the systemd service
SERVICE_FILE="$INSTALL_DIR/prayer-times.service"
if [ ! -f "$SERVICE_FILE" ]; then
  # Create service file if it doesn't exist
  log "Creating systemd service file..."
  cat > "$SERVICE_FILE" << EOL
[Unit]
Description=Prayer Times Display
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$INSTALL_DIR
Environment="PORT=80"
Environment="HOST=0.0.0.0"
ExecStart=$(which bun) start -- --port=80 --host=0.0.0.0
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=prayer-times

[Install]
WantedBy=multi-user.target
EOL
fi

log "Installing systemd service..."
sudo cp "$SERVICE_FILE" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable prayer-times.service
sudo systemctl start prayer-times.service

# Setup automatic updates (runs daily at 3 AM)
CRON_JOB="0 3 * * * $INSTALL_DIR/update.sh >> $INSTALL_DIR/update.log 2>&1"
if ! (crontab -l 2>/dev/null | grep -F "$INSTALL_DIR/update.sh"); then
  log "Setting up automatic updates (daily at 3 AM)..."
  (crontab -l 2>/dev/null | grep -v "$INSTALL_DIR/update.sh"; echo "$CRON_JOB") | crontab -
fi

# Disable screen sleep for Raspberry Pi
if [ -f /etc/lightdm/lightdm.conf ]; then
  log "Configuring lightdm to prevent screen sleep..."
  sudo sed -i 's/#xserver-command=X/xserver-command=X -s 0 -dpms/' /etc/lightdm/lightdm.conf
  sudo sed -i 's/^xserver-command=X$/xserver-command=X -s 0 -dpms/' /etc/lightdm/lightdm.conf
fi

# For Raspberry Pi OS Lite or other distros without lightdm
if [ -d /etc/X11/xorg.conf.d ] || sudo mkdir -p /etc/X11/xorg.conf.d; then
  log "Creating X11 configuration to prevent screen sleep..."
  sudo tee /etc/X11/xorg.conf.d/10-blanking.conf > /dev/null << EOL
Section "ServerFlags"
    Option "BlankTime" "0"
    Option "StandbyTime" "0"
    Option "SuspendTime" "0"
    Option "OffTime" "0"
EndSection
EOL
fi

# Add to autostart for GUI environments
AUTOSTART_DIR="$HOME/.config/autostart"
if [ ! -d "$AUTOSTART_DIR" ]; then
  mkdir -p "$AUTOSTART_DIR"
fi

log "Creating autostart entry..."
cat > "$AUTOSTART_DIR/prayer-times.desktop" << EOL
[Desktop Entry]
Name=Prayer Times Display
Comment=Prayer Times Display Application
Exec=chromium-browser --kiosk --disable-restore-session-state --noerrdialogs --disable-component-update --disable-pinch http://localhost/screen
Type=Application
X-GNOME-Autostart-enabled=true
EOL

log "Installation complete! Prayer Times Display v$VERSION_CLEAN is now running."
log "You can access it at http://localhost or http://$(hostname -I | awk '{print $1}')"