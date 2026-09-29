#!/bin/bash
# Runs automatically on first container start (docker-entrypoint-initdb.d).
# Creates one database per microservice, as required by the "separate
# database per service" pattern, while still using a single Postgres
# container for local Docker Compose development.
set -e

for DB in user_db product_db order_db notification_db; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE $DB' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB')\gexec
EOSQL
done
