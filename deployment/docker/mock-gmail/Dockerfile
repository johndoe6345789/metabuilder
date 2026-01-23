# Mock Gmail SMTP Server for local development
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create mock Gmail SMTP server
RUN cat > /app/mock_gmail.py << 'EOF'
#!/usr/bin/env python3
import asyncio
import email
from aiosmtpd.controller import Controller
from aiosmtpd.smtp import SMTP as SMTPProtocol

class MockGmailHandler:
    async def handle_DATA(self, server, session, envelope):
        """Accept all emails"""
        print(f"[MOCK GMAIL] Received email from {envelope.mail_from}")
        print(f"[MOCK GMAIL] Recipients: {envelope.rcpt_tos}")
        print(f"[MOCK GMAIL] Message size: {len(envelope.content)} bytes")
        return '250 Message accepted'

async def main():
    handler = MockGmailHandler()
    controller = Controller(
        handler,
        hostname='0.0.0.0',
        port=587,
        require_starttls=False,
        auth_required=True,
        auth_mechanism='LOGIN'
    )
    controller.start()
    print("[MOCK GMAIL] Server listening on 0.0.0.0:587")
    print("[MOCK GMAIL] Accepting all credentials")

    # Keep running
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        controller.stop()

if __name__ == '__main__':
    # Install aiosmtpd
    import subprocess
    subprocess.run(['pip', 'install', '-q', 'aiosmtpd'], check=True)
    asyncio.run(main())
EOF

chmod +x /app/mock_gmail.py

EXPOSE 587

CMD ["python", "/app/mock_gmail.py"]
