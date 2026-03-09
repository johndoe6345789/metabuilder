from __future__ import annotations

import argparse
import smtplib
from email.message import EmailMessage


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Send a test email to the local relay.")
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=2525)
    p.add_argument("--to", required=True)
    p.add_argument("--from-addr", dest="from_addr", default="test@example.com")
    p.add_argument("--subject", default="Twisted relay test")
    p.add_argument("--body", default="Hello from the Twisted SMTP relay test.")
    return p


def main() -> int:
    args = _build_parser().parse_args()
    msg = EmailMessage()
    msg["From"] = args.from_addr
    msg["To"] = args.to
    msg["Subject"] = args.subject
    msg.set_content(args.body)

    with smtplib.SMTP(args.host, args.port, timeout=10) as s:
        s.send_message(msg)
    print("Sent.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
