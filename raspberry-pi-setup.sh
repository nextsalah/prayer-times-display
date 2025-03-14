#!/bin/bash
set -e

# Complete setup script for Prayer Times Display on a new Raspberry Pi
# This script:
# 1. Installs the Prayer Times Display server
# 2. Configures it to run automatically on boot
# 3. Sets up kiosk mode to open localhost/screen on startup

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function for logging with timestamp
log() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

success() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Check if running as root/sudo
if [ "$EUID" -ne 0 ]; then
  error "Please run this script with sudo: sudo $0"
  exit 1
fi

# Variables
REPO_OWNER="nextsalah"
REPO_NAME="prayer-times-display"
INSTALL_DIR="/opt/prayer-times-display"
ACTUAL_USER=$(logname || whoami)
HOME_DIR="/home/$ACTUAL_USER"
LOG_FILE="$INSTALL_DIR/setup.log"

log "Starting full Raspberry Pi setup for Prayer Times Display..."
log "This script will install the server and configure kiosk mode."

# Create installation directory
mkdir -p "$INSTALL_DIR"
chown "$ACTUAL_USER:$ACTUAL_USER" "$INSTALL_DIR"
touch "$LOG_FILE"
chown "$ACTUAL_USER:$ACTUAL_USER" "$LOG_FILE"

# 1. SYSTEM UPDATES AND DEPENDENCIES
log "Updating system and installing dependencies..."
apt-get update
apt-get upgrade -y
apt-get install -y curl git unclutter chromium-browser xserver-xorg x11-xserver-utils xinit openbox

# 2. INSTALL BUN
log "Installing Bun runtime..."
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash
  # Add Bun to PATH for this session
  export PATH="$HOME_DIR/.bun/bin:$PATH"
  # Also add to profile for future use
  echo 'export PATH="$HOME/.bun/bin:$PATH"' >> "$HOME_DIR/.profile"
  echo 'export PATH="$HOME/.bun/bin:$PATH"' >> "$HOME_DIR/.bashrc"
  # Make bun available to the actual user
  chown -R "$ACTUAL_USER:$ACTUAL_USER" "$HOME_DIR/.bun"
fi

# 3. FETCH LATEST RELEASE VERSION
log "Fetching latest release version..."
VERSION=$(curl -s https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest | 
          grep -o '"tag_name": *"[^"]*"' | cut -d'"' -f4)

if [ -z "$VERSION" ]; then
  error "Failed to fetch latest version from GitHub. Check your internet connection or repository access."
  exit 1
fi

log "Latest version: $VERSION"
VERSION_CLEAN="${VERSION#v}"

# 4. DOWNLOAD AND EXTRACT RELEASE
TMP_DIR=$(mktemp -d)
log "Downloading release tarball..."

# Try different URL formats
TARBALL_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$VERSION/prayer-times-display-$VERSION_CLEAN.tar.gz"
if ! curl -L --fail -o "$TMP_DIR/release.tar.gz" "$TARBALL_URL"; then
  # Try alternate URL format
  TARBALL_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$VERSION/prayer-times-display-v$VERSION_CLEAN.tar.gz"
  log "First download attempt failed. Trying alternate URL: $TARBALL_URL"
  
  if ! curl -L --fail -o "$TMP_DIR/release.tar.gz" "$TARBALL_URL"; then
    error "Failed to download release. Please check the version and repository."
    exit 1
  fi
fi

# Extract the tarball
log "Extracting release..."
mkdir -p "$TMP_DIR/extract"
tar -xzf "$TMP_DIR/release.tar.gz" -C "$TMP_DIR/extract"

# Find the directory containing the app
EXTRACT_DIR="$TMP_DIR/extract"
if [ -d "$TMP_DIR/extract/prayer-times-display" ]; then
  EXTRACT_DIR="$TMP_DIR/extract/prayer-times-display"
elif [ -d "$TMP_DIR/extract/app" ]; then
  EXTRACT_DIR="$TMP_DIR/extract/app"
fi

# 5. INSTALL TO DESTINATION
log "Installing to $INSTALL_DIR..."
cp -r "$EXTRACT_DIR/"* "$INSTALL_DIR/"
chown -R "$ACTUAL_USER:$ACTUAL_USER" "$INSTALL_DIR"

# 6. INSTALL DEPENDENCIES
log "Installing application dependencies..."
cd "$INSTALL_DIR"
sudo -u "$ACTUAL_USER" bash -c "PATH=\"$HOME_DIR/.bun/bin:\$PATH\" && cd \"$INSTALL_DIR\" && bun install"

# 7. CREATE SYSTEMD SERVICE
log "Creating systemd service..."
cat > /etc/systemd/system/prayer-times.service << EOL
[Unit]
Description=Prayer Times Display
After=network.target

[Service]
Type=simple
User=$ACTUAL_USER
WorkingDirectory=$INSTALL_DIR
Environment="PORT=80"
Environment="HOST=0.0.0.0"
ExecStart=$HOME_DIR/.bun/bin/bun start -- --port=80 --host=0.0.0.0
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=prayer-times

[Install]
WantedBy=multi-user.target
EOL

# 8. DISABLE SCREEN SLEEPING
log "Configuring screen sleep prevention..."

# Create X11 configuration to prevent screen sleep
mkdir -p /etc/X11/xorg.conf.d
cat > /etc/X11/xorg.conf.d/10-blanking.conf << EOL
Section "ServerFlags"
    Option "BlankTime" "0"
    Option "StandbyTime" "0"
    Option "SuspendTime" "0"
    Option "OffTime" "0"
EndSection
EOL

# 9. CREATE KIOSK SETUP
log "Setting up kiosk mode..."

# Create kiosk directory
sudo -u "$ACTUAL_USER" mkdir -p "$HOME_DIR/.config/prayer-times-kiosk"

# Create kiosk launch script
cat > "$HOME_DIR/.config/prayer-times-kiosk/start-kiosk.sh" << 'EOL'
#!/bin/bash

# Wait for network and server to be available
count=0
while ! curl -s http://localhost/screen > /dev/null; do
  count=$((count + 1))
  if [ $count -gt 60 ]; then
    # After 60 seconds, try to start anyway
    break
  fi
  sleep 1
done

# Kill any existing Chromium processes
pkill -o chromium || true

# Hide the mouse cursor
unclutter -idle 0 &

# Prevent screen from going blank
xset s off
xset -dpms
xset s noblank

# Wait a moment for everything to settle
sleep 5

# Launch Chromium in kiosk mode pointing to /screen endpoint
chromium-browser --noerrdialogs \
  --disable-infobars \
  --disable-features=TranslateUI \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --disable-features=TouchpadOverscrollHistoryNavigation \
  --kiosk http://localhost/screen \
  --incognito \
  --disable-restore-session-state \
  --disable-session-crashed-bubble
EOL

chmod +x "$HOME_DIR/.config/prayer-times-kiosk/start-kiosk.sh"
chown -R "$ACTUAL_USER:$ACTUAL_USER" "$HOME_DIR/.config"

# 10. CONFIGURE AUTOSTART
log "Setting up autostart..."

# Create autostart directory
sudo -u "$ACTUAL_USER" mkdir -p "$HOME_DIR/.config/autostart"

# Create desktop entry for autostart
cat > "$HOME_DIR/.config/autostart/prayer-times-kiosk.desktop" << EOL
[Desktop Entry]
Name=Prayer Times Kiosk
Comment=Start Prayer Times Display in kiosk mode
Exec=/bin/bash $HOME_DIR/.config/prayer-times-kiosk/start-kiosk.sh
Type=Application
X-GNOME-Autostart-enabled=true
EOL

# For Raspberry Pi OS Lite, set up a minimal X environment
if ! dpkg -s lightdm >/dev/null 2>&1; then
  log "Setting up minimal X environment for headless operation..."
  
  # Configure xinit to start openbox
  cat > "$HOME_DIR/.xinitrc" << EOL
#!/bin/sh
exec openbox-session
EOL
  
  chmod +x "$HOME_DIR/.xinitrc"
  chown "$ACTUAL_USER:$ACTUAL_USER" "$HOME_DIR/.xinitrc"
  
  # Configure openbox to start our kiosk
  sudo -u "$ACTUAL_USER" mkdir -p "$HOME_DIR/.config/openbox"
  cat > "$HOME_DIR/.config/openbox/autostart" << EOL
# Start our kiosk script
$HOME_DIR/.config/prayer-times-kiosk/start-kiosk.sh &
EOL
  
  chown -R "$ACTUAL_USER:$ACTUAL_USER" "$HOME_DIR/.config/openbox"
  
  # Set up automatic login
  mkdir -p /etc/systemd/system/getty@tty1.service.d/
  cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf << EOL
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $ACTUAL_USER --noclear %I \$TERM
EOL
  
  # Add startx to bash_profile
  if ! grep -q "startx" "$HOME_DIR/.bash_profile" 2>/dev/null; then
    echo "[[ -z \$DISPLAY && \$XDG_VTNR -eq 1 ]] && startx" >> "$HOME_DIR/.bash_profile"
    chown "$ACTUAL_USER:$ACTUAL_USER" "$HOME_DIR/.bash_profile"
  fi
fi

# 11. CREATE UPDATE SCRIPT
log "Creating update script..."
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
rsync -av --delete "$EXTRACT_DIR/" "$INSTALL_DIR/" --exclude "node_modules" --exclude "update.log" --exclude "install.log" --exclude "setup.log"

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
chown "$ACTUAL_USER:$ACTUAL_USER" "$INSTALL_DIR/update.sh"

# 12. SETUP AUTOMATIC UPDATES
log "Setting up automatic updates..."
CRON_JOB="0 3 * * * $INSTALL_DIR/update.sh >> $INSTALL_DIR/update.log 2>&1"
(crontab -u "$ACTUAL_USER" -l 2>/dev/null || echo "") | grep -v "$INSTALL_DIR/update.sh" | { cat; echo "$CRON_JOB"; } | crontab -u "$ACTUAL_USER" -

# 13. ENABLE AND START SERVICES
log "Enabling and starting services..."
systemctl daemon-reload
systemctl enable prayer-times.service
systemctl start prayer-times.service

# 14. CLEAN UP
rm -rf "$TMP_DIR"

success "Installation complete! Prayer Times Display v$VERSION_CLEAN is now installed."
success "The server is running on port 80 and will start automatically on boot."
success "Kiosk mode is configured to open http://localhost/screen automatically."
success "Please reboot your Raspberry Pi for all changes to take effect: sudo reboot"