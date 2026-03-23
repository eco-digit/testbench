#!/usr/bin/env bash
set -e

bash /work/restore/restore_database.sh \
  -h "$PG_HOST" -p "$PG_PORT" \
  -U "$PG_USER" -P "$PG_PASSWORD" \
  -d "$PG_DB" -f "/data/$PG_DUMP"

bash /work/restore/restore_database.sh \
  -h "$TS_HOST" -p "$TS_PORT" \
  -U "$TS_USER" -P "$TS_PASSWORD" \
  -d "$TS_DB" -f "/data/$TS_DUMP"

bash /work/restore/upload_minio.sh \
  -H "$MINIO_HOST" \
  -u "$MINIO_USER" \
  -p "$MINIO_PASSWORD" \
  -b "$MINIO_BUCKET" \
  -f "/data/$MINIO_FOLDER"