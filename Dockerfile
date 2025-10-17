FROM node:22-alpine

# instalar postgres server
RUN apk update && apk add postgresql postgresql-contrib su-exec bash
RUN mkdir -p /run/postgresql /var/lib/postgresql/data
RUN chown -R postgres:postgres /run/postgresql/ /var/lib/postgresql/data

USER postgres
RUN initdb -D /var/lib/postgresql/data && \
    pg_ctl start -D /var/lib/postgresql/data && \
    psql --command "CREATE USER usuario WITH PASSWORD '123456';" && \
    psql --command "CREATE DATABASE bd_monolito OWNER usuario;" && \
    pg_ctl stop -D /var/lib/postgresql/data

USER root
WORKDIR /app
COPY . .

RUN npm install
EXPOSE 3000

# CMD iniciar postgress && node init-db.js && npm start
CMD su-exec postgres pg_ctl -D /var/lib/postgresql/data start && node init-db.js && npm start