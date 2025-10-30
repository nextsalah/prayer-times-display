#!/bin/bash

# Docker Deployment Script for Prayer Times Display
# This script helps with building and deploying the application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Build the Docker image
build() {
    print_info "Building Docker image..."
    docker-compose build
    print_success "Docker image built successfully"
}

# Start the application
start() {
    print_info "Starting Prayer Times Display..."
    docker-compose up -d
    print_success "Application started"
    print_info "Access the application at: http://localhost:5000"
    
    # Get container IP if on Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        CONTAINER_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' prayer-times-display 2>/dev/null || echo "")
        if [ ! -z "$CONTAINER_IP" ]; then
            print_info "Container IP: http://${CONTAINER_IP}:5000"
        fi
    fi
}

# Stop the application
stop() {
    print_info "Stopping Prayer Times Display..."
    docker-compose down
    print_success "Application stopped"
}

# Restart the application
restart() {
    print_info "Restarting Prayer Times Display..."
    stop
    start
}

# View logs
logs() {
    print_info "Showing logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Check status
status() {
    print_info "Checking application status..."
    docker-compose ps
    echo ""
    print_info "Checking health..."
    if docker ps --filter "name=prayer-times-display" --filter "health=healthy" | grep -q prayer-times-display; then
        print_success "Application is healthy"
    else
        print_warning "Application may not be healthy. Check logs with: $0 logs"
    fi
}

# Clean up (remove container and images)
clean() {
    print_warning "This will remove the container, images, and volumes (including database)"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v
        docker rmi prayer-times-display 2>/dev/null || true
        print_success "Cleanup complete"
    else
        print_info "Cleanup cancelled"
    fi
}

# Backup database
backup() {
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/prayer-data-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    print_info "Creating backup..."
    docker run --rm \
        -v prayer-data:/data \
        -v "$(pwd)/$BACKUP_DIR:/backup" \
        alpine tar czf "/backup/$(basename $BACKUP_FILE)" -C /data .
    
    print_success "Backup created: $BACKUP_FILE"
}

# Restore database
restore() {
    if [ -z "$1" ]; then
        print_error "Please specify a backup file"
        print_info "Usage: $0 restore <backup-file.tar.gz>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Backup file not found: $1"
        exit 1
    fi
    
    print_warning "This will overwrite the current database"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restoring from backup..."
        docker run --rm \
            -v prayer-data:/data \
            -v "$(pwd):/backup" \
            alpine tar xzf "/backup/$1" -C /data
        print_success "Backup restored successfully"
        print_info "Restart the application for changes to take effect"
    else
        print_info "Restore cancelled"
    fi
}

# Development mode
dev() {
    print_info "For development, use: bun run dev"
    print_info "Docker is only needed for testing production builds"
    print_info "To test production build: $0 start"
}

# Update application
update() {
    print_info "Updating Prayer Times Display..."
    
    if [ -d .git ]; then
        print_info "Pulling latest changes from git..."
        git pull
    fi
    
    print_info "Rebuilding and restarting..."
    docker-compose up -d --build
    print_success "Update complete"
}

# Show help
show_help() {
    echo "Prayer Times Display - Docker Deployment Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build      Build the Docker image"
    echo "  start      Start the application (production)"
    echo "  stop       Stop the application"
    echo "  restart    Restart the application"
    echo "  status     Show application status"
    echo "  logs       Show application logs"
    echo "  update     Update and rebuild the application"
    echo "  backup     Backup the database"
    echo "  restore    Restore database from backup"
    echo "  clean      Remove containers, images, and volumes"
    echo "  help       Show this help message"
    echo ""
    echo "Note: For development, use 'bun run dev' instead of Docker"
    echo ""
    echo "Examples:"
    echo "  $0 start                              # Start the application"
    echo "  $0 logs                               # View logs"
    echo "  $0 backup                             # Create a backup"
    echo "  $0 restore backups/prayer-data-*.tar.gz  # Restore from backup"
}

# Main script
main() {
    check_docker
    check_docker_compose
    
    case "${1:-help}" in
        build)
            build
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        status)
            status
            ;;
        logs)
            logs
            ;;
        dev)
            dev
            ;;
        update)
            update
            ;;
        backup)
            backup
            ;;
        restore)
            restore "$2"
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
