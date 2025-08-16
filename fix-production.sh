#!/bin/bash

echo "=== PeluPrice Production Fix Script ==="
echo "This script will diagnose and fix the Docker networking issue"
echo ""

# Check if running as root or with docker permissions
if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Cannot access Docker. Make sure you have Docker permissions."
    exit 1
fi

echo "1. Checking current container status..."
docker ps -a --filter "name=peluprice"

echo ""
echo "2. Checking Docker networks..."
docker network ls | grep peluprice

echo ""
echo "3. Stopping all PeluPrice containers..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "4. Cleaning up orphaned networks..."
docker network prune -f

echo ""
echo "5. Rebuilding and starting with fresh network..."
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate

echo ""
echo "6. Waiting for services to start..."
sleep 10

echo ""
echo "7. Checking container status after restart..."
docker ps --filter "name=peluprice"

echo ""
echo "8. Testing network connectivity..."
echo "Checking if backend can reach database..."
docker exec peluprice-backend nc -z db 5432 && echo "✓ Port 5432 reachable" || echo "✗ Port 5432 NOT reachable"

echo ""
echo "9. Checking backend logs (last 20 lines)..."
docker logs --tail 20 peluprice-backend

echo ""
echo "=== Fix Complete ==="
echo "If the issue persists, check the full logs with:"
echo "docker logs -f peluprice-backend"
