FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN for i in 1 2 3 4 5; do \
      pip install --no-cache-dir -r requirements.txt && break \
      || (echo "pip failed (attempt $i/5), retrying in $((i*10))s..." && sleep $((i*10))); \
    done

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
