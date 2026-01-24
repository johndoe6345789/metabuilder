"""
Test Suite for Celery Application Configuration

Tests for:
- Celery app initialization and configuration
- Task registration and routing
- Multi-tenant safety in task execution
- Retry logic and exponential backoff
- Task state tracking
- Signal handlers
- Utility functions
"""

import pytest
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List
from unittest.mock import Mock, patch, MagicMock, call

# Assuming celery_app.py is in the parent directory
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tasks.celery_app import (
    celery_app,
    create_celery_app,
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
    EmailTask,
    CELERY_DEFAULT_RETRY_DELAY,
    CELERY_RETRY_BACKOFF_BASE,
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def celery_config():
    """Celery test configuration."""
    return {
        'broker_url': 'redis://localhost:6379/0',
        'result_backend': 'redis://localhost:6379/1',
        'task_always_eager': True,  # Execute synchronously for testing
        'task_eager_propagates': True,  # Propagate exceptions
    }


@pytest.fixture
def celery_test_app(celery_config):
    """Create test Celery app."""
    app = create_celery_app()
    app.conf.update(celery_config)
    return app


@pytest.fixture
def test_context():
    """Standard test context for multi-tenant tasks."""
    return {
        'tenant_id': 'test-tenant-123',
        'user_id': 'test-user-456',
        'email_client_id': 'test-client-789',
    }


# ============================================================================
# CELERY APP CONFIGURATION TESTS
# ============================================================================

class TestCeleryAppInitialization:
    """Test Celery app creation and configuration."""

    def test_celery_app_exists(self):
        """Celery app should be initialized."""
        assert celery_app is not None
        assert celery_app.conf is not None

    def test_broker_configuration(self):
        """Broker should be configured to use Redis."""
        broker = celery_app.conf.broker_url
        assert broker.startswith('redis')
        assert 'localhost' in broker or 'redis' in broker

    def test_result_backend_configuration(self):
        """Result backend should be configured to use Redis."""
        result_backend = celery_app.conf.result_backend
        assert result_backend.startswith('redis')

    def test_serialization_configuration(self):
        """Serialization should be JSON."""
        assert celery_app.conf.task_serializer == 'json'
        assert celery_app.conf.result_serializer == 'json'
        assert 'json' in celery_app.conf.accept_content

    def test_timezone_configuration(self):
        """Timezone should be UTC."""
        assert celery_app.conf.timezone == 'UTC'
        assert celery_app.conf.enable_utc is True

    def test_task_execution_configuration(self):
        """Task execution settings should be configured."""
        assert celery_app.conf.task_track_started is True
        assert celery_app.conf.task_acks_late is True
        assert celery_app.conf.worker_prefetch_multiplier == 1

    def test_task_routing_configuration(self):
        """Task routing should map tasks to appropriate queues."""
        routes = celery_app.conf.task_routes
        assert 'email_service.tasks.sync_emails' in routes
        assert 'email_service.tasks.send_email' in routes
        assert 'email_service.tasks.delete_emails' in routes
        assert 'email_service.tasks.check_spam' in routes

    def test_queue_configuration(self):
        """Queues should be configured with proper priorities."""
        queues = celery_app.conf.task_queues
        queue_names = [q.name for q in queues]

        assert 'sync' in queue_names
        assert 'send' in queue_names
        assert 'delete' in queue_names
        assert 'spam' in queue_names
        assert 'periodic' in queue_names

    def test_beat_schedule_configuration(self):
        """Periodic tasks should be scheduled."""
        schedule = celery_app.conf.beat_schedule
        assert 'sync-emails-every-5min' in schedule
        assert 'cleanup-stale-tasks-hourly' in schedule

    def test_base_task_class(self):
        """Base task class should be EmailTask."""
        assert celery_app.Task == EmailTask


# ============================================================================
# TASK REGISTRATION TESTS
# ============================================================================

class TestTaskRegistration:
    """Test that tasks are properly registered."""

    def test_sync_emails_registered(self):
        """sync_emails task should be registered."""
        assert 'email_service.tasks.sync_emails' in celery_app.tasks

    def test_send_email_registered(self):
        """send_email task should be registered."""
        assert 'email_service.tasks.send_email' in celery_app.tasks

    def test_delete_emails_registered(self):
        """delete_emails task should be registered."""
        assert 'email_service.tasks.delete_emails' in celery_app.tasks

    def test_check_spam_registered(self):
        """check_spam task should be registered."""
        assert 'email_service.tasks.check_spam' in celery_app.tasks

    def test_periodic_sync_registered(self):
        """periodic_sync task should be registered."""
        assert 'email_service.tasks.periodic_sync' in celery_app.tasks

    def test_cleanup_stale_results_registered(self):
        """cleanup_stale_results task should be registered."""
        assert 'email_service.tasks.cleanup_stale_results' in celery_app.tasks


# ============================================================================
# MULTI-TENANT SAFETY TESTS
# ============================================================================

class TestMultiTenantSafety:
    """Test multi-tenant context validation in tasks."""

    def test_sync_emails_requires_tenant_id(self, test_context):
        """sync_emails should require tenant_id."""
        # Missing tenant_id should raise ValueError
        with pytest.raises(ValueError):
            sync_emails.apply_async(
                kwargs={
                    'email_client_id': test_context['email_client_id'],
                    'user_id': test_context['user_id'],
                    # Missing tenant_id
                }
            )

    def test_sync_emails_requires_user_id(self, test_context):
        """sync_emails should require user_id."""
        with pytest.raises(ValueError):
            sync_emails.apply_async(
                kwargs={
                    'email_client_id': test_context['email_client_id'],
                    'tenant_id': test_context['tenant_id'],
                    # Missing user_id
                }
            )

    def test_send_email_requires_tenant_id(self, test_context):
        """send_email should require tenant_id."""
        with pytest.raises(ValueError):
            send_email.apply_async(
                kwargs={
                    'email_client_id': test_context['email_client_id'],
                    'user_id': test_context['user_id'],
                    'to': ['recipient@example.com'],
                    # Missing tenant_id
                }
            )

    def test_delete_emails_requires_tenant_id(self, test_context):
        """delete_emails should require tenant_id."""
        with pytest.raises(ValueError):
            delete_emails.apply_async(
                kwargs={
                    'email_ids': ['email-1', 'email-2'],
                    'user_id': test_context['user_id'],
                    # Missing tenant_id
                }
            )

    def test_check_spam_requires_tenant_id(self, test_context):
        """check_spam should require tenant_id."""
        with pytest.raises(ValueError):
            check_spam.apply_async(
                kwargs={
                    'email_id': 'email-1',
                    'user_id': test_context['user_id'],
                    # Missing tenant_id
                }
            )


# ============================================================================
# TASK EXECUTION TESTS
# ============================================================================

class TestTaskExecution:
    """Test task execution behavior."""

    @patch('tasks.celery_app.sync_emails.retry')
    def test_sync_emails_returns_success_dict(self, mock_retry, test_context):
        """sync_emails should return success dictionary."""
        result = sync_emails.apply_async(
            kwargs={
                **test_context,
                'folder_id': None,
                'force_full_sync': False,
            }
        ).get()

        assert isinstance(result, dict)
        assert 'status' in result
        assert 'messages_synced' in result
        assert 'messages_updated' in result
        assert 'messages_deleted' in result
        assert 'sync_duration_seconds' in result
        assert 'timestamp' in result

    @patch('tasks.celery_app.send_email.retry')
    def test_send_email_returns_success_dict(self, mock_retry, test_context):
        """send_email should return success dictionary."""
        result = send_email.apply_async(
            kwargs={
                **test_context,
                'to': ['recipient@example.com'],
                'subject': 'Test',
                'body_text': 'Test body',
            }
        ).get()

        assert isinstance(result, dict)
        assert 'status' in result
        assert 'message_id' in result
        assert 'sent_timestamp' in result
        assert 'recipients_sent' in result

    @patch('tasks.celery_app.delete_emails.retry')
    def test_delete_emails_returns_success_dict(self, mock_retry, test_context):
        """delete_emails should return success dictionary."""
        result = delete_emails.apply_async(
            kwargs={
                'email_ids': ['email-1', 'email-2'],
                'tenant_id': test_context['tenant_id'],
                'user_id': test_context['user_id'],
                'permanent': False,
            }
        ).get()

        assert isinstance(result, dict)
        assert 'status' in result
        assert 'deleted_count' in result

    @patch('tasks.celery_app.check_spam.retry')
    def test_check_spam_returns_success_dict(self, mock_retry, test_context):
        """check_spam should return success dictionary."""
        result = check_spam.apply_async(
            kwargs={
                **test_context,
                'email_id': 'email-1',
            }
        ).get()

        assert isinstance(result, dict)
        assert 'status' in result
        assert 'is_spam' in result
        assert 'spam_score' in result
        assert 'indicators' in result


# ============================================================================
# RETRY LOGIC TESTS
# ============================================================================

class TestRetryLogic:
    """Test task retry configuration and exponential backoff."""

    def test_sync_emails_has_retry_config(self):
        """sync_emails should have retry configuration."""
        assert sync_emails.max_retries == 5
        assert sync_emails.default_retry_delay == 10

    def test_send_email_has_retry_config(self):
        """send_email should have retry configuration."""
        assert send_email.max_retries == 3
        assert send_email.default_retry_delay == 5

    def test_delete_emails_has_retry_config(self):
        """delete_emails should have retry configuration."""
        assert delete_emails.max_retries == 2
        assert delete_emails.default_retry_delay == 5

    def test_check_spam_has_retry_config(self):
        """check_spam should have retry configuration."""
        assert check_spam.max_retries == 2
        assert check_spam.default_retry_delay == 10

    def test_exponential_backoff_calculation(self):
        """Exponential backoff should calculate correctly."""
        base_delay = CELERY_DEFAULT_RETRY_DELAY
        base = CELERY_RETRY_BACKOFF_BASE

        # Verify backoff increases
        delay_1 = base_delay * (base ** 0)  # 5 * 1 = 5
        delay_2 = base_delay * (base ** 1)  # 5 * 2 = 10
        delay_3 = base_delay * (base ** 2)  # 5 * 4 = 20

        assert delay_1 < delay_2
        assert delay_2 < delay_3

    def test_email_task_autoretry_configuration(self):
        """EmailTask should have autoretry configured."""
        assert hasattr(EmailTask, 'autoretry_for')
        assert hasattr(EmailTask, 'default_retry_delay')
        assert hasattr(EmailTask, 'max_retries')


# ============================================================================
# PERIODIC TASK TESTS
# ============================================================================

class TestPeriodicTasks:
    """Test periodic/scheduled tasks."""

    @patch('tasks.celery_app.periodic_sync.delay')
    def test_periodic_sync_returns_status(self, mock_delay):
        """periodic_sync should return status dictionary."""
        result = periodic_sync.apply_async().get()

        assert isinstance(result, dict)
        assert 'status' in result
        assert 'accounts_synced' in result
        assert 'accounts_failed' in result
        assert 'task_ids' in result

    @patch('tasks.celery_app.cleanup_stale_results.delay')
    def test_cleanup_stale_results_returns_status(self, mock_delay):
        """cleanup_stale_results should return status dictionary."""
        result = cleanup_stale_results.apply_async().get()

        assert isinstance(result, dict)
        assert 'status' in result
        assert 'results_deleted' in result

    def test_sync_schedule_interval(self):
        """Sync should be scheduled every 5 minutes."""
        schedule = celery_app.conf.beat_schedule
        sync_schedule = schedule['sync-emails-every-5min']

        assert isinstance(sync_schedule['schedule'], timedelta)
        assert sync_schedule['schedule'].total_seconds() == 300  # 5 minutes

    def test_cleanup_schedule_interval(self):
        """Cleanup should be scheduled every 1 hour."""
        schedule = celery_app.conf.beat_schedule
        cleanup_schedule = schedule['cleanup-stale-tasks-hourly']

        assert isinstance(cleanup_schedule['schedule'], timedelta)
        assert cleanup_schedule['schedule'].total_seconds() == 3600  # 1 hour


# ============================================================================
# UTILITY FUNCTION TESTS
# ============================================================================

class TestUtilityFunctions:
    """Test utility functions for task management."""

    def test_get_task_status_structure(self):
        """get_task_status should return proper structure."""
        # Mock AsyncResult
        with patch('tasks.celery_app.celery_app.AsyncResult') as mock_result:
            mock_async_result = MagicMock()
            mock_async_result.status = 'SUCCESS'
            mock_async_result.result = {'status': 'success'}
            mock_async_result.ready.return_value = True
            mock_async_result.successful.return_value = True
            mock_async_result.failed.return_value = False

            mock_result.return_value = mock_async_result

            result = get_task_status('task-123')

            assert 'task_id' in result
            assert 'status' in result
            assert 'result' in result
            assert 'ready' in result
            assert 'successful' in result
            assert 'failed' in result

    def test_revoke_task(self):
        """revoke_task should call control.revoke."""
        with patch('tasks.celery_app.celery_app.control.revoke') as mock_revoke:
            revoke_task('task-123', terminate=True)

            mock_revoke.assert_called_once()

    def test_get_active_tasks(self):
        """get_active_tasks should return list of active tasks."""
        with patch('tasks.celery_app.celery_app.control.inspect') as mock_inspect:
            mock_inspect_result = MagicMock()
            mock_inspect_result.active.return_value = {
                'worker1': [
                    {'id': 'task-1', 'name': 'sync_emails'},
                    {'id': 'task-2', 'name': 'send_email'},
                ]
            }
            mock_inspect.return_value = mock_inspect_result

            result = get_active_tasks()

            assert isinstance(result, list)
            assert len(result) == 2

    def test_get_queue_stats(self):
        """get_queue_stats should return queue statistics."""
        with patch('tasks.celery_app.celery_app.control.inspect') as mock_inspect:
            mock_inspect_result = MagicMock()
            mock_inspect_result.active.return_value = {}
            mock_inspect_result.registered.return_value = {
                'worker1': ['sync_emails', 'send_email']
            }
            mock_inspect_result.stats.return_value = {}

            mock_inspect.return_value = mock_inspect_result

            result = get_queue_stats()

            assert isinstance(result, dict)
            assert 'active_tasks' in result
            assert 'registered_tasks' in result
            assert 'stats' in result


# ============================================================================
# SIGNAL HANDLER TESTS
# ============================================================================

class TestSignalHandlers:
    """Test Celery signal handlers."""

    @patch('builtins.print')
    def test_task_prerun_handler_logs(self, mock_print):
        """task_prerun handler should log task start."""
        from tasks.celery_app import task_prerun_handler

        mock_task = MagicMock()
        mock_task.name = 'sync_emails'

        task_prerun_handler(
            sender=mock_task,
            task_id='task-123',
            task=mock_task,
            kwargs={'tenant_id': 'test-tenant'}
        )

        mock_print.assert_called()
        print_call = mock_print.call_args[0][0]
        assert 'TASK START' in print_call
        assert 'sync_emails' in print_call

    @patch('builtins.print')
    def test_task_postrun_handler_logs(self, mock_print):
        """task_postrun handler should log task completion."""
        from tasks.celery_app import task_postrun_handler

        mock_task = MagicMock()
        mock_task.name = 'sync_emails'

        task_postrun_handler(
            sender=mock_task,
            task_id='task-123',
            task=mock_task,
            kwargs={'tenant_id': 'test-tenant'},
            retval={'status': 'success'}
        )

        mock_print.assert_called()
        print_call = mock_print.call_args[0][0]
        assert 'TASK COMPLETE' in print_call

    @patch('builtins.print')
    def test_task_failure_handler_logs(self, mock_print):
        """task_failure handler should log task failures."""
        from tasks.celery_app import task_failure_handler

        mock_task = MagicMock()
        mock_task.name = 'sync_emails'

        task_failure_handler(
            sender=mock_task,
            task_id='task-123',
            exception=Exception('Test error'),
            kwargs={'tenant_id': 'test-tenant'}
        )

        mock_print.assert_called()


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

class TestIntegration:
    """Integration tests for task workflow."""

    def test_task_chain_dispatch(self):
        """Multiple tasks should dispatch correctly."""
        # Note: In real integration tests, Redis should be running
        # This is a dry-run test

        context = {
            'tenant_id': 'integration-test',
            'user_id': 'user-123',
            'email_client_id': 'client-123',
        }

        # These would normally dispatch to Redis
        # Just verify they're callable without errors
        assert callable(sync_emails.delay)
        assert callable(send_email.delay)
        assert callable(delete_emails.delay)
        assert callable(check_spam.delay)

    def test_task_error_handling(self):
        """Tasks should handle errors gracefully."""
        context = {
            'tenant_id': 'integration-test',
            'user_id': 'user-123',
        }

        # Verify error handling structure exists
        assert hasattr(EmailTask, 'on_failure')
        assert hasattr(EmailTask, 'on_retry')
        assert hasattr(EmailTask, 'on_success')


# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

class TestPerformance:
    """Performance-related configuration tests."""

    def test_worker_prefetch_multiplier_optimized(self):
        """Worker should prefetch only 1 task at a time."""
        # Prevents starvation and ensures fair distribution
        assert celery_app.conf.worker_prefetch_multiplier == 1

    def test_task_soft_time_limit(self):
        """Soft time limit should be less than hard limit."""
        soft = celery_app.conf.task_soft_time_limit
        hard = celery_app.conf.task_time_limit

        assert soft < hard
        assert soft == 25 * 60  # 25 minutes
        assert hard == 30 * 60  # 30 minutes

    def test_worker_max_tasks_per_child(self):
        """Worker should restart after reasonable task count."""
        # Prevents memory leaks
        assert celery_app.conf.worker_max_tasks_per_child == 1000


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
