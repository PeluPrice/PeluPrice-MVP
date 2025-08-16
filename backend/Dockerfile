
# Multi-stage build for better caching and smaller image
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Set the working directory
WORKDIR /app

# Copy dependency files first for better layer caching
COPY pyproject.toml uv.lock* ./

# Install dependencies in the system Python
RUN uv sync --frozen --no-install-project --no-dev

# Production stage
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy UV from builder stage
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set the working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/.venv /app/.venv

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app:/app/scripts"
ENV ENVIRONMENT=production

# Make start.sh executable
RUN chmod +x start.sh

# Create a non-root user for security
RUN groupadd -r peluprice && useradd -r -g peluprice peluprice
RUN chown -R peluprice:peluprice /app
USER peluprice

# Expose the port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Command to run the application using start.sh
CMD ["./start.sh"]
