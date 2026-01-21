from __future__ import annotations

import hashlib
import itertools
from collections import deque
from dataclasses import dataclass
from datetime import datetime
from typing import Deque, Dict, Iterable, List, Optional, Tuple

from .models import RelayAttempt, StoredMessage, utc_now


@dataclass(frozen=True, slots=True)
class StatsSnapshot:
    started_at: datetime
    received_total: int
    relayed_ok_total: int
    relayed_fail_total: int
    stored_count: int


class MessageStore:
    def __init__(self, max_store: int) -> None:
        self._max_store = max_store
        self._started_at = utc_now()
        self._seq = itertools.count(1)
        self._order: Deque[str] = deque()
        self._items: Dict[str, StoredMessage] = {}
        self._received_total = 0
        self._relayed_ok_total = 0
        self._relayed_fail_total = 0

    def started_at(self) -> datetime:
        return self._started_at

    def stats(self) -> StatsSnapshot:
        return StatsSnapshot(
            started_at=self._started_at,
            received_total=self._received_total,
            relayed_ok_total=self._relayed_ok_total,
            relayed_fail_total=self._relayed_fail_total,
            stored_count=len(self._order),
        )

    def add_received(
        self,
        peer: str,
        helo: str | None,
        envelope_from: str,
        envelope_to: List[str],
        subject: str | None,
        raw_bytes: bytes,
    ) -> str:
        self._received_total += 1
        seq = next(self._seq)
        msg_id = f"{seq:08d}"
        sha = hashlib.sha256(raw_bytes).hexdigest()
        item = StoredMessage(
            message_id=msg_id,
            received_at=utc_now(),
            peer=peer,
            helo=helo,
            envelope_from=envelope_from,
            envelope_to=list(envelope_to),
            subject=subject,
            size_bytes=len(raw_bytes),
            sha256=sha,
            relay_attempt=None,
        )
        self._items[msg_id] = item
        self._order.appendleft(msg_id)
        self._trim()
        return msg_id

    def set_relay_attempt(self, message_id: str, attempt: RelayAttempt) -> None:
        item = self._items.get(message_id)
        if item is None:
            return
        if attempt.ok:
            self._relayed_ok_total += 1
        else:
            self._relayed_fail_total += 1
        self._items[message_id] = StoredMessage(
            message_id=item.message_id,
            received_at=item.received_at,
            peer=item.peer,
            helo=item.helo,
            envelope_from=item.envelope_from,
            envelope_to=item.envelope_to,
            subject=item.subject,
            size_bytes=item.size_bytes,
            sha256=item.sha256,
            relay_attempt=attempt,
        )

    def get(self, message_id: str) -> StoredMessage | None:
        return self._items.get(message_id)

    def list_recent(self) -> List[StoredMessage]:
        return [self._items[mid] for mid in list(self._order)]

    def _trim(self) -> None:
        while len(self._order) > self._max_store:
            tail = self._order.pop()
            self._items.pop(tail, None)
