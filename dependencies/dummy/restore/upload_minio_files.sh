#!/bin/bash

usage() {
  echo "Usage: $0 [-H host] [-u user] [-p password] [-b bucket] [-f folder]"
  exit 1
}

while getopts ":H:u:p:b:f:" opt; do
  case "$opt" in
    H) MINIO_HOST="$OPTARG" ;;
    u) MINIO_USER="$OPTARG" ;;
    p) MINIO_PASSWORD="$OPTARG" ;;
    b) MINIO_BUCKET="$OPTARG" ;;
    f) MINIO_FOLDER="$OPTARG" ;;
    :) echo "Error: Option -$OPTARG needs an argument." ; usage ;;
    \?) echo "Error: Unknown Option -$OPTARG" ; usage ;;
  esac
done

mc alias set minio "$MINIO_HOST" "$MINIO_USER" "$MINIO_PASSWORD"

if [ -d "$MINIO_FOLDER" ]; then
  mc cp --recursive "$MINIO_FOLDER"/* minio/"$MINIO_BUCKET"/
else
  echo "Folder $MINIO_FOLDER could not be found."
fi