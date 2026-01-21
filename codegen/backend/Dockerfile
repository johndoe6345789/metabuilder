FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

RUN mkdir -p /data

ENV PORT=5001
ENV DEBUG=false
ENV DATABASE_PATH=/data/codeforge.db

EXPOSE 5001

VOLUME ["/data"]

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "4", "--timeout", "120", "app:app"]
