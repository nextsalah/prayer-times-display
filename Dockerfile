FROM oven/bun:1.1.45-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl ca-certificates

# Copy package files
COPY package.json bun.lockb* ./

# Install ALL dependencies (needed for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Create data directory for SQLite database
RUN mkdir -p /app/data && chmod 777 /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["bun", "run", "start"]
