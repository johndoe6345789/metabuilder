from __future__ import annotations

import html
from datetime import datetime, timezone
from typing import List

from twisted.web.resource import Resource
from twisted.web.server import Request, Site

from .store import MessageStore
from .models import StoredMessage


def _fmt_dt(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


def _esc(s: str) -> str:
    return html.escape(s, quote=True)


def _page(title: str, body: str) -> bytes:
    doc = f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{_esc(title)}</title>
  <style>
    body {{ font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
           margin: 24px; line-height: 1.4; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ padding: 8px 10px; border-bottom: 1px solid #ddd; }}
    th {{ text-align: left; }}
    .muted {{ color: #666; }}
    .pill {{ display: inline-block; padding: 2px 8px; border-radius: 999px;
             border: 1px solid #ccc; font-size: 12px; }}
    a {{ text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    code {{ background: #f6f6f6; padding: 2px 6px; border-radius: 6px; }}
  </style>
</head>
<body>
{body}
</body>
</html>"""
    return doc.encode("utf-8")


class Root(Resource):
    isLeaf = False

    def __init__(self, store: MessageStore) -> None:
        super().__init__()
        self._store = store
        self.putChild(b"", Dashboard(store))
        self.putChild(b"messages", Messages(store))


class Dashboard(Resource):
    isLeaf = True

    def __init__(self, store: MessageStore) -> None:
        super().__init__()
        self._store = store

    def render_GET(self, request: Request) -> bytes:
        s = self._store.stats()
        body = f"""
<h1>Twisted SMTP Relay</h1>
<p class="muted">Dashboard</p>

<h2>Stats</h2>
<ul>
  <li>Started: <code>{_esc(_fmt_dt(s.started_at))}</code></li>
  <li>Received: <code>{s.received_total}</code></li>
  <li>Relayed OK: <code>{s.relayed_ok_total}</code></li>
  <li>Relayed Fail: <code>{s.relayed_fail_total}</code></li>
  <li>Stored: <code>{s.stored_count}</code></li>
</ul>

<p><a href="/messages">View messages</a></p>
"""
        request.setHeader(b"content-type", b"text/html; charset=utf-8")
        return _page("SMTP Relay Dashboard", body)


class Messages(Resource):
    isLeaf = False

    def __init__(self, store: MessageStore) -> None:
        super().__init__()
        self._store = store

    def getChild(self, path: bytes, request: Request) -> Resource:
        if path == b"" or path is None:
            return self
        return MessageDetail(self._store, path.decode("utf-8", errors="replace"))

    def render_GET(self, request: Request) -> bytes:
        items = self._store.list_recent()
        rows = []
        for m in items:
            status = "PENDING"
            pill = "pill"
            if m.relay_attempt is not None:
                status = "OK" if m.relay_attempt.ok else "FAIL"
            subj = m.subject or "(no subject)"
            rows.append(
                "<tr>"
                f"<td><a href='/messages/{_esc(m.message_id)}'>{_esc(m.message_id)}</a></td>"
                f"<td><span class='{pill}'>{_esc(status)}</span></td>"
                f"<td>{_esc(_fmt_dt(m.received_at))}</td>"
                f"<td>{_esc(m.envelope_from)}</td>"
                f"<td>{_esc(', '.join(m.envelope_to))}</td>"
                f"<td>{_esc(subj)}</td>"
                f"<td>{m.size_bytes}</td>"
                "</tr>"
            )
        body = """
<h1>Messages</h1>
<p><a href="/">Back to dashboard</a></p>
<table>
  <thead>
    <tr>
      <th>ID</th><th>Status</th><th>Received</th><th>MAIL FROM</th>
      <th>RCPT TO</th><th>Subject</th><th>Size</th>
    </tr>
  </thead>
  <tbody>
""" + "\n".join(rows) + """
  </tbody>
</table>
"""
        request.setHeader(b"content-type", b"text/html; charset=utf-8")
        return _page("Messages", body)


class MessageDetail(Resource):
    isLeaf = True

    def __init__(self, store: MessageStore, message_id: str) -> None:
        super().__init__()
        self._store = store
        self._id = message_id

    def render_GET(self, request: Request) -> bytes:
        item = self._store.get(self._id)
        if item is None:
            request.setResponseCode(404)
            request.setHeader(b"content-type", b"text/html; charset=utf-8")
            return _page("Not found", "<h1>Not found</h1><p><a href='/messages'>Back</a></p>")

        status = "PENDING"
        err = ""
        started = ""
        finished = ""
        if item.relay_attempt is not None:
            status = "OK" if item.relay_attempt.ok else "FAIL"
            started = _fmt_dt(item.relay_attempt.started_at)
            if item.relay_attempt.finished_at is not None:
                finished = _fmt_dt(item.relay_attempt.finished_at)
            if item.relay_attempt.error:
                err = item.relay_attempt.error

        body = f"""
<h1>Message {_esc(item.message_id)}</h1>
<p><a href="/messages">Back to messages</a> | <a href="/">Dashboard</a></p>

<h2>Envelope</h2>
<ul>
  <li>Peer: <code>{_esc(item.peer)}</code></li>
  <li>HELO: <code>{_esc(item.helo or '')}</code></li>
  <li>MAIL FROM: <code>{_esc(item.envelope_from)}</code></li>
  <li>RCPT TO: <code>{_esc(', '.join(item.envelope_to))}</code></li>
</ul>

<h2>Content</h2>
<ul>
  <li>Subject: <code>{_esc(item.subject or '')}</code></li>
  <li>Size: <code>{item.size_bytes}</code></li>
  <li>SHA-256: <code>{_esc(item.sha256)}</code></li>
  <li>Received: <code>{_esc(_fmt_dt(item.received_at))}</code></li>
</ul>

<h2>Relay</h2>
<ul>
  <li>Status: <code>{_esc(status)}</code></li>
  <li>Started: <code>{_esc(started)}</code></li>
  <li>Finished: <code>{_esc(finished)}</code></li>
</ul>

<pre>{_esc(err)}</pre>
"""
        request.setHeader(b"content-type", b"text/html; charset=utf-8")
        return _page(f"Message {item.message_id}", body)


def make_site(store: MessageStore) -> Site:
    root = Root(store)
    return Site(root)
