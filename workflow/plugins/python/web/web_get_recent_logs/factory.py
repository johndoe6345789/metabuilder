"""Factory for WebGetRecentLogs plugin."""

from .web_get_recent_logs import WebGetRecentLogs


def create():
    return WebGetRecentLogs()
