from __future__ import annotations

from twisted.internet import reactor
from twisted.python import log

from .config import RelayConfig
from .http_server import make_site
from .smtp_server import RelaySMTPFactory
from .store import MessageStore


def run(cfg: RelayConfig) -> None:
    store = MessageStore(cfg.max_store)

    log.startLogging(open("/dev/stdout", "w"))  # type: ignore[arg-type]

    smtp_factory = RelaySMTPFactory(cfg, store)
    reactor.listenTCP(cfg.smtp_listen_port, smtp_factory,
                      interface=cfg.smtp_listen_host)
    log.msg(
        f"SMTP listening on {cfg.smtp_listen_host}:{cfg.smtp_listen_port}"
    )

    site = make_site(store)
    reactor.listenTCP(cfg.http_listen_port, site,
                      interface=cfg.http_listen_host)
    log.msg(
        f"HTTP listening on {cfg.http_listen_host}:{cfg.http_listen_port}"
    )

    reactor.run()
