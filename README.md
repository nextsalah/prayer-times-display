# Prayer Times Display 🕌

**Digital display solution for Raspberry Pi - showing prayer times accurately and efficiently in mosques.**

This application is designed specifically for **Raspberry Pi** to run 24/7 mosque displays. It uses SQLite for data storage, works offline, and is optimized for low-power, reliable operation.

## Quick Start

### 🥧 Raspberry Pi (Primary Target)

This app is designed for Raspberry Pi deployment in mosques:

```bash
# On your Raspberry Pi
curl -sSL https://raw.githubusercontent.com/nextsalah/prayer-times-display/main/install.sh | bash
```

Or use Docker:

```bash
git clone https://github.com/nextsalah/prayer-times-display.git
cd prayer-times-display
./docker-deploy.sh start
```

### 🌐 Coolify (Live Preview/Demo Only)

Want to test/preview the app online before deploying to Raspberry Pi?

See [COOLIFY.md](COOLIFY.md) for deploying a live demo on Coolify.

### 🐳 Docker (Works Everywhere)

The easiest way to deploy on any system including Raspberry Pi 4:

```bash
# Using the deployment script
./docker-deploy.sh start

# Or using Docker Compose directly
docker-compose up -d
```

See [DOCKER.md](DOCKER.md) for detailed Docker deployment instructions.

### 📦 Method 1: One-line installer (Raspberry Pi)

Run this command on your Raspberry Pi:

```bash
curl -sSL https://raw.githubusercontent.com/nextsalah/prayer-times-display/main/install.sh | bash
```

### 📦 Method 2: Docker Deployment (All platforms)

1. Clone the repository:

```bash
git clone https://github.com/nextsalah/prayer-times-display.git
cd prayer-times-display
```

2. Deploy using the helper script:

```bash
chmod +x docker-deploy.sh
./docker-deploy.sh start
```

See [DOCKER.md](DOCKER.md) for complete Docker documentation.

### 📦 Method 3: Manual installation (Raspberry Pi)

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

## Docker Commands Quick Reference

```bash
# Start application
./docker-deploy.sh start

# Stop application
./docker-deploy.sh stop

# View logs
./docker-deploy.sh logs

# Check status
./docker-deploy.sh status

# Backup database
./docker-deploy.sh backup

# Update to latest version
./docker-deploy.sh update
```

## Uninstallation

### Docker

```bash
./docker-deploy.sh clean
```

### Manual installation

To completely remove the application:

```bash
sudo systemctl stop prayer-times.service
sudo systemctl disable prayer-times.service
sudo rm /etc/systemd/system/prayer-times.service
sudo rm -rf /opt/prayer-times-display
crontab -l | grep -v "prayer-times-display/update.sh" | crontab -
```

## Documentation

- [Coolify Deployment Guide](COOLIFY.md) - Deploy on Coolify (self-hosted PaaS)
- [Docker Deployment Guide](DOCKER.md) - Complete Docker deployment documentation
- [Raspberry Pi Setup](raspberry-pi-setup.sh) - Raspberry Pi specific setup script

## Deployment Options

| Method | Use Case | Best For |
|--------|----------|----------|
| **Raspberry Pi** | 🎯 **Production** | Actual mosque displays |
| **Docker** | 🐳 **Production** | Self-hosting anywhere (including Pi) |
| **Coolify** | 🌐 **Preview/Demo** | Testing & sharing live preview |
| **Local Dev** | 💻 **Development** | Fast iteration while coding |