# Prayer Times Display for Raspberry Pi

This guide explains how to install and configure the Prayer Times Display application on a Raspberry Pi with automatic updates.

## Installation

### Method 1: One-line installer (Recommended)

Run this command on your Raspberry Pi:

```bash
curl -sSL https://raw.githubusercontent.com/nextsalah/prayer-times-display/main/install.sh | bash
```

### Method 2: Manual installation

1. Download the latest release:

```bash
wget https://github.com/nextsalah/prayer-times-display/releases/latest/download/prayer-times-display-v*.tar.gz
```

2. Extract the archive:

```bash
tar -xzf prayer-times-display-v*.tar.gz
cd prayer-times-display
```

3. Run the installer:

```bash
chmod +x install.sh
./install.sh
```

## What the Installer Does

The installer:

1. Installs Bun runtime if not already installed
2. Copies application files to `/opt/prayer-times-display/`
3. Sets up a systemd service to run the application
4. Configures a daily auto-update (runs at 3 AM)
5. Starts the application

## Configuration

After installation, you can access the web interface at:

```
http://raspberry-pi-ip:3000
```

Replace `raspberry-pi-ip` with your Raspberry Pi's IP address.

## Automatic Updates

Updates are checked daily at 3 AM. If a new version is available, it will be automatically downloaded and installed.

To manually check for updates:

```bash
/opt/prayer-times-display/update.sh
```

## Service Management

You can control the application using systemd:

```bash
# Check service status
sudo systemctl status prayer-times.service

# Stop the service
sudo systemctl stop prayer-times.service

# Start the service
sudo systemctl start prayer-times.service

# Restart the service
sudo systemctl restart prayer-times.service

# View logs
journalctl -u prayer-times.service
```

## Troubleshooting

### The application doesn't start

Check the service status:

```bash
sudo systemctl status prayer-times.service
```

Review the application logs:

```bash
journalctl -u prayer-times.service
```

### Auto-update isn't working

Check the update log:

```bash
cat /opt/prayer-times-display/update.log
```

Make sure the cron job is set up:

```bash
crontab -l | grep update
```

## Uninstallation

To completely remove the application:

```bash
sudo systemctl stop prayer-times.service
sudo systemctl disable prayer-times.service
sudo rm /etc/systemd/system/prayer-times.service
sudo rm -rf /opt/prayer-times-display
crontab -l | grep -v "prayer-times-display/update.sh" | crontab -
```