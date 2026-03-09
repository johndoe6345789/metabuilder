from __future__ import annotations

from dataclasses import dataclass
from os import environ
from typing import List


def _get_env(name: str) -> str | None:
    value = environ.get(name)
    if value is None:
        return None
    value = value.strip()
    return value if value else None


def _get_env_bool(name: str, default: bool) -> bool:
    raw = _get_env(name)
    if raw is None:
        return default
    return raw.lower() in {"1", "true", "yes", "y", "on"}


def _get_env_int(name: str, default: int) -> int:
    raw = _get_env(name)
    if raw is None:
        return default
    return int(raw)


def _split_csv(raw: str) -> List[str]:
    parts = [p.strip() for p in raw.split(",")]
    return [p for p in parts if p]


@dataclass(frozen=True, slots=True)
class RelayConfig:
    smtp_listen_host: str
    smtp_listen_port: int
    http_listen_host: str
    http_listen_port: int

    gmail_host: str
    gmail_port: int
    gmail_username: str
    gmail_app_password: str

    relay_from: str
    forward_to: List[str]

    allow_any_rcpt: bool
    add_x_headers: bool
    max_store: int

    @staticmethod
    def from_env() -> "RelayConfig":
        username = _get_env("GMAIL_USERNAME")
        password = _get_env("GMAIL_APP_PASSWORD")
        forward_to_raw = _get_env("FORWARD_TO")

        if not username:
            raise ValueError("Missing env var: GMAIL_USERNAME")
        if not password:
            raise ValueError("Missing env var: GMAIL_APP_PASSWORD")
        if not forward_to_raw:
            raise ValueError("Missing env var: FORWARD_TO")

        smtp_host = _get_env("SMTP_LISTEN_HOST") or "127.0.0.1"
        smtp_port = _get_env_int("SMTP_LISTEN_PORT", 2525)
        if smtp_port <= 1024:
            raise ValueError("SMTP_LISTEN_PORT must be > 1024")

        http_host = _get_env("HTTP_LISTEN_HOST") or "127.0.0.1"
        http_port = _get_env_int("HTTP_LISTEN_PORT", 8080)
        if http_port <= 1024:
            raise ValueError("HTTP_LISTEN_PORT must be > 1024")

        gmail_host = _get_env("GMAIL_HOST") or "smtp.gmail.com"
        gmail_port = _get_env_int("GMAIL_PORT", 587)

        relay_from = _get_env("RELAY_FROM") or username
        forward_to = _split_csv(forward_to_raw)

        allow_any_rcpt = _get_env_bool("ALLOW_ANY_RCPT", True)
        add_x_headers = _get_env_bool("ADD_X_HEADERS", True)
        max_store = _get_env_int("MAX_STORE", 200)

        if max_store < 10:
            raise ValueError("MAX_STORE must be >= 10")

        return RelayConfig(
            smtp_listen_host=smtp_host,
            smtp_listen_port=smtp_port,
            http_listen_host=http_host,
            http_listen_port=http_port,
            gmail_host=gmail_host,
            gmail_port=gmail_port,
            gmail_username=username,
            gmail_app_password=password,
            relay_from=relay_from,
            forward_to=forward_to,
            allow_any_rcpt=allow_any_rcpt,
            add_x_headers=add_x_headers,
            max_store=max_store,
        )
