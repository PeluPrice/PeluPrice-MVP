# Production Deployment Guide

## Quick Fix for Current Issues

### Step 1: Update your production files
Upload the updated files to your production server:
- `docker-compose.prod.yml`
- `backend/Dockerfile.prod`
- `backend/start.sh`

### Step 2: Stop and clean current containers
```bash
# Stop all containers
docker-compose down

# Remove images to force rebuild
docker rmi peluprice-mvp-backend:latest

# Clean up unused containers and images
docker system prune -f
```

### Step 3: Deploy with the new configuration
```bash
# Build and start with the production configuration
docker-compose -f docker-compose.prod.yml up -d --build

# OR if you want to use the alternative Dockerfile:
# First, copy Dockerfile.prod to Dockerfile in backend directory
cp backend/Dockerfile.prod backend/Dockerfile
docker-compose -f docker-compose.prod.yml up -d --build
```

### Step 4: Monitor the deployment
```bash
# Check container status
docker ps -a

# Follow backend logs
docker logs -f peluprice-backend

# Test the health endpoint
curl http://localhost:8000/health

# Test the main endpoint
curl http://localhost:8000/
```

## Key Changes Made

1. **Fixed Dockerfile Issues:**
   - Removed UV dependency that was causing network timeouts
   - Added proper health checks
   - Created startup script with database waiting logic
   - Added non-root user for security

2. **Fixed Docker Compose Issues:**
   - Removed problematic volume mounts that overwrite built code
   - Added proper dependency health checks
   - Removed obsolete version field
   - Added environment variables directly instead of .env file

3. **Improved Error Handling:**
   - Added startup script that waits for dependencies
   - Better database connection handling
   - Proper logging and error reporting

## Environment Variables for Production

Set these environment variables on your production server:

```bash
export SECRET_KEY="your-actual-secret-key-here"
export JWT_SECRET_KEY="your-actual-jwt-secret-key-here"
export POSTGRES_PASSWORD="your-secure-database-password"
```

## Troubleshooting

If you still encounter issues:

1. **Check logs:**
   ```bash
   docker logs peluprice-backend
   docker logs peluprice-db
   docker logs peluprice-mqtt
   ```

2. **Test individual services:**
   ```bash
   # Test database
   docker exec -it peluprice-db psql -U peluprice -d peluprice -c "SELECT 1;"
   
   # Test MQTT
   docker exec -it peluprice-mqtt mosquitto_pub -h localhost -t test -m "hello"
   ```

3. **Check network connectivity:**
   ```bash
   docker network ls
   docker network inspect peluprice-mvp_peluprice-network
   ```

## Alternative: Simplified Deployment

If you're still having issues, try this minimal approach:

```bash
# Use the original Dockerfile but remove volume mounts
docker-compose up -d --build db mqtt
sleep 10
docker-compose up -d --build backend
```

This starts dependencies first, then the backend after a delay.
