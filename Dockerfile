# ScopeGuard Full Stack Dockerfile
# Multi-stage build: React frontend + FastAPI backend

# ============================================
# Stage 1: Build React Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Copy package files
COPY apps/web/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY apps/web/ ./

# Set production API URL (same origin)
ENV VITE_API_URL=""

# Build the frontend (skip tsc, just vite build)
RUN npx vite build

# ============================================
# Stage 2: Python Backend + Static Files
# ============================================
FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app/ ./app/
COPY alembic.ini ./
COPY alembic/ ./alembic/

# Copy built frontend from stage 1
COPY --from=frontend-builder /build/dist ./static

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
