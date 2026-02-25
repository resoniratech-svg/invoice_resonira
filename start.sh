#!/bin/sh

echo "🚀 Starting Invoice System..."

# Run Prisma migrations
echo "📦 Running database migrations..."
cd /app/server
npx prisma migrate deploy --schema=./prisma/schema.prisma 2>&1 || echo "⚠️ Migration skipped (no DATABASE_URL or DB not ready)"

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
