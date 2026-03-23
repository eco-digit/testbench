#!/bin/bash

SCHEMA="public"

usage() {
  echo "Usage: $0 [-h host] [-p port] [-U user] [-P password] [-d dbname] [-f dumpfile]"
  exit 1
}

while getopts ":h:p:U:P:d:f:" opt; do
  case "$opt" in
    h) DB_HOST="$OPTARG" ;;
    p) DB_PORT="$OPTARG" ;;
    U) DB_USER="$OPTARG" ;;
    P) DB_PASSWORD="$OPTARG" ;;
    d) DB_NAME="$OPTARG" ;;
    f) DB_FILE="$OPTARG" ;;
    :) echo "Error: Option -$OPTARG needs an argument." ; usage ;;
    \?) echo "Erros: Unknown Option -$OPTARG" ; usage ;;
  esac
done

PGPASSWORD="$DB_PASSWORD" \
pg_restore -h "$DB_HOST" \
          -p "$DB_PORT" \
          -U "$DB_USER" \
          -d "$DB_NAME" \
          --schema="$SCHEMA" \
          --clean \
          "$DB_FILE"