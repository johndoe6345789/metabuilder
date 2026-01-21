from __future__ import annotations

import unittest

from smtp_relay.store import MessageStore


class TestStore(unittest.TestCase):
    def test_trims(self) -> None:
        s = MessageStore(max_store=10)
        for i in range(20):
            s.add_received(
                peer="p",
                helo=None,
                envelope_from="a",
                envelope_to=["b"],
                subject=None,
                raw_bytes=b"x" * i,
            )
        self.assertEqual(s.stats().stored_count, 10)
        self.assertIsNotNone(s.get("00000020"))
        self.assertIsNone(s.get("00000001"))
