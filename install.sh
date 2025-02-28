#!/bin/bash
set -e

# Script for installing Prayer Times Display
REPO_OWNER=${REPO_OWNER:-"nextsalah"}
REPO_NAME=${REPO_NAME:-"prayer-times-display"}
INSTALL_DIR=${INSTALL_DIR:-"/opt/prayer-times-display"}

# Determine the release version (fetch latest if not specified)
if [ -z "$VERSION" ] || [ "$VERSION" = "latest" ]; then
  echo "Fetching latest release version..."
  VERSION=$(curl -s https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest \
    | grep tag_name | head -n1 | awk -F': *"' '{print $2}' | tr -d '",')
  echo "Latest version: $VERSION"
fi

# Remove leading "v" if present (for URL construction)
if [[ "$VERSION" =~ ^v ]]; then
  VERSION_NO_V="${VERSION:1}"
else
  VERSION_NO_V="$VERSION"
fi

# Check if Bun is installed; if not, install it
if ! command -v bun &> /dev/null; then
  echo "Installing Bun runtime..."
  curl -fsSL https://bun.sh/install | bash
  # Reload profile if necessary
  if [ -f ~/.bashrc ]; then
    source ~/.bashrc
  elif [ -f ~/.profile ]; then
    source ~/.profile
  fi
fi

# Download the release tarball from GitHub
TARBALL_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/v$VERSION_NO_V/prayer-times-display-v$VERSION_NO_V.tar.gz"
TMP_DIR=$(mktemp -d)
echo "Downloading release tarball from $TARBALL_URL..."
curl -L -o "$TMP_DIR/release.tar.gz" "$TARBALL_URL"

# Create installation directory if it doesn't exist
sudo mkdir -p "$INSTALL_DIR"
sudo chown "$(whoami):$(whoami)" "$INSTALL_DIR"

# Extract the tarball (assuming it extracts to a folder named "prayer-times-display")
echo "Extracting release tarball..."
tar -xzf "$TMP_DIR/release.tar.gz" -C "$TMP_DIR"
EXTRACTED_DIR="$TMP_DIR/prayer-times-display"

# Copy the extracted files to the installation directory
echo "Installing files to $INSTALL_DIR..."
cp -r "$EXTRACTED_DIR"/* "$INSTALL_DIR/"

# Install dependencies (since node_modules are not included)
echo "Installing dependencies..."
cd "$INSTALL_DIR"
bun install

# Install and start the systemd service if the service file exists
if [ -f "$INSTALL_DIR/prayer-times.service" ]; then
  sudo cp "$INSTALL_DIR/prayer-times.service" /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable prayer-times.service
  sudo systemctl start prayer-times.service
else
  echo "Warning: prayer-times.service not found in the package."
fi

# Setup automatic updates (runs daily at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * * $INSTALL_DIR/update.sh >> $INSTALL_DIR/update.log 2>&1") | crontab -

# Clean up
rm -rf "$TMP_DIR"

echo "Installation complete! Prayer Times Display is now running."
echo "You can access it at http://localhost:3000"