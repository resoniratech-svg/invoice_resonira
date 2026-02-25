# ============================================
# Stage 1: Build the React Frontend
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy frontend package files and install deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy frontend source and build
COPY . .

# Set API URL to /api so frontend calls same domain
ENV VITE_API_URL=/api
RUN npm run build

# ============================================
# Stage 2: Production Image
# ============================================
FROM node:20-alpine

# Install Nginx and OpenSSL (needed for Prisma)
RUN apk add --no-cache nginx openssl

# Create necessary directories
RUN mkdir -p /usr/share/nginx/html /run/nginx /app/server/db/data

# Copy Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Remove default Nginx config if present
RUN rm -f /etc/nginx/http.d/default.conf.bak

# Copy built frontend from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy backend server code
COPY server/package.json /app/server/
WORKDIR /app/server

# Install production dependencies (including prisma for CLI)
RUN npm install --omit=dev && npm install prisma

# Copy the rest of backend code (including prisma schema)
COPY server/ /app/server/

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Ensure data directory exists and is writable (for JSON fallback)
RUN mkdir -p /app/server/db/data && chmod -R 777 /app/server/db/data

# Forward Nginx request and error logs to Docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Expose port 80 (Nginx)
EXPOSE 80

# Set environment defaults
ENV PORT=3002
ENV NODE_ENV=production

# Health check (Use 127.0.0.1 instead of localhost to avoid IPv6 issues in Alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1/api/health || exit 1

# Start both services
CMD ["/app/start.sh"]
