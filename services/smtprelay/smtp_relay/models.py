from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass(frozen=True, slots=True)
class InboundMeta:
    peer: str
    helo: str | None
    envelope_from: str
    envelope_to: List[str]


@dataclass(frozen=True, slots=True)
class RelayAttempt:
    started_at: datetime
    finished_at: datetime | None
    ok: bool
    error: str | None


@dataclass(frozen=True, slots=True)
class StoredMessage:
    message_id: str
    received_at: datetime
    peer: str
    helo: str | None
    envelope_from: str
    envelope_to: List[str]
    subject: str | None
    size_bytes: int
    sha256: str
    relay_attempt: RelayAttempt | None
