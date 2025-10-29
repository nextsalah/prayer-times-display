# Dockerfile for Prayer Times Display
# Multi-stage build optimized for production deployment

# Base image with Bun runtime
FROM oven/bun:1.1.45-alpine AS base
WORKDIR /app

# Install system dependencies needed for build
FROM base AS deps
RUN apk add --no-cache curl wget

# Install dependencies only (for better caching)
FROM deps AS install
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production=false

# Build the application
FROM install AS build
COPY . .
RUN bun run build

# Production image - minimal size
FROM base AS release

# Install only production dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Copy built application
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./

# Copy database migration files and scripts
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/src/lib/db ./src/lib/db
COPY --from=build /app/drizzle.config.ts ./

# Copy any other necessary files
COPY --from=build /app/static ./static

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Expose the application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Run migrations and start the application
CMD ["sh", "-c", "bun run migrate && bun run start"]
