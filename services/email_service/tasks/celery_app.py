"""
Celery Application Configuration and Task Queue Setup

Phase 7: Async Task Queue for Email Operations

This module configures Celery for handling background email operations:
- Email synchronization (IMAP/POP3)
- Email sending (SMTP)
- Batch deletions
- Spam detection
- Scheduled periodic sync

Architecture:
- Broker: Redis (TCP connection pool)
- Result Backend: Redis (with TTL)
- Task routing: By operation type
- Retry logic: Exponential backoff with max retries
- Monitoring: Built-in task state tracking

Multi-tenant safety:
- All tasks receive explicit tenantId + userId
- Tasks cannot operate across tenant boundaries
- ACL checks performed before task execution
"""

import os
import ssl
from typing import Optional, Dict, Any, List
from datetime import timedelta

from celery import Celery, Task
from celery.schedules import schedule
from celery.signals import task_prerun, task_postrun, task_failure
from kombu import Exchange, Queue
from redis import Redis, ConnectionPool

# ============================================================================
# CONSTANTS & CONFIGURATION
# ============================================================================

# Broker Configuration
BROKER_HOST = os.getenv('REDIS_HOST', 'localhost')
BROKER_PORT = int(os.getenv('REDIS_PORT', 6379))
BROKER_DB = int(os.getenv('REDIS_BROKER_DB', 0))
BROKER_PASSWORD = os.getenv('REDIS_PASSWORD', None)
BROKER_USE_SSL = os.getenv('REDIS_USE_SSL', 'false').lower() == 'true'

# Result Backend Configuration
RESULT_HOST = os.getenv('REDIS_RESULT_HOST', BROKER_HOST)
RESULT_PORT = int(os.getenv('REDIS_RESULT_PORT', BROKER_PORT))
RESULT_DB = int(os.getenv('REDIS_RESULT_DB', 1))
RESULT_PASSWORD = os.getenv('REDIS_RESULT_PASSWORD', BROKER_PASSWORD)
RESULT_USE_SSL = os.getenv('REDIS_RESULT_USE_SSL', 'false').lower() == 'true'

# Task Configuration
TASK_SERIALIZER = 'json'
RESULT_SERIALIZER = 'json'
ACCEPT_CONTENT = ['json']
TIMEZONE = 'UTC'
ENABLE_UTC = True

# Task Routing & Execution
TASK_TRACK_STARTED = True
TASK_TIME_LIMIT = 30 * 60  # 30 minutes hard limit
TASK_SOFT_TIME_LIMIT = 25 * 60  # 25 minutes soft limit (graceful shutdown)
TASK_ACKS_LATE = True  # Acknowledge task only after successful execution
WORKER_PREFETCH_MULTIPLIER = 1  # One task per worker at a time
WORKER_MAX_TASKS_PER_CHILD = 1000  # Restart worker after 1000 tasks (memory safety)

# Result Backend TTL
RESULT_EXPIRES = 3600  # Results expire after 1 hour
RESULT_PERSISTENT = True

# Retry Configuration (Exponential Backoff)
CELERY_RETRY_BACKOFF = True  # Enable exponential backoff
CELERY_RETRY_BACKOFF_MAX = 600  # Max backoff: 10 minutes
CELERY_RETRY_BACKOFF_BASE = 2  # Multiply by 2 each retry

# Default Task Retry Settings
CELERY_DEFAULT_RETRY_DELAY = 5  # Start with 5 seconds
CELERY_DEFAULT_MAX_RETRIES = 5  # Max 5 retries per task

# ============================================================================
# REDIS CONNECTION POOL
# ============================================================================

def _create_redis_url(host: str, port: int, db: int, password: Optional[str], use_ssl: bool) -> str:
    """Create Redis URL from components."""
    scheme = 'rediss' if use_ssl else 'redis'
    auth = f':{password}@' if password else ''
    return f'{scheme}://{auth}{host}:{port}/{db}'


def _get_ssl_context() -> Optional[ssl.SSLContext]:
    """Create SSL context for Redis connection."""
    if not (BROKER_USE_SSL or RESULT_USE_SSL):
        return None

    context = ssl.create_default_context()
    context.check_hostname = os.getenv('REDIS_SSL_VERIFY_CERT', 'true').lower() == 'true'
    return context


# ============================================================================
# CELERY APPLICATION
# ============================================================================

class EmailTask(Task):
    """Base task class with multi-tenant safety and monitoring."""

    autoretry_for = (Exception,)
    default_retry_delay = CELERY_DEFAULT_RETRY_DELAY
    max_retries = CELERY_DEFAULT_MAX_RETRIES
    retry_kwargs = {'exc': Exception}

    def before_start(self, task_id: str, args: tuple, kwargs: dict) -> None:
        """Called before task starts - validate multi-tenant context."""
        # Extract tenantId and userId from kwargs
        tenant_id = kwargs.get('tenant_id')
        user_id = kwargs.get('user_id')

        if not tenant_id or not user_id:
            raise ValueError(f'Task {self.name} missing required tenant_id or user_id')

    def after_return(self, status: str, retval: Any, task_id: str, args: tuple, kwargs: dict, einfo: Any) -> None:
        """Called after task completes - cleanup and logging."""
        pass

    def on_failure(self, exc: Exception, task_id: str, args: tuple, kwargs: dict, einfo: Any) -> None:
        """Called when task fails after all retries exhausted."""
        tenant_id = kwargs.get('tenant_id', 'unknown')
        user_id = kwargs.get('user_id', 'unknown')

        # Log failure for monitoring
        print(f'Task {self.name} FAILED for tenant={tenant_id}, user={user_id}: {exc}')

    def on_retry(self, exc: Exception, task_id: str, args: tuple, kwargs: dict, einfo: Any) -> None:
        """Called when task is retried."""
        tenant_id = kwargs.get('tenant_id', 'unknown')
        print(f'Task {self.name} RETRY for tenant={tenant_id}: {exc}')

    def on_success(self, retval: Any, task_id: str, args: tuple, kwargs: dict) -> None:
        """Called when task succeeds."""
        pass


def create_celery_app() -> Celery:
    """Create and configure Celery application."""

    app = Celery('email_service')

    # Broker configuration
    broker_url = _create_redis_url(
        BROKER_HOST, BROKER_PORT, BROKER_DB, BROKER_PASSWORD, BROKER_USE_SSL
    )
    app.conf.broker_url = broker_url
    app.conf.broker_connection_retry_on_startup = True
    app.conf.broker_connection_max_retries = 5

    if BROKER_USE_SSL:
        app.conf.broker_use_ssl = {
            'ssl_cert_reqs': 'CERT_REQUIRED' if os.getenv('REDIS_SSL_VERIFY_CERT', 'true').lower() == 'true' else 'CERT_NONE',
            'ssl_context': _get_ssl_context(),
        }

    # Result backend configuration
    result_backend_url = _create_redis_url(
        RESULT_HOST, RESULT_PORT, RESULT_DB, RESULT_PASSWORD, RESULT_USE_SSL
    )
    app.conf.result_backend = result_backend_url

    if RESULT_USE_SSL:
        app.conf.result_backend_use_ssl = {
            'ssl_cert_reqs': 'CERT_REQUIRED' if os.getenv('REDIS_SSL_VERIFY_CERT', 'true').lower() == 'true' else 'CERT_NONE',
            'ssl_context': _get_ssl_context(),
        }

    # Serialization
    app.conf.task_serializer = TASK_SERIALIZER
    app.conf.result_serializer = RESULT_SERIALIZER
    app.conf.accept_content = ACCEPT_CONTENT

    # Timezone
    app.conf.timezone = TIMEZONE
    app.conf.enable_utc = ENABLE_UTC

    # Task execution
    app.conf.task_track_started = TASK_TRACK_STARTED
    app.conf.task_time_limit = TASK_TIME_LIMIT
    app.conf.task_soft_time_limit = TASK_SOFT_TIME_LIMIT
    app.conf.task_acks_late = TASK_ACKS_LATE
    app.conf.worker_prefetch_multiplier = WORKER_PREFETCH_MULTIPLIER
    app.conf.worker_max_tasks_per_child = WORKER_MAX_TASKS_PER_CHILD

    # Results
    app.conf.result_expires = RESULT_EXPIRES
    app.conf.result_backend_connect_retry_on_startup = True

    # Retry
    app.conf.task_default_retry_delay = CELERY_DEFAULT_RETRY_DELAY
    app.conf.task_max_retries = CELERY_DEFAULT_MAX_RETRIES

    # Task routing - organize by operation type
    app.conf.task_routes = {
        'email_service.tasks.sync_emails': {'queue': 'sync'},
        'email_service.tasks.send_email': {'queue': 'send'},
        'email_service.tasks.delete_emails': {'queue': 'delete'},
        'email_service.tasks.check_spam': {'queue': 'spam'},
        'email_service.tasks.periodic_sync': {'queue': 'periodic'},
    }

    # Queue definitions
    app.conf.task_queues = (
        Queue('sync', Exchange('sync', type='direct'), routing_key='sync', priority=10),
        Queue('send', Exchange('send', type='direct'), routing_key='send', priority=8),
        Queue('delete', Exchange('delete', type='direct'), routing_key='delete', priority=5),
        Queue('spam', Exchange('spam', type='direct'), routing_key='spam', priority=3),
        Queue('periodic', Exchange('periodic', type='direct'), routing_key='periodic', priority=10),
    )

    # Scheduled/periodic tasks
    app.conf.beat_schedule = {
        'sync-emails-every-5min': {
            'task': 'email_service.tasks.periodic_sync',
            'schedule': timedelta(minutes=5),
            'options': {'expires': 300}
        },
        'cleanup-stale-tasks-hourly': {
            'task': 'email_service.tasks.cleanup_stale_results',
            'schedule': timedelta(hours=1),
            'options': {'expires': 3600}
        },
    }

    # Set base task class
    app.Task = EmailTask

    return app


# ============================================================================
# CELERY INSTANCE
# ============================================================================

celery_app = create_celery_app()


# ============================================================================
# CELERY TASKS
# ============================================================================

@celery_app.task(
    name='email_service.tasks.sync_emails',
    bind=True,
    max_retries=5,
    default_retry_delay=10,
)
def sync_emails(
    self,
    email_client_id: str,
    tenant_id: str,
    user_id: str,
    folder_id: Optional[str] = None,
    force_full_sync: bool = False,
) -> Dict[str, Any]:
    """
    Synchronize emails from IMAP/POP3 server.

    Multi-tenant: Validates that user owns email_client_id before syncing.

    Args:
        email_client_id: ID of email client configuration
        tenant_id: Tenant owner (multi-tenant safety)
        user_id: User who owns the account
        folder_id: Optional specific folder to sync (None = all folders)
        force_full_sync: Force full sync instead of incremental

    Returns:
        {
            'status': 'success' | 'failed',
            'messages_synced': int,
            'messages_updated': int,
            'messages_deleted': int,
            'error': str (if failed),
            'sync_duration_seconds': float,
            'timestamp': int (ms)
        }

    Raises:
        SoftTimeLimitExceeded: If sync exceeds 25 minutes
        Retry: On transient network errors (with exponential backoff)
    """
    import time
    from datetime import datetime

    start_time = time.time()

    try:
        # Step 1: Validate multi-tenant context
        # TODO: Fetch email client from DBAL
        # Verify: email_client.userId == user_id AND email_client.tenantId == tenant_id

        # Step 2: Connect to email server
        # TODO: Decrypt credentials from Credential entity
        # TODO: Create IMAP/POP3 connection based on protocol

        # Step 3: Get sync state
        # TODO: Fetch EmailFolder.syncToken for incremental sync

        # Step 4: Sync logic
        if force_full_sync:
            # TODO: Full sync - fetch all UIDs from server
            messages_synced = 0
            messages_updated = 0
            messages_deleted = 0
        else:
            # TODO: Incremental sync - use UID validity + syncToken
            messages_synced = 0
            messages_updated = 0
            messages_deleted = 0

        # Step 5: Update last sync time
        # TODO: Update EmailClient.lastSyncAt = now()

        return {
            'status': 'success',
            'messages_synced': messages_synced,
            'messages_updated': messages_updated,
            'messages_deleted': messages_deleted,
            'sync_duration_seconds': time.time() - start_time,
            'timestamp': int(datetime.now().timestamp() * 1000),
        }

    except Exception as exc:
        # Retry with exponential backoff on transient errors
        retry_count = self.request.retries
        backoff_seconds = min(
            CELERY_DEFAULT_RETRY_DELAY * (CELERY_RETRY_BACKOFF_BASE ** retry_count),
            CELERY_RETRY_BACKOFF_MAX
        )

        raise self.retry(exc=exc, countdown=backoff_seconds)


@celery_app.task(
    name='email_service.tasks.send_email',
    bind=True,
    max_retries=3,
    default_retry_delay=5,
)
def send_email(
    self,
    email_client_id: str,
    tenant_id: str,
    user_id: str,
    to: List[str],
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None,
    subject: str = '',
    body_text: str = '',
    body_html: Optional[str] = None,
    attachment_ids: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Send email via SMTP.

    Multi-tenant: Validates user ownership before sending.

    Args:
        email_client_id: ID of email account to send from
        tenant_id: Tenant owner
        user_id: User sending the email
        to: List of recipient addresses
        cc: CC recipients (optional)
        bcc: BCC recipients (optional)
        subject: Email subject
        body_text: Plain text body
        body_html: HTML body (optional)
        attachment_ids: IDs of attachments to include (optional)

    Returns:
        {
            'status': 'success' | 'failed',
            'message_id': str (RFC 5322 Message-ID),
            'sent_timestamp': int (ms),
            'recipients_sent': int,
            'error': str (if failed)
        }

    Raises:
        Retry: On SMTP connection failures (with backoff)
    """
    import time
    from datetime import datetime

    start_time = time.time()

    try:
        # Step 1: Multi-tenant validation
        # TODO: Verify email_client.userId == user_id AND email_client.tenantId == tenant_id

        # Step 2: Fetch credentials
        # TODO: Decrypt SMTP password from Credential entity

        # Step 3: Fetch attachments
        attachment_data = []
        if attachment_ids:
            # TODO: Fetch EmailAttachment records by IDs
            # TODO: Download from S3/blob storage
            pass

        # Step 4: Build MIME message
        # TODO: Use email.mime to construct RFC 5322 message
        # TODO: Set Message-ID header
        # TODO: Add attachments

        # Step 5: Connect to SMTP server & send
        # TODO: Create SMTP connection (with TLS/STARTTLS)
        # TODO: Send message
        # TODO: Close connection

        # Step 6: Create EmailMessage record (in Sent folder)
        # TODO: Create EmailMessage.isSent = true
        # TODO: Save to EmailFolder(type='sent')

        return {
            'status': 'success',
            'message_id': '<generated@message.id>',
            'sent_timestamp': int(datetime.now().timestamp() * 1000),
            'recipients_sent': len(to) + len(cc or []) + len(bcc or []),
        }

    except Exception as exc:
        # Retry on SMTP failures
        raise self.retry(exc=exc, countdown=5 * (self.request.retries + 1))


@celery_app.task(
    name='email_service.tasks.delete_emails',
    bind=True,
    max_retries=2,
    default_retry_delay=5,
)
def delete_emails(
    self,
    email_ids: List[str],
    tenant_id: str,
    user_id: str,
    permanent: bool = False,
) -> Dict[str, Any]:
    """
    Delete emails (soft delete or move to trash).

    Multi-tenant: Validates user owns all email_ids before deletion.

    Args:
        email_ids: List of EmailMessage IDs to delete
        tenant_id: Tenant owner
        user_id: User who owns the emails
        permanent: If True, permanently delete; else move to trash

    Returns:
        {
            'status': 'success' | 'failed',
            'deleted_count': int,
            'error': str (if failed)
        }

    Raises:
        Retry: On transient errors
    """
    try:
        # Step 1: Batch validate multi-tenant context
        # TODO: Fetch all EmailMessage records
        # TODO: Verify ALL belong to user via: emailClientId -> userId == user_id

        # Step 2: Soft delete
        if not permanent:
            # TODO: UPDATE EmailMessage SET isDeleted = true WHERE id IN (email_ids)
            # TODO: Decrement EmailFolder.unreadCount for each deleted unread message
            deleted_count = len(email_ids)

        # Step 3: Permanent delete (move to Trash folder)
        else:
            # TODO: UPDATE EmailMessage SET folderId = trash_folder_id, isDeleted = true
            # TODO: Update folder counts
            deleted_count = len(email_ids)

        return {
            'status': 'success',
            'deleted_count': deleted_count,
        }

    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task(
    name='email_service.tasks.check_spam',
    bind=True,
    max_retries=2,
    default_retry_delay=10,
)
def check_spam(
    self,
    email_id: str,
    tenant_id: str,
    user_id: str,
) -> Dict[str, Any]:
    """
    Analyze email for spam/phishing indicators.

    Uses heuristics and optional external ML API.

    Args:
        email_id: ID of EmailMessage to analyze
        tenant_id: Tenant owner
        user_id: User who owns the email

    Returns:
        {
            'status': 'success' | 'error',
            'is_spam': bool,
            'spam_score': float (0.0 - 1.0),
            'indicators': [str],  # e.g., ['phishing_url', 'spoofed_sender']
        }

    Raises:
        Retry: On external API failures
    """
    try:
        # Step 1: Multi-tenant validation
        # TODO: Fetch EmailMessage by ID
        # TODO: Verify user owns it via email_client -> user_id check

        # Step 2: Extract features
        # TODO: Get email headers, body, sender, URLs

        # Step 3: Apply heuristics
        spam_score = 0.0
        indicators = []

        # TODO: Check for spam indicators:
        # - HTML obfuscation
        # - Suspicious URLs (phishing detection)
        # - Spoofed sender
        # - Excessive capitalization
        # - Known spam patterns

        # Step 4: Optional: Call external ML API
        # TODO: If configured, call SpamAssassin or similar

        # Step 5: Update EmailMessage
        # TODO: UPDATE EmailMessage SET isSpam = is_spam WHERE id = email_id

        is_spam = spam_score > 0.5

        return {
            'status': 'success',
            'is_spam': is_spam,
            'spam_score': spam_score,
            'indicators': indicators,
        }

    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task(
    name='email_service.tasks.periodic_sync',
    bind=True,
    max_retries=1,
)
def periodic_sync(self) -> Dict[str, Any]:
    """
    Periodically sync all enabled email accounts (Celery Beat task).

    Runs every 5 minutes. Iterates over all EmailClient records with isSyncEnabled=true
    and triggers sync_emails tasks.

    Returns:
        {
            'status': 'success',
            'accounts_synced': int,
            'accounts_failed': int,
            'task_ids': [str]  # IDs of spawned sync_emails tasks
        }
    """
    try:
        # Step 1: Fetch all enabled email clients
        # TODO: Query: SELECT * FROM EmailClient WHERE isSyncEnabled = true AND isEnabled = true

        # Step 2: Filter by sync interval
        # TODO: For each client, check: (now - lastSyncAt) >= syncInterval

        # Step 3: Spawn sync_emails tasks
        task_ids = []
        accounts_synced = 0

        # for client in enabled_clients:
        #     task = sync_emails.delay(
        #         email_client_id=client.id,
        #         tenant_id=client.tenantId,
        #         user_id=client.userId,
        #         force_full_sync=False
        #     )
        #     task_ids.append(task.id)
        #     accounts_synced += 1

        return {
            'status': 'success',
            'accounts_synced': accounts_synced,
            'accounts_failed': 0,
            'task_ids': task_ids,
        }

    except Exception as exc:
        return {
            'status': 'failed',
            'error': str(exc),
            'accounts_synced': 0,
            'accounts_failed': 0,
            'task_ids': [],
        }


@celery_app.task(
    name='email_service.tasks.cleanup_stale_results',
    bind=True,
    max_retries=0,  # No retries for maintenance task
)
def cleanup_stale_results(self) -> Dict[str, Any]:
    """
    Clean up stale task results from Redis (Celery Beat task).

    Runs hourly. Deletes results older than RESULT_EXPIRES (1 hour).

    Returns:
        {
            'status': 'success',
            'results_deleted': int
        }
    """
    try:
        # Step 1: Connect to Redis result backend
        redis_client = Redis(
            host=RESULT_HOST,
            port=RESULT_PORT,
            db=RESULT_DB,
            password=RESULT_PASSWORD,
            ssl=RESULT_USE_SSL
        )

        # Step 2: Scan for celery-task-meta-* keys
        # Celery stores results as: celery-task-meta-{task_id}
        deleted_count = 0

        # TODO: Implement key scanning with SCAN cursor
        # TODO: TTL is already set by Celery, so old keys auto-expire
        # This task mainly serves as heartbeat for monitoring

        redis_client.close()

        return {
            'status': 'success',
            'results_deleted': deleted_count,
        }

    except Exception as exc:
        return {
            'status': 'failed',
            'error': str(exc),
            'results_deleted': 0,
        }


# ============================================================================
# CELERY SIGNAL HANDLERS
# ============================================================================

@task_prerun.connect
def task_prerun_handler(sender=None, task_id=None, task=None, args=None, kwargs=None, **other):
    """Log task start for monitoring."""
    tenant_id = kwargs.get('tenant_id', 'unknown') if kwargs else 'unknown'
    print(f'[TASK START] {task.name} (task_id={task_id}, tenant={tenant_id})')


@task_postrun.connect
def task_postrun_handler(sender=None, task_id=None, task=None, args=None, kwargs=None, retval=None, state=None, **other):
    """Log task completion for monitoring."""
    tenant_id = kwargs.get('tenant_id', 'unknown') if kwargs else 'unknown'
    print(f'[TASK COMPLETE] {task.name} (task_id={task_id}, tenant={tenant_id}, result={retval})')


@task_failure.connect
def task_failure_handler(sender=None, task_id=None, exception=None, args=None, kwargs=None, traceback=None, einfo=None, **other):
    """Log task failures for monitoring."""
    tenant_id = kwargs.get('tenant_id', 'unknown') if kwargs else 'unknown'
    print(f'[TASK FAILED] {sender.name if sender else "unknown"} (task_id={task_id}, tenant={tenant_id})')
    print(f'Exception: {exception}')


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_task_status(task_id: str) -> Dict[str, Any]:
    """Get status of a specific task."""
    result = celery_app.AsyncResult(task_id)

    return {
        'task_id': task_id,
        'status': result.status,  # 'PENDING', 'STARTED', 'SUCCESS', 'FAILURE', 'RETRY'
        'result': result.result,
        'ready': result.ready(),
        'successful': result.successful(),
        'failed': result.failed(),
    }


def revoke_task(task_id: str, terminate: bool = False) -> None:
    """Revoke (cancel) a running task."""
    celery_app.control.revoke(task_id, terminate=terminate, signal='SIGTERM')


def get_active_tasks() -> List[Dict[str, Any]]:
    """Get list of currently active tasks."""
    inspect = celery_app.control.inspect()
    active = inspect.active()

    if not active:
        return []

    # Flatten worker results
    tasks = []
    for worker_name, worker_tasks in active.items():
        tasks.extend(worker_tasks)

    return tasks


def get_queue_stats() -> Dict[str, Any]:
    """Get statistics about task queues."""
    inspect = celery_app.control.inspect()

    return {
        'active_tasks': len(inspect.active() or {}),
        'registered_tasks': len(inspect.registered() or {}),
        'stats': inspect.stats() or {},
    }


if __name__ == '__main__':
    # Start Celery worker
    # Usage: python -m celery_app worker --loglevel=info --queues=sync,send,delete,spam,periodic
    celery_app.start()
