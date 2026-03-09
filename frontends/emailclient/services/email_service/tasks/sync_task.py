"""Celery background task for periodic IMAP sync."""

import os
import logging

logger = logging.getLogger(__name__)

# Celery integration placeholder - tasks run synchronously for now
# Full Celery worker requires: celery -A tasks.sync_task worker --loglevel=info


def sync_all_accounts():
    """Sync all accounts that haven't been synced within the configured interval."""
    logger.info("Periodic sync task triggered (placeholder - use /api/sync/<id> endpoint)")
