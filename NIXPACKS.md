# Nixpacks Deployment Guide

This project is configured to work with [Nixpacks](https://nixpacks.com/), which is used by platforms like Railway, Render, and others for automated deployments.

## Configuration Files

The following files support Nixpacks deployment:

- **`nixpacks.toml`** - Main Nixpacks configuration
- **`Procfile`** - Alternative process configuration
- **`.env.example`** - Example environment variables
- **`bun.lockb`** - Bun lockfile (committed for reproducible builds)

## What Nixpacks Does

1. **Setup Phase**: Installs Bun runtime
2. **Install Phase**: Runs `bun install --frozen-lockfile`
3. **Build Phase**: Runs `bun run build`
4. **Start Phase**: Runs migrations then starts the server

## Environment Variables

The application uses the following environment variables:

- `PORT` - Server port (default: 5000)
- `HOST` - Server host (default: 0.0.0.0)
- `NODE_ENV` - Environment (production/development)

## Deployment Platforms

### Railway

1. Connect your GitHub repository
2. Railway will automatically detect the `nixpacks.toml` configuration
3. Set any required environment variables in the Railway dashboard
4. Deploy!

### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Render will automatically use Nixpacks
4. Configure environment variables
5. Deploy!

### Other Nixpacks-Compatible Platforms

The configuration should work on any platform that supports Nixpacks:
- Set the build command: `bun run build`
- Set the start command: `bun run migrate && bun run start`
- Ensure Bun runtime is available

## Database

The application uses SQLite (`sqlite.db`) which is stored locally. For production deployments:

- SQLite file will be created on first run
- Migrations run automatically on startup
- Consider using volume mounts for data persistence

## Port Configuration

The application listens on the port specified by the `PORT` environment variable (defaults to 5000). Most platforms automatically set this variable.

## Health Checks

The application serves on:
- Main application: `http://HOST:PORT`
- You can configure health checks to hit the root endpoint

## Troubleshooting

### Build Failures

If the build fails, check:
1. Bun lockfile is committed (`bun.lockb`)
2. All dependencies are in `package.json`
3. Build logs for specific errors

### Runtime Issues

If the application doesn't start:
1. Check that migrations completed successfully
2. Verify the PORT environment variable is set correctly
3. Check logs for database errors

### Database Persistence

For data persistence across deployments:
1. Mount a volume to the application directory
2. Ensure `sqlite.db` is stored in the mounted volume
3. Or use an external database service

## Local Testing with Nixpacks

You can test the Nixpacks build locally:

```bash
# Install Nixpacks
curl -sSL https://nixpacks.com/install.sh | bash

# Build the project
nixpacks build . --name prayer-times-display

# Run the container
docker run -p 5000:5000 prayer-times-display
```

## Manual Deployment

If you prefer manual deployment without Nixpacks:

```bash
# Install dependencies
bun install

# Build the application
bun run build

# Run migrations
bun run migrate

# Start the server
bun run start
```
