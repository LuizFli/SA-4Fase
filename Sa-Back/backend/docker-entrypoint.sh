#!/bin/sh
set -e

# If DB_HOST is provided and DATABASE_URL is not, construct DATABASE_URL
if [ -n "${DB_HOST}" ] && [ -z "${DATABASE_URL}" ]; then
  DB_USER="${DB_USER:-root}"
  DB_PASS="${DB_PASS:-senai}"
  DB_PORT="${DB_PORT:-3306}"
  DB_NAME="${DB_NAME:-selesigth_db}"
  DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
  export DATABASE_URL
  echo "[entrypoint] Set DATABASE_URL from DB_HOST: ${DATABASE_URL}"
fi

# If DATABASE_URL is provided explicitly, ensure it's exported and write it
# to /app/.env so code that reads a .env file (or Prisma using dotenv) can pick it up.
if [ -n "${DATABASE_URL}" ]; then
  echo "[entrypoint] DATABASE_URL present; exporting and writing to /app/.env"
  export DATABASE_URL
  mkdir -p /app
  # Write with double quotes around the value to preserve special chars
  printf 'DATABASE_URL="%s"\n' "${DATABASE_URL}" > /app/.env
fi

exec "$@"
