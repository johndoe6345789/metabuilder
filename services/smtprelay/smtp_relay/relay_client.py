from __future__ import annotations

from email import policy, message_from_bytes
from email.message import EmailMessage

from twisted.internet import defer, reactor
from twisted.internet.ssl import optionsForClientTLS
from twisted.mail import smtp

from .config import RelayConfig
from .models import InboundMeta


def _as_email_message(raw_bytes: bytes) -> EmailMessage:
    msg = message_from_bytes(raw_bytes, policy=policy.default)
    if isinstance(msg, EmailMessage):
        return msg
    em = EmailMessage()
    for k, v in msg.items():
        em[k] = v
    payload = msg.get_payload(decode=True)
    if payload is None:
        em.set_content("")
    else:
        try:
            em.set_content(payload.decode("utf-8", errors="replace"))
        except Exception:
            em.set_content("")
    return em


def add_x_headers(msg: EmailMessage, meta: InboundMeta) -> None:
    msg["X-Original-Peer"] = meta.peer
    if meta.helo:
        msg["X-Original-HELO"] = meta.helo
    msg["X-Original-Mail-From"] = meta.envelope_from
    msg["X-Original-Rcpt-To"] = ", ".join(meta.envelope_to)


def extract_subject(raw_bytes: bytes) -> str | None:
    msg = message_from_bytes(raw_bytes)
    try:
        subject = msg.get("Subject")
        if subject is None:
            return None
        subject = str(subject).strip()
        return subject if subject else None
    except Exception:
        return None


def relay_to_gmail(
    cfg: RelayConfig,
    raw_message: bytes,
    meta: InboundMeta,
) -> defer.Deferred[None]:
    msg = _as_email_message(raw_message)
    if cfg.add_x_headers:
        add_x_headers(msg, meta)
    msg_bytes = msg.as_bytes()

    context = optionsForClientTLS(hostname=cfg.gmail_host)

    d: defer.Deferred[None] = smtp.sendmail(
        cfg.gmail_host,
        cfg.relay_from,
        cfg.forward_to,
        msg_bytes,
        port=cfg.gmail_port,
        username=cfg.gmail_username,
        password=cfg.gmail_app_password,
        requireTransportSecurity=True,
        reactor=reactor
    )
    return d
