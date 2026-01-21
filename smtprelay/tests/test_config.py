from __future__ import annotations

import os
import unittest

from smtp_relay.config import RelayConfig


class TestConfig(unittest.TestCase):
    def setUp(self) -> None:
        self._old = dict(os.environ)

    def tearDown(self) -> None:
        os.environ.clear()
        os.environ.update(self._old)

    def _base_env(self) -> None:
        os.environ["GMAIL_USERNAME"] = "u@example.com"
        os.environ["GMAIL_APP_PASSWORD"] = "pw"
        os.environ["FORWARD_TO"] = "dest@example.com"

    def test_requires_env(self) -> None:
        os.environ.clear()
        with self.assertRaises(ValueError):
            RelayConfig.from_env()

    def test_smtp_port_must_be_gt_1024(self) -> None:
        os.environ.clear()
        self._base_env()
        os.environ["SMTP_LISTEN_PORT"] = "1024"
        with self.assertRaises(ValueError):
            RelayConfig.from_env()

    def test_http_port_must_be_gt_1024(self) -> None:
        os.environ.clear()
        self._base_env()
        os.environ["HTTP_LISTEN_PORT"] = "1024"
        with self.assertRaises(ValueError):
            RelayConfig.from_env()

    def test_parses_forward_to_csv(self) -> None:
        os.environ.clear()
        os.environ["GMAIL_USERNAME"] = "u@example.com"
        os.environ["GMAIL_APP_PASSWORD"] = "pw"
        os.environ["FORWARD_TO"] = "a@example.com, b@example.com,, "
        cfg = RelayConfig.from_env()
        self.assertEqual(cfg.forward_to, ["a@example.com", "b@example.com"])
