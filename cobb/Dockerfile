# build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .
RUN npm run build -- --configuration=dev

# run stage
FROM nginx:alpine
WORKDIR /
EXPOSE 80
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY /ecodigit.conf.template /etc/nginx/templates/default.conf.template

