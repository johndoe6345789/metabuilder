FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN for i in 1 2 3 4 5; do \
      pip install --no-cache-dir -r requirements.txt && break \
      || (echo "pip failed (attempt $i/5), retrying in $((i*10))s..." && sleep $((i*10))); \
    done

COPY app.py .

RUN mkdir -p /data

ENV PORT=5001
ENV DEBUG=false
ENV DATABASE_PATH=/data/codeforge.db

EXPOSE 5001

VOLUME ["/data"]

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "4", "--timeout", "120", "app:app"]
