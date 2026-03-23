FROM nginx


#COPY /dev.ecodigit.conf.template /etc/nginx/templates/dev.ecodigit.conf.template
COPY /full.ecodigit.conf /etc/nginx/conf.d/default.conf

# Copy self-signed certificate and key
COPY certs/dev.crt /etc/nginx/certs/dev.crt
COPY certs/dev.key /etc/nginx/certs/dev.key