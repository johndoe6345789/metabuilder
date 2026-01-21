# Twisted SMTP Ingest + Gmail Relay + HTTP Stats

Set SMTP_LISTEN_HOST=0.0.0.0 and HTTP_LISTEN_HOST=0.0.0.0 so Twisted binds the SMTP and HTTP listeners to all interfaces.

- **SMTP server** (Twisted) listens on a **non-privileged port (>1024)** and accepts mail.
- **SMTP client** (Twisted) relays received mail to **Gmail SMTP (submission)** via STARTTLS.
- **HTTP server** (Twisted Web) serves a simple dashboard with:
  - server stats (uptime, counters)
  - list of relayed messages (recent first)
  - per-message detail view

## Install
```bash
python -m venv .venv
# Windows:
.venv\Scripts\python -m pip install -r requirements.txt
# Linux/macOS:
.venv/bin/python -m pip install -r requirements.txt
```

## Configure (environment variables)
Required:
- `GMAIL_USERNAME`
- `GMAIL_APP_PASSWORD`
- `FORWARD_TO` (comma-separated list)

Optional:
- `SMTP_LISTEN_HOST` (default: 127.0.0.1)
- `SMTP_LISTEN_PORT` (default: 2525, must be >1024)
- `HTTP_LISTEN_HOST` (default: 127.0.0.1)
- `HTTP_LISTEN_PORT` (default: 8080, must be >1024)
- `GMAIL_HOST` (default: smtp.gmail.com)
- `GMAIL_PORT` (default: 587)
- `RELAY_FROM` (default: GMAIL_USERNAME)
- `ALLOW_ANY_RCPT` (default: true) - if false, only accept RCPT that match FORWARD_TO.
- `ADD_X_HEADERS` (default: true) - add X-Original-* headers.
- `MAX_STORE` (default: 200) - max number of message records kept in memory.

## Run
PowerShell:
```powershell
$env:GMAIL_USERNAME="you@gmail.com"
$env:GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
$env:FORWARD_TO="you@gmail.com"
$env:SMTP_LISTEN_PORT="2525"
$env:HTTP_LISTEN_PORT="8080"
.venv\Scripts\python -m smtp_relay.main
```

Open dashboard:
- http://127.0.0.1:8080/

## Send a test email (to your local relay)
```bash
python scripts/send_test_mail.py --host 127.0.0.1 --port 2525 --to you@gmail.com
```

## Tests
```bash
python -m unittest -v
```

## Security notes
This is intended for local / controlled networks. If you expose it publicly:
- firewall/VPN it
- authenticate clients
- rate limit
- set `ALLOW_ANY_RCPT=false`


## Docker

Build and run with compose:
```bash
docker compose up --build
```

Then:
- SMTP: localhost:2525
- Dashboard: http://localhost:8080/

Provide env vars via your shell or a `.env` file:
- `GMAIL_USERNAME`
- `GMAIL_APP_PASSWORD`
- `FORWARD_TO`
