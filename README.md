# Prayer Times Display 🕌

**Digital display solution for Raspberry Pi - showing prayer times accurately and efficiently in mosques.**

This application is designed specifically for **Raspberry Pi** to run 24/7 mosque displays. It uses SQLite for data storage, works offline, and is optimized for low-power, reliable operation.

## Quick Start

### 💻 Development (Local)

```bash
bun install
bun run dev
# Access at http://localhost:5173
```

### 🥧 Raspberry Pi (Production)

**Option 1: Docker (Recommended)**

```bash
git clone https://github.com/nextsalah/prayer-times-display.git
cd prayer-times-display
./docker-deploy.sh start
# Access at http://raspberry-pi-ip:5000
```

**Option 2: One-line installer**

```bash
curl -sSL https://raw.githubusercontent.com/nextsalah/prayer-times-display/main/install.sh | bash
```

### 🌐 Coolify (Preview/Demo)

1. Add repository to Coolify: `nextsalah/prayer-times-display`
2. Add storage: `/app/data` (volume)
3. Set PORT: `5000`
4. Deploy!

Perfect for testing online before Pi deployment.



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

## Docker Commands

```bash
./docker-deploy.sh start    # Start application
./docker-deploy.sh stop     # Stop application
./docker-deploy.sh logs     # View logs
./docker-deploy.sh status   # Check status
./docker-deploy.sh backup   # Backup database
./docker-deploy.sh update   # Update to latest version
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



## Deployment Comparison

| Method | Use Case | Command |
|--------|----------|---------|
| **Local Dev** | 💻 Development | `bun run dev` |
| **Raspberry Pi** | 🎯 Production | `./docker-deploy.sh start` |
| **Coolify** | 🌐 Preview/Demo | Deploy via Coolify dashboard |