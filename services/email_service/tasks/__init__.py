"""
Email Service Celery Tasks Module

Initialization for Celery task queue with email operations.

Usage:
    from tasks.celery_app import sync_emails, send_email

    # Dispatch async task
    task = sync_emails.delay(
        email_client_id='client-123',
        tenant_id='tenant-456',
        user_id='user-789'
    )

    # Get task status
    task.status  # 'PENDING', 'STARTED', 'SUCCESS', 'FAILURE', 'RETRY'
    task.result  # Task result dict
"""

from .celery_app import (
    celery_app,
    sync_emails,
    send_email,
    delete_emails,
    check_spam,
    periodic_sync,
    cleanup_stale_results,
    get_task_status,
    revoke_task,
    get_active_tasks,
    get_queue_stats,
)

__version__ = '1.0.0'
__all__ = [
    'celery_app',
    'sync_emails',
    'send_email',
    'delete_emails',
    'check_spam',
    'periodic_sync',
    'cleanup_stale_results',
    'get_task_status',
    'revoke_task',
    'get_active_tasks',
    'get_queue_stats',
]
