# Backend Dockerfile
FROM node:18-alpine

# Install postgres-client to execute SQL migrations and seeds
RUN apk add --no-cache postgresql-client

WORKDIR /app

# 1. FIX: Point to the backend folder specifically
COPY backend/package*.json ./
RUN npm install

# 2. FIX: Copy the backend source folder content
COPY backend/ .

# Mandatory backend port
EXPOSE 5000

# Mandatory Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"


# AUTOMATIC INITIALIZATION: 
CMD until pg_isready -h $DB_HOST -U $DB_USER; do echo waiting for database; sleep 2; done && \
    export PGPASSWORD=$DB_PASSWORD && \
    for f in migrations/*.sql; do psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$f"; done && \
    psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f seeds/seed_data.sql && \
    unset PGPASSWORD && \
    node src/index.js