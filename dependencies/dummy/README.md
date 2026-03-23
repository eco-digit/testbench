# Database & MinIO – Backup & Restore

These scripts and dumps help to restore a Dummy Application for ECO:DIGIT as a starting point.

- `dump_database.sh` – create a database backup (testbench_db and timescale)
- `restore_database.sh` – restore a database backup (testbench_db and timescale)
- `upload_minio_files.sh` – upload local files into MinIO
- `import_minio_files.sh` – download files from MinIO into a local folder

---

## Prerequisites

- Bash
- PostgreSQL client tools (`pg_dump`, `pg_restore`)
- MinIO Client (`mc`)

---

## Quickstart

Below are the basic commands to dump/restore a database and transfer files with MinIO.
Please note: this is only applicable if you want to run the shell scripts separately.
To import everything in one go, see step 5.

### 1. Dump database

```
bash dump_database.sh \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -P "$DB_PASSWORD" \
  -d "$DB_NAME" \
  -f ./backup_file.dump
```

### 2. Restore database

The -f option specifies the dump file you want to restore.
```
bash restore_database.sh \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -P "$DB_PASSWORD" \
  -d "$DB_DB" \
  -f ./backup_file.dump
```

### 3. Download files from MinIO

```
bash import_minio_files.sh \
  -H "$MINIO_HOST" \
  -u "$MINIO_USER" \
  -p "$MINIO_PASSWORD" \
  -b "$MINIO_BUCKET" \
  -f ./files_minio
```

### 4. Upload files to MinIO

The -f option specifies the local folder whose contents will be uploaded into MinIO.
```
bash upload_minio.sh \
  -H "$MINIO_HOST" \
  -u "$MINIO_USER" \
  -p "$MINIO_PASSWORD" \
  -b "$MINIO_BUCKET" \
  -f ./files_minio
```

### 5. Run Docker service 

NOTE: For testing purposes please put your Timescale DB Name, i.e. arthur_yourName into to the .env.

To import the Dummy Application (databases + MinIO files) in one go, run:

```
 docker compose -f compose.local.yml run --rm restore-dummy

```


