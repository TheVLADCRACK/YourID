#!/bin/sh
set -e

echo "Waiting for database to become ready..."
while ! nc -z postgres 5432; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Applying Prisma schema to database..."
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

echo "Starting API server..."
exec node dist/main
