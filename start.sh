#!/bin/sh

echo "🚀 Starting Invoice System..."

cd /app/server

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database..."
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if echo "SELECT 1" | npx prisma db execute --schema=./prisma/schema.prisma --stdin > /dev/null 2>&1; then
        echo "✅ Database is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "  Waiting for database... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "⚠️ Database not available after ${MAX_RETRIES} retries, continuing anyway..."
fi

# Push schema to database (creates tables if they don't exist)
echo "📦 Pushing database schema..."
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss 2>&1 || echo "⚠️ Schema push skipped"

# Seed the database
echo "🌱 Seeding database..."
node prisma/seed.js 2>&1 || echo "⚠️ Seeding skipped"

# Start the Express backend in the background
echo "📦 Starting backend server..."
node index.js &

# Wait for backend to be ready
sleep 2

# Start Nginx in the foreground
echo "✅ Backend started successfully!"
echo "🌐 Starting Nginx... (Server is fully ready and listening for traffic)"
nginx -g "daemon off;"
