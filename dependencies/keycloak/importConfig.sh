#!/bin/bash

# Execute the Keycloak import command
docker exec keycloak /opt/keycloak/bin/kc.sh import --dir /opt/keycloak/data/import --override true