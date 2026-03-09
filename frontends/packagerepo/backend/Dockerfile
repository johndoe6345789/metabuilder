FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN for i in 1 2 3 4 5; do \
      pip install --no-cache-dir -r requirements.txt && break \
      || (echo "pip failed (attempt $i/5), retrying in $((i*10))s..." && sleep $((i*10))); \
    done

# Copy application files
COPY backend/app.py backend/auth.py backend/config_db.py backend/auth_sqlalchemy.py backend/config_db_sqlalchemy.py backend/models.py backend/rocksdb_store.py ./

# Copy schema to where app.py expects it (parent of /app = /)
COPY schema.json /schema.json

# Create data directory
RUN mkdir -p /data/blobs /data/meta

ENV DATA_DIR=/data
ENV FLASK_APP=app.py

EXPOSE 5000

CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]
