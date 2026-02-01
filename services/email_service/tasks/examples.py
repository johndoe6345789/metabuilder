"""
Example Usage of Email Service Celery Tasks

Demonstrates how to dispatch, monitor, and manage email tasks.

Phase 7: Celery Async Task Queue Examples
"""

from typing import Dict, Any, List
import time
from datetime import datetime

from .celery_app import (
    sync_emails,
    send_email,
    delete_emails,
    check_spam,
    get_task_status,
    revoke_task,
    get_active_tasks,
)


# ============================================================================
# EXAMPLE 1: Dispatch sync_emails task
# ============================================================================

def example_sync_emails():
    """
    Example: Trigger email sync for a specific account.

    Multi-tenant context: tenant_id + user_id required
    """

    # Dispatch task
    task = sync_emails.delay(
        email_client_id='client_63f9a8c2d4b1e2f5a9c8d7e6',
        tenant_id='acme-corp-123',
        user_id='user_5a9c8d7e6f4b1e2d3a9c8d7e',
        folder_id=None,  # All folders
        force_full_sync=False,  # Incremental sync
    )

    print(f'Task dispatched: {task.id}')
    print(f'Status: {task.status}')

    # Wait for result (with timeout)
    try:
        result = task.get(timeout=60)
        print(f'Sync result: {result}')
        # Output:
        # {
        #   'status': 'success',
        #   'messages_synced': 42,
        #   'messages_updated': 5,
        #   'messages_deleted': 0,
        #   'sync_duration_seconds': 12.4,
        #   'timestamp': 1705027200000
        # }
    except Exception as exc:
        print(f'Task failed: {exc}')


# ============================================================================
# EXAMPLE 2: Send email asynchronously
# ============================================================================

def example_send_email():
    """
    Example: Send email via SMTP (async).

    Returns immediately with task ID. Email sends in background.
    """

    task = send_email.delay(
        email_client_id='client_63f9a8c2d4b1e2f5a9c8d7e6',
        tenant_id='acme-corp-123',
        user_id='user_5a9c8d7e6f4b1e2d3a9c8d7e',
        to=['alice@example.com', 'bob@example.com'],
        cc=['manager@example.com'],
        bcc=None,
        subject='Project Update',
        body_text='Dear team, here is the latest status...',
        body_html='<p>Dear team, <strong>here</strong> is the latest status...</p>',
        attachment_ids=['attach_123', 'attach_456'],
    )

    print(f'Send task: {task.id}')

    # Frontend can poll for status
    # GET /api/tasks/{task.id}


# ============================================================================
# EXAMPLE 3: Batch delete emails
# ============================================================================

def example_delete_emails():
    """
    Example: Delete multiple emails efficiently.

    Soft delete: Marks as deleted (default)
    Permanent: Moves to trash folder
    """

    task = delete_emails.delay(
        email_ids=[
            'email_abc123def456',
            'email_xyz789uvw012',
            'email_pqr345stu678',
        ],
        tenant_id='acme-corp-123',
        user_id='user_5a9c8d7e6f4b1e2d3a9c8d7e',
        permanent=False,  # Soft delete (recoverable)
    )

    result = task.get(timeout=30)
    print(f'Deleted: {result["deleted_count"]} emails')


# ============================================================================
# EXAMPLE 4: Check spam/phishing
# ============================================================================

def example_check_spam():
    """
    Example: Analyze single email for spam indicators.

    Returns spam score (0.0 - 1.0) and detected indicators.
    """

    task = check_spam.delay(
        email_id='email_abc123def456',
        tenant_id='acme-corp-123',
        user_id='user_5a9c8d7e6f4b1e2d3a9c8d7e',
    )

    result = task.get(timeout=30)

    if result['is_spam']:
        print(f'Spam detected! Score: {result["spam_score"]}')
        print(f'Indicators: {result["indicators"]}')
        # Output: ['phishing_url', 'spoofed_sender']
    else:
        print(f'Email is legitimate (score: {result["spam_score"]})')


# ============================================================================
# EXAMPLE 5: Monitor task status
# ============================================================================

def example_monitor_task():
    """
    Example: Poll task status while it's executing.

    Useful for frontend progress updates.
    """

    # Dispatch task
    task = sync_emails.delay(
        email_client_id='client_63f9a8c2d4b1e2f5a9c8d7e6',
        tenant_id='acme-corp-123',
        user_id='user_5a9c8d7e6f4b1e2d3a9c8d7e',
    )

    task_id = task.id
    print(f'Monitoring task: {task_id}')

    # Poll every 2 seconds
    max_attempts = 30
    for attempt in range(max_attempts):
        status_info = get_task_status(task_id)

        print(f'[{attempt}] Status: {status_info["status"]}')
        print(f'    Ready: {status_info["ready"]}')
        print(f'    Successful: {status_info["successful"]}')

        if status_info['ready']:
            if status_info['successful']:
                print(f'✓ Task succeeded: {status_info["result"]}')
            else:
                print(f'✗ Task failed: {status_info["result"]}')
            break

        time.sleep(2)


# ============================================================================
# EXAMPLE 6: Chained tasks (workflow)
# ============================================================================

def example_task_chain():
    """
    Example: Chain multiple tasks in sequence.

    Useful for complex workflows: sync → check spam → organize
    """

    from celery import chain, group

    # Chain: Run sync, then check all for spam
    workflow = chain(
        sync_emails.s(
            email_client_id='client_123',
            tenant_id='tenant-456',
            user_id='user-789',
        ),
        # Note: In real implementation, this would check all synced emails
    )

    # Execute chain
    result = workflow.apply_async()
    print(f'Workflow started: {result.id}')


# ============================================================================
# EXAMPLE 7: Task error handling and retry
# ============================================================================

def example_task_retry_handling():
    """
    Example: Handle task retries and errors.

    Tasks automatically retry with exponential backoff.
    """

    task = sync_emails.delay(
        email_client_id='client_63f9a8c2d4b1e2f5a9c8d7e6',
        tenant_id='acme-corp-123',
        user_id='user_5a9c8d7e6f4b1e2d3a9c8d7e',
    )

    try:
        result = task.get(timeout=60)
        print(f'Success: {result}')

    except Exception as exc:
        print(f'Task failed after all retries: {exc}')

        # Can manually retry
        # new_task = sync_emails.retry(...)


# ============================================================================
# EXAMPLE 8: Revoke (cancel) running task
# ============================================================================

def example_cancel_task():
    """
    Example: Cancel a running task.

    Useful if user clicks "Cancel" button.
    """

    # Start task
    task = sync_emails.delay(
        email_client_id='client_123',
        tenant_id='tenant-456',
        user_id='user-789',
    )

    task_id = task.id
    print(f'Task started: {task_id}')

    # Cancel after 5 seconds
    time.sleep(5)
    revoke_task(task_id, terminate=True)
    print(f'Task cancelled: {task_id}')


# ============================================================================
# EXAMPLE 9: Get active tasks (monitoring)
# ============================================================================

def example_get_active_tasks():
    """
    Example: Get all currently executing tasks.

    Useful for admin dashboard or monitoring.
    """

    active_tasks = get_active_tasks()

    print(f'Active tasks: {len(active_tasks)}')
    for task in active_tasks:
        print(f'  - {task["name"]} (ID: {task["id"]})')
        # Output:
        # - email_service.tasks.sync_emails (ID: abc123)
        # - email_service.tasks.send_email (ID: def456)


# ============================================================================
# EXAMPLE 10: API Integration (Flask)
# ============================================================================

def example_flask_integration():
    """
    Example: Integrate with Flask API.

    Typical pattern for web API endpoints.
    """

    from flask import Flask, request, jsonify, g

    app = Flask(__name__)

    @app.route('/api/email/sync', methods=['POST'])
    def trigger_email_sync():
        """Start email sync task."""

        # Get tenant/user from auth context
        email_client_id = request.json.get('email_client_id')

        # Dispatch task
        task = sync_emails.delay(
            email_client_id=email_client_id,
            tenant_id=g.tenant_id,
            user_id=g.user_id,
        )

        # Return task ID for polling
        return jsonify({
            'taskId': task.id,
            'status': 'pending',
            'message': 'Sync started',
        }), 202

    @app.route('/api/email/send', methods=['POST'])
    def send_email_endpoint():
        """Send email."""

        task = send_email.delay(
            email_client_id=request.json['email_client_id'],
            tenant_id=g.tenant_id,
            user_id=g.user_id,
            to=request.json['to'],
            subject=request.json['subject'],
            body_text=request.json['body'],
        )

        return jsonify({
            'taskId': task.id,
            'status': 'pending',
        }), 202

    @app.route('/api/tasks/<task_id>', methods=['GET'])
    def get_task_status_endpoint(task_id):
        """Get task status."""

        status = get_task_status(task_id)

        return jsonify(status)

    # Example usage:
    # POST /api/email/sync
    # { "email_client_id": "client_123" }
    # Response: { "taskId": "abc123", "status": "pending" }

    # GET /api/tasks/abc123
    # Response: {
    #   "task_id": "abc123",
    #   "status": "SUCCESS",
    #   "result": { "status": "success", "messages_synced": 42, ... },
    #   "ready": true,
    #   "successful": true,
    #   "failed": false
    # }


# ============================================================================
# EXAMPLE 11: Bulk operations
# ============================================================================

def example_bulk_operations():
    """
    Example: Dispatch multiple tasks efficiently.

    Use group() for parallel execution.
    """

    from celery import group

    # Sync multiple email accounts in parallel
    job = group(
        sync_emails.s(
            email_client_id=f'client_{i}',
            tenant_id='tenant-123',
            user_id='user-456',
        )
        for i in range(1, 6)  # 5 accounts
    )

    result = job.apply_async()
    print(f'Batch job started: {result.id}')
    print(f'Syncing {len(result.results)} accounts')

    # Wait for all to complete
    # results = result.get()


# ============================================================================
# EXAMPLE 12: Periodic task configuration
# ============================================================================

def example_periodic_tasks_config():
    """
    Example: Celery Beat periodic task configuration.

    These run automatically on schedule (Celery Beat).
    """

    from .celery_app import celery_app

    # Already configured in celery_app.py:
    beat_schedule = celery_app.conf.beat_schedule

    print('Scheduled Tasks:')
    for task_name, config in beat_schedule.items():
        print(f'  {task_name}')
        print(f'    Schedule: {config["schedule"]}')
        print(f'    Task: {config["task"]}')

    # Output:
    # Scheduled Tasks:
    #   sync-emails-every-5min
    #     Schedule: 0:05:00
    #     Task: email_service.tasks.periodic_sync
    #   cleanup-stale-tasks-hourly
    #     Schedule: 1:00:00
    #     Task: email_service.tasks.cleanup_stale_results


# ============================================================================
# MAIN - Run examples
# ============================================================================

if __name__ == '__main__':
    import sys

    examples = {
        '1': ('Sync Emails', example_sync_emails),
        '2': ('Send Email', example_send_email),
        '3': ('Delete Emails', example_delete_emails),
        '4': ('Check Spam', example_check_spam),
        '5': ('Monitor Task', example_monitor_task),
        '6': ('Task Chain', example_task_chain),
        '7': ('Error Handling', example_task_retry_handling),
        '8': ('Cancel Task', example_cancel_task),
        '9': ('Active Tasks', example_get_active_tasks),
        '10': ('Flask Integration', example_flask_integration),
        '11': ('Bulk Operations', example_bulk_operations),
        '12': ('Periodic Tasks', example_periodic_tasks_config),
    }

    if len(sys.argv) < 2:
        print('Email Service Celery Task Examples')
        print('=' * 50)
        for key, (name, _) in examples.items():
            print(f'{key}. {name}')
        print('\nUsage: python -m tasks.examples <number>')
    else:
        choice = sys.argv[1]
        if choice in examples:
            _, func = examples[choice]
            print(f'Running: {examples[choice][0]}')
            print('=' * 50)
            func()
        else:
            print(f'Invalid choice: {choice}')
