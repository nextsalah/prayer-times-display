#!/bin/bash

# Script for installing Prayer Times Display
REPO_OWNER=${REPO_OWNER:-"nextsalah"}
REPO_NAME=${REPO_NAME:-"prayer-times-display"}
INSTALL_DIR=${INSTALL_DIR:-"/opt/prayer-times-display"}

# Install Bun if not already installed
if ! command -v bun &> /dev/null; then
  echo "Installing Bun runtime..."
  curl -fsSL https://bun.sh/install | bash
  source ~/.bashrc
fi

# Create installation directory
sudo mkdir -p "$INSTALL_DIR"
sudo chown "$(whoami):$(whoami)" "$INSTALL_DIR"

# Copy all files to the installation directory
cp -r * "$INSTALL_DIR/"

# Make the update script executable
chmod +x "$INSTALL_DIR/update.sh"

# Install the systemd service
sudo cp "$INSTALL_DIR/prayer-times.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable prayer-times.service
sudo systemctl start prayer-times.service

# Setup automatic updates (runs daily at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * * $INSTALL_DIR/update.sh >> $INSTALL_DIR/update.log 2>&1") | crontab -

echo "Installation complete! Prayer Times Display is now running."
echo "You can access it at http://localhost:3000"