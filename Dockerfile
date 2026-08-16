# ==============================================================================
# Production Multi-Stage Dockerfile for Cooperative Fund Management System
# Ministry Cooperative Contributory Fund
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Minify Frontend Application
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (utilizing layer caching)
COPY package*.json ./
RUN npm ci

# Copy full application source code
COPY . .

# Run automated tests to guarantee build integrity before bundle creation
RUN npm run test:run || npm test

# Compile production static bundle
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Nginx Server
# ------------------------------------------------------------------------------
FROM nginx:1.25-alpine AS runner

# Create non-root system user for enhanced security
RUN addgroup -g 1001 -S coopgroup && \
    adduser -S coopuser -u 1001 -G coopgroup

# Remove default nginx static web pages
RUN rm -rf /usr/share/nginx/html/*

# Copy custom hardened nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Grant ownership to non-root user
RUN chown -R coopuser:coopgroup /usr/share/nginx/html && \
    chown -R coopuser:coopgroup /var/cache/nginx && \
    chown -R coopuser:coopgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R coopuser:coopgroup /var/run/nginx.pid

# Switch to non-root execution
USER coopuser

# Expose HTTP port
EXPOSE 80

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
