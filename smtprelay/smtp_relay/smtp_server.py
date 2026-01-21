from __future__ import annotations

from typing import List

from twisted.internet import defer
from twisted.mail import smtp
from twisted.python import log

from .config import RelayConfig
from .models import InboundMeta, RelayAttempt, utc_now
from .relay_client import extract_subject, relay_to_gmail
from .store import MessageStore

from zope.interface import implementer

def _norm_addr(addr: str) -> str:
    return addr.strip().lower()


def _decode_addr(addr: smtp.Address) -> str:
    return str(addr)

@implementer(smtp.IMessage)
class _Message:
    def __init__(self, cfg: RelayConfig, store: MessageStore, meta: InboundMeta) -> None:
        self._cfg = cfg
        self._store = store
        self._meta = meta
        self._lines: List[bytes] = []

    def lineReceived(self, line: bytes) -> None:
        self._lines.append(line)

    def eomReceived(self) -> defer.Deferred[None]:
        raw = b"\n".join(self._lines) + b"\n"
        subject = extract_subject(raw)
        msg_id = self._store.add_received(
            peer=self._meta.peer,
            helo=self._meta.helo,
            envelope_from=self._meta.envelope_from,
            envelope_to=self._meta.envelope_to,
            subject=subject,
            raw_bytes=raw,
        )
        attempt = RelayAttempt(started_at=utc_now(), finished_at=None, ok=False,
                              error=None)

        d = relay_to_gmail(self._cfg, raw, self._meta)

        def _ok(_: object) -> None:
            finished = RelayAttempt(
                started_at=attempt.started_at,
                finished_at=utc_now(),
                ok=True,
                error=None,
            )
            self._store.set_relay_attempt(msg_id, finished)

        def _fail(failure):  # type: ignore[no-untyped-def]
            finished = RelayAttempt(
                started_at=attempt.started_at,
                finished_at=utc_now(),
                ok=False,
                error=str(getattr(failure, "getErrorMessage", lambda: failure)()),
            )
            self._store.set_relay_attempt(msg_id, finished)
            log.err(failure, "Failed to relay message to Gmail")
            return None

        d.addCallback(_ok)
        d.addErrback(_fail)
        return d

    def connectionLost(self) -> None:
        self._lines.clear()

@implementer(smtp.IMessageDelivery)
class _Delivery:
    def __init__(self, cfg: RelayConfig, store: MessageStore) -> None:
        self._cfg = cfg
        self._store = store
        self._peer = "unknown"
        self._helo: str | None = None
        self._mail_from = ""
        self._rcpt_tos: List[str] = []

    def receivedHeader(self, helo: smtp.IHelo, origin, recipients):  # type: ignore[no-untyped-def]
        return None

    def validateFrom(self, helo: smtp.IHelo, origin: smtp.Address):  # type: ignore[no-untyped-def]
        self._helo = getattr(helo, "host", None) if helo else None
        self._mail_from = _decode_addr(origin)
        return origin

    def validateTo(self, user: smtp.User):  # type: ignore[no-untyped-def]
        rcpt = _decode_addr(user.dest)
        if not self._cfg.allow_any_rcpt:
            allowed = {_norm_addr(a) for a in self._cfg.forward_to}
            if _norm_addr(rcpt) not in allowed:
                raise smtp.SMTPBadRcpt(user, b"550 relaying denied")
        self._rcpt_tos.append(rcpt)

        def _mk() -> _Message:
            meta = InboundMeta(
                peer=self._peer,
                helo=self._helo,
                envelope_from=self._mail_from,
                envelope_to=list(self._rcpt_tos),
            )
            return _Message(self._cfg, self._store, meta)

        return _mk

    def setPeer(self, peer: str) -> None:
        self._peer = peer


class _PeerTrackingESMTP(smtp.ESMTP):
    def connectionMade(self) -> None:
        super().connectionMade()
        peer = self.transport.getPeer()
        peer_str = f"{peer.host}:{peer.port}"
        delivery = self.factory.delivery  # type: ignore[attr-defined]
        if hasattr(delivery, "setPeer"):
            delivery.setPeer(peer_str)


class RelaySMTPFactory(smtp.SMTPFactory):
    protocol = _PeerTrackingESMTP
    def __init__(self, cfg, store):
        self.delivery = _Delivery(cfg, store)
        super().__init__()

    def buildProtocol(self, addr):
        p = super().buildProtocol(addr)
        # attach the delivery object so validateFrom/validateTo work
        p.delivery = self.delivery
        return p
