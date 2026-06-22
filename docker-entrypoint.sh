#!/bin/sh
set -e

# Wait for DB if needed (though depends_on with healthcheck handles most cases)
echo "⏳ Waiting for database migrations..."

# Run Prisma migrations
# Using db push for development/initial setup simplicity in this context, 
# but migrate deploy is better for production.
npx prisma db push --accept-data-loss

echo "🌱 Running seed data..."
npx prisma db seed

echo "🚀 Starting Netjes Laundry App..."
node server.js
