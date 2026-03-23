#!/bin/bash

# Set the name of the exported file
export_file="ecodigit-realm.json"

# Execute the Keycloak export command
docker exec keycloak /opt/keycloak/bin/kc.sh export --dir /opt/keycloak/data/export --realm ecodigit --users realm_file

# Copy the exported file to config directory
docker cp keycloak:/opt/keycloak/data/export/${export_file} ./realms/${export_file}
#
## Process file to improve diff
docker run --rm -v ./realms/${export_file}:/data/input.json ghcr.io/jqlang/jq --sort-keys '.' /data/input.json > ./realms/formatted-${export_file}
mv ./realms/formatted-${export_file} ./realms/${export_file}
