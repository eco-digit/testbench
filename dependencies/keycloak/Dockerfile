FROM quay.io/keycloak/keycloak:25.0

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres

ENV KC_CUSTOM_YUSUF_HOST=http://localhost:8080
ENV KC_CUSTOM_COBB_HOST=http://localhost:4200

COPY realms/ecodigit-realm.json /opt/keycloak/data/import/ecodigit-realm.json

COPY auth-theme/ /opt/keycloak/themes/ecodigit

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm"]