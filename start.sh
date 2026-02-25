#!/bin/sh

echo "🚀 Starting Invoice System..."

cd /app/server

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database..."
MAX_RETRIES=30
RETRY_COUNT=0
until npx prisma db execute --schema=./prisma/schema.prisma --stdin <<< "SELECT 1" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "⚠️ Database not available after ${MAX_RETRIES} retries, continuing anyway..."
        break
    fi
    echo "  Waiting for database... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

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
echo "🌐 Starting Nginx..."
nginx -g "daemon off;"
