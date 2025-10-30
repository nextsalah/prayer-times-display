# Dockerfile for Prayer Times Display
# Primary target: Raspberry Pi 4 (ARM64)
# Also supports: AMD64 for development/preview
# Database: SQLite (optimized for single-instance deployment)

# Base image with Bun runtime
FROM oven/bun:1.1.45-alpine AS base
WORKDIR /app

# Install system dependencies needed for build and runtime
FROM base AS deps
RUN apk add --no-cache curl wget ca-certificates

# Install dependencies only (for better caching)
FROM deps AS install
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Build the application
FROM install AS build
COPY . .
RUN bun run build

# Production image - minimal size
FROM base AS release

# Install curl for health checks
RUN apk add --no-cache curl ca-certificates

# Install only production dependencies
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile

# Copy built application
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./

# Copy database migration files and scripts
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/src/lib/db ./src/lib/db
COPY --from=build /app/drizzle.config.ts ./

# Copy configuration files
COPY --from=build /app/svelte.config.js ./
COPY --from=build /app/vite.config.ts ./
COPY --from=build /app/tsconfig.json ./

# Copy static files
COPY --from=build /app/static ./static

# Create data directory for SQLite database
RUN mkdir -p /app/data && chmod 777 /app/data

# Set environment variables
ENV PORT=5000
ENV HOST=0.0.0.0
ENV DATABASE_URL="file:/app/data/database.db"

# Expose the application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Run migrations and start the application
CMD ["sh", "-c", "bun run migrate && bun run start"]
