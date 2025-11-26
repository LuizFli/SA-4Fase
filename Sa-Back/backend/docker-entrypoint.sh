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

# If SIMULATOR_HOST is provided and SIMULATOR_URL is not, construct SIMULATOR_URL
if [ -n "${SIMULATOR_HOST}" ] && [ -z "${SIMULATOR_URL}" ]; then
  SIMULATOR_PORT="${SIMULATOR_PORT:-3000}"
  SIMULATOR_PROTOCOL="${SIMULATOR_PROTOCOL:-http}"
  SIMULATOR_URL="${SIMULATOR_PROTOCOL}://${SIMULATOR_HOST}:${SIMULATOR_PORT}"
  export SIMULATOR_URL
  echo "[entrypoint] Set SIMULATOR_URL from SIMULATOR_HOST: ${SIMULATOR_URL}"
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

# If SIMULATOR_URL is provided (or constructed), write it to .env
if [ -n "${SIMULATOR_URL}" ]; then
  echo "[entrypoint] SIMULATOR_URL present; exporting and writing to /app/.env"
  export SIMULATOR_URL
  mkdir -p /app
  printf 'SIMULATOR_URL="%s"\n' "${SIMULATOR_URL}" >> /app/.env
fi

# If CORS_ALLOWED_ORIGINS is provided, write it to .env
if [ -n "${CORS_ALLOWED_ORIGINS}" ]; then
  echo "[entrypoint] CORS_ALLOWED_ORIGINS present; exporting and writing to /app/.env"
  export CORS_ALLOWED_ORIGINS
  mkdir -p /app
  printf 'CORS_ALLOWED_ORIGINS="%s"\n' "${CORS_ALLOWED_ORIGINS}" >> /app/.env
fi

exec "$@"
