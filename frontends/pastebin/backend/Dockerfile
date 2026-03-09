FROM python:3.11-slim

WORKDIR /app

COPY frontends/pastebin/backend/requirements.txt .
RUN for i in 1 2 3 4 5; do \
      pip install --no-cache-dir -r requirements.txt && break \
      || (echo "pip failed (attempt $i/5), retrying in $((i*10))s..." && sleep $((i*10))); \
    done

COPY frontends/pastebin/backend/app.py .
COPY dbal/shared/seeds/database/pastebin_users.json /app/seeds/database/pastebin_users.json

RUN mkdir -p /app/data

EXPOSE 5000

CMD ["python", "app.py"]















