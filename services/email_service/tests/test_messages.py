"""
Comprehensive tests for Messages API (Phase 7)
Tests all endpoints, pagination, filtering, search, and batch operations
"""
import pytest
import uuid
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple

# Import test fixtures and helpers
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from src.routes.messages import email_messages, message_flags


@pytest.fixture
def client():
    """Flask test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture(autouse=True)
def cleanup():
    """Clean up test data after each test"""
    yield
    email_messages.clear()
    message_flags.clear()


def create_test_message(
    account_id: str = 'test-account',
    tenant_id: str = 'test-tenant',
    user_id: str = 'test-user',
    **overrides
) -> Dict[str, Any]:
    """Helper to create test message data"""
    now = int(datetime.utcnow().timestamp() * 1000)
    msg_id = str(uuid.uuid4())

    message = {
        'messageId': msg_id,
        'accountId': account_id,
        'tenantId': tenant_id,
        'userId': user_id,
        'folder': 'Inbox',
        'subject': 'Test Email Subject',
        'from': 'sender@example.com',
        'to': ['recipient@example.com'],
        'cc': [],
        'bcc': [],
        'receivedAt': now,
        'size': 2048,
        'hasAttachments': False,
        'textBody': 'This is the email body text',
        'htmlBody': '<html><body>Email HTML content</body></html>',
        'headers': {},
        'attachments': [],
        'isDeleted': False,
        'createdAt': now,
        'updatedAt': now,
        **overrides
    }

    email_messages[msg_id] = message
    return message


def get_auth_headers(
    tenant_id: str = 'test-tenant',
    user_id: str = 'test-user'
) -> Dict[str, str]:
    """Helper to generate auth headers"""
    return {
        'X-Tenant-ID': tenant_id,
        'X-User-ID': user_id,
        'Content-Type': 'application/json'
    }


# ===== LIST MESSAGES TESTS =====

class TestListMessages:
    """Test list_messages endpoint"""

    def test_list_messages_requires_auth(self, client):
        """Should require tenant_id and user_id"""
        response = client.get('/api/accounts/test-account/messages')
        assert response.status_code == 401
        assert response.json['error'] == 'Unauthorized'

    def test_list_messages_with_header_auth(self, client):
        """Should accept X-Tenant-ID and X-User-ID headers"""
        create_test_message()
        headers = get_auth_headers()

        response = client.get(
            '/api/accounts/test-account/messages',
            headers=headers
        )
        assert response.status_code == 200
        assert 'messages' in response.json
        assert 'pagination' in response.json

    def test_list_messages_empty(self, client):
        """Should return empty list when no messages"""
        headers = get_auth_headers()
        response = client.get(
            '/api/accounts/test-account/messages',
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['messages'] == []
        assert response.json['pagination']['total'] == 0

    def test_list_messages_pagination(self, client):
        """Should paginate results correctly"""
        headers = get_auth_headers()

        # Create 25 messages
        for i in range(25):
            create_test_message(subject=f'Message {i}')

        # Get first page
        response = client.get(
            '/api/accounts/test-account/messages?page=1&limit=10',
            headers=headers
        )
        assert response.status_code == 200
        data = response.json
        assert len(data['messages']) == 10
        assert data['pagination']['page'] == 1
        assert data['pagination']['total'] == 25
        assert data['pagination']['totalPages'] == 3
        assert data['pagination']['hasNextPage'] is True

        # Get second page
        response = client.get(
            '/api/accounts/test-account/messages?page=2&limit=10',
            headers=headers
        )
        assert response.status_code == 200
        data = response.json
        assert len(data['messages']) == 10
        assert data['pagination']['page'] == 2
        assert data['pagination']['hasPreviousPage'] is True

        # Get last page
        response = client.get(
            '/api/accounts/test-account/messages?page=3&limit=10',
            headers=headers
        )
        assert response.status_code == 200
        data = response.json
        assert len(data['messages']) == 5
        assert data['pagination']['hasNextPage'] is False

    def test_list_messages_filter_by_folder(self, client):
        """Should filter by folder"""
        headers = get_auth_headers()

        create_test_message(folder='Inbox')
        create_test_message(folder='Sent')
        create_test_message(folder='Inbox')

        response = client.get(
            '/api/accounts/test-account/messages?folder=Inbox',
            headers=headers
        )
        assert response.status_code == 200
        assert len(response.json['messages']) == 2

    def test_list_messages_filter_by_read(self, client):
        """Should filter by read status"""
        headers = get_auth_headers()

        msg1 = create_test_message()
        msg2 = create_test_message()

        # Mark one as read
        message_flags[msg1['messageId']] = {'isRead': True}

        # Get unread
        response = client.get(
            '/api/accounts/test-account/messages?isRead=false',
            headers=headers
        )
        assert response.status_code == 200
        assert len(response.json['messages']) == 1

        # Get read
        response = client.get(
            '/api/accounts/test-account/messages?isRead=true',
            headers=headers
        )
        assert response.status_code == 200
        assert len(response.json['messages']) == 1

    def test_list_messages_filter_by_starred(self, client):
        """Should filter by starred status"""
        headers = get_auth_headers()

        msg1 = create_test_message()
        msg2 = create_test_message()

        # Mark one as starred
        message_flags[msg1['messageId']] = {'isStarred': True}

        response = client.get(
            '/api/accounts/test-account/messages?isStarred=true',
            headers=headers
        )
        assert response.status_code == 200
        assert len(response.json['messages']) == 1

    def test_list_messages_filter_by_date_range(self, client):
        """Should filter by date range"""
        headers = get_auth_headers()
        now = int(datetime.utcnow().timestamp() * 1000)

        create_test_message(receivedAt=now - 10000)
        create_test_message(receivedAt=now)
        create_test_message(receivedAt=now + 10000)

        # Filter from middle
        response = client.get(
            f'/api/accounts/test-account/messages?dateFrom={now - 5000}',
            headers=headers
        )
        assert response.status_code == 200
        assert len(response.json['messages']) == 2

    def test_list_messages_filter_by_from(self, client):
        """Should filter by sender"""
        headers = get_auth_headers()

        create_test_message(from_='alice@example.com')
        create_test_message(from_='bob@example.com')

        response = client.get(
            '/api/accounts/test-account/messages?from=alice',
            headers=headers
        )
        assert response.status_code == 200
        assert len(response.json['messages']) == 1

    def test_list_messages_sort_by_received(self, client):
        """Should sort by received date"""
        headers = get_auth_headers()
        now = int(datetime.utcnow().timestamp() * 1000)

        create_test_message(receivedAt=now - 1000, subject='Old')
        create_test_message(receivedAt=now, subject='New')
        create_test_message(receivedAt=now + 1000, subject='Newest')

        # Desc (default)
        response = client.get(
            '/api/accounts/test-account/messages?sortBy=receivedAt&sortOrder=desc',
            headers=headers
        )
        msgs = response.json['messages']
        assert msgs[0]['subject'] == 'Newest'
        assert msgs[2]['subject'] == 'Old'

        # Asc
        response = client.get(
            '/api/accounts/test-account/messages?sortBy=receivedAt&sortOrder=asc',
            headers=headers
        )
        msgs = response.json['messages']
        assert msgs[0]['subject'] == 'Old'
        assert msgs[2]['subject'] == 'Newest'

    def test_list_messages_multi_tenant_isolation(self, client):
        """Should isolate messages by tenant"""
        create_test_message(tenant_id='tenant-1')
        create_test_message(tenant_id='tenant-2')

        headers = get_auth_headers(tenant_id='tenant-1')
        response = client.get(
            '/api/accounts/test-account/messages',
            headers=headers
        )
        assert response.status_code == 200
        assert len(response.json['messages']) == 1

    def test_list_messages_with_flags(self, client):
        """Should include flags in response"""
        headers = get_auth_headers()

        msg = create_test_message()
        message_flags[msg['messageId']] = {
            'isRead': True,
            'isStarred': True
        }

        response = client.get(
            '/api/accounts/test-account/messages',
            headers=headers
        )
        assert response.status_code == 200
        messages = response.json['messages']
        assert messages[0]['isRead'] is True
        assert messages[0]['isStarred'] is True


# ===== GET MESSAGE TESTS =====

class TestGetMessage:
    """Test get_message endpoint"""

    def test_get_message_not_found(self, client):
        """Should return 404 for non-existent message"""
        headers = get_auth_headers()
        response = client.get(
            '/api/accounts/test-account/messages/nonexistent',
            headers=headers
        )
        assert response.status_code == 404

    def test_get_message_success(self, client):
        """Should return full message details"""
        headers = get_auth_headers()
        msg = create_test_message()

        response = client.get(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            headers=headers
        )
        assert response.status_code == 200
        data = response.json
        assert data['messageId'] == msg['messageId']
        assert data['subject'] == msg['subject']
        assert data['textBody'] == msg['textBody']

    def test_get_message_marks_as_read(self, client):
        """Should mark message as read when retrieved"""
        headers = get_auth_headers()
        msg = create_test_message()

        # Verify not read initially
        assert msg['messageId'] not in message_flags

        # Get message
        response = client.get(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['isRead'] is True

    def test_get_message_forbidden_different_tenant(self, client):
        """Should forbid access from different tenant"""
        msg = create_test_message(tenant_id='tenant-1')
        headers = get_auth_headers(tenant_id='tenant-2')

        response = client.get(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            headers=headers
        )
        assert response.status_code == 403

    def test_get_message_with_flags(self, client):
        """Should include flags in response"""
        headers = get_auth_headers()
        msg = create_test_message()

        message_flags[msg['messageId']] = {
            'isRead': True,
            'isStarred': True
        }

        response = client.get(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['isRead'] is True
        assert response.json['isStarred'] is True


# ===== SEND MESSAGE TESTS =====

class TestSendMessage:
    """Test send_message endpoint"""

    def test_send_message_requires_auth(self, client):
        """Should require authentication"""
        response = client.post(
            '/api/accounts/test-account/messages',
            json={'to': ['test@example.com'], 'subject': 'Test'},
            content_type='application/json'
        )
        assert response.status_code == 401

    def test_send_message_missing_required_fields(self, client):
        """Should validate required fields"""
        headers = get_auth_headers()

        # Missing 'to'
        response = client.post(
            '/api/accounts/test-account/messages',
            json={'subject': 'Test'},
            headers=headers
        )
        assert response.status_code == 400
        assert 'Missing required fields' in response.json['message']

        # Missing 'subject'
        response = client.post(
            '/api/accounts/test-account/messages',
            json={'to': ['test@example.com']},
            headers=headers
        )
        assert response.status_code == 400

    def test_send_message_invalid_recipients(self, client):
        """Should validate recipient list"""
        headers = get_auth_headers()

        # Empty list
        response = client.post(
            '/api/accounts/test-account/messages',
            json={'to': [], 'subject': 'Test'},
            headers=headers
        )
        assert response.status_code == 400

        # Not a list
        response = client.post(
            '/api/accounts/test-account/messages',
            json={'to': 'single@example.com', 'subject': 'Test'},
            headers=headers
        )
        assert response.status_code == 400

    def test_send_message_success(self, client):
        """Should send message successfully"""
        headers = get_auth_headers()

        response = client.post(
            '/api/accounts/test-account/messages',
            json={
                'to': ['recipient@example.com'],
                'cc': ['cc@example.com'],
                'subject': 'Test Subject',
                'textBody': 'Test body',
                'htmlBody': '<html>Test</html>'
            },
            headers=headers
        )
        assert response.status_code == 202
        data = response.json
        assert 'messageId' in data
        assert data['status'] == 'sending'
        assert 'taskId' in data

    def test_send_message_scheduled(self, client):
        """Should handle scheduled messages"""
        headers = get_auth_headers()
        future_time = int((datetime.utcnow().timestamp() + 3600) * 1000)

        response = client.post(
            '/api/accounts/test-account/messages',
            json={
                'to': ['recipient@example.com'],
                'subject': 'Test',
                'sendAt': future_time
            },
            headers=headers
        )
        assert response.status_code == 202
        assert response.json['status'] == 'scheduled'

    def test_send_message_with_attachments(self, client):
        """Should include attachments"""
        headers = get_auth_headers()

        response = client.post(
            '/api/accounts/test-account/messages',
            json={
                'to': ['recipient@example.com'],
                'subject': 'Test',
                'attachments': [
                    {
                        'filename': 'doc.pdf',
                        'contentType': 'application/pdf',
                        'data': 'base64data...',
                        'size': 1024
                    }
                ]
            },
            headers=headers
        )
        assert response.status_code == 202
        msg_id = response.json['messageId']
        msg = email_messages[msg_id]
        assert len(msg['attachments']) == 1


# ===== UPDATE MESSAGE FLAGS TESTS =====

class TestUpdateMessageFlags:
    """Test update_message_flags endpoint"""

    def test_update_flags_not_found(self, client):
        """Should return 404 for non-existent message"""
        headers = get_auth_headers()
        response = client.put(
            '/api/accounts/test-account/messages/nonexistent',
            json={'isRead': True},
            headers=headers
        )
        assert response.status_code == 404

    def test_update_flags_success(self, client):
        """Should update flags successfully"""
        headers = get_auth_headers()
        msg = create_test_message()

        response = client.put(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            json={'isRead': True, 'isStarred': True},
            headers=headers
        )
        assert response.status_code == 200
        data = response.json
        assert data['isRead'] is True
        assert data['isStarred'] is True

    def test_update_flags_partial(self, client):
        """Should update only specified flags"""
        headers = get_auth_headers()
        msg = create_test_message()

        # Set initial flags
        message_flags[msg['messageId']] = {
            'isRead': True,
            'isStarred': True,
            'isSpam': False
        }

        # Update only one
        response = client.put(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            json={'isRead': False},
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['isRead'] is False
        assert response.json['isStarred'] is True  # Unchanged

    def test_update_flags_move_folder(self, client):
        """Should move message to different folder"""
        headers = get_auth_headers()
        msg = create_test_message(folder='Inbox')

        response = client.put(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            json={'folder': 'Archive'},
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['folder'] == 'Archive'
        assert email_messages[msg['messageId']]['folder'] == 'Archive'

    def test_update_flags_forbidden(self, client):
        """Should forbid access from different tenant"""
        msg = create_test_message(tenant_id='tenant-1')
        headers = get_auth_headers(tenant_id='tenant-2')

        response = client.put(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            json={'isRead': True},
            headers=headers
        )
        assert response.status_code == 403


# ===== DELETE MESSAGE TESTS =====

class TestDeleteMessage:
    """Test delete_message endpoint"""

    def test_delete_message_not_found(self, client):
        """Should return 404 for non-existent message"""
        headers = get_auth_headers()
        response = client.delete(
            '/api/accounts/test-account/messages/nonexistent',
            headers=headers
        )
        assert response.status_code == 404

    def test_delete_message_soft_delete(self, client):
        """Should soft delete by default"""
        headers = get_auth_headers()
        msg = create_test_message()

        response = client.delete(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['permanent'] is False

        # Message still exists, just marked deleted
        assert msg['messageId'] in email_messages
        assert email_messages[msg['messageId']]['isDeleted'] is True

    def test_delete_message_permanent(self, client):
        """Should hard delete with permanent flag"""
        headers = get_auth_headers()
        msg = create_test_message()

        response = client.delete(
            f'/api/accounts/test-account/messages/{msg["messageId"]}?permanent=true',
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['permanent'] is True

        # Message completely removed
        assert msg['messageId'] not in email_messages

    def test_delete_message_forbidden(self, client):
        """Should forbid access from different tenant"""
        msg = create_test_message(tenant_id='tenant-1')
        headers = get_auth_headers(tenant_id='tenant-2')

        response = client.delete(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            headers=headers
        )
        assert response.status_code == 403


# ===== SEARCH MESSAGES TESTS =====

class TestSearchMessages:
    """Test search_messages endpoint"""

    def test_search_requires_query(self, client):
        """Should require search query"""
        headers = get_auth_headers()
        response = client.get(
            '/api/accounts/test-account/messages/search',
            headers=headers
        )
        assert response.status_code == 400
        assert 'search query' in response.json['message']

    def test_search_by_subject(self, client):
        """Should search by subject"""
        headers = get_auth_headers()

        create_test_message(subject='Important Meeting')
        create_test_message(subject='Regular Email')
        create_test_message(subject='Another Important Task')

        response = client.get(
            '/api/accounts/test-account/messages/search?q=Important&searchIn=subject',
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['matchCount'] == 2

    def test_search_by_body(self, client):
        """Should search by body text"""
        headers = get_auth_headers()

        create_test_message(textBody='Meeting at 3pm')
        create_test_message(textBody='Regular content')
        create_test_message(textBody='Another meeting next week')

        response = client.get(
            '/api/accounts/test-account/messages/search?q=meeting&searchIn=body',
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['matchCount'] == 2

    def test_search_by_sender(self, client):
        """Should search by sender"""
        headers = get_auth_headers()

        create_test_message(from_='alice@example.com')
        create_test_message(from_='bob@example.com')
        create_test_message(from_='alice.smith@example.com')

        response = client.get(
            '/api/accounts/test-account/messages/search?q=alice&searchIn=from',
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['matchCount'] == 2

    def test_search_all_fields(self, client):
        """Should search across all fields"""
        headers = get_auth_headers()

        create_test_message(subject='Project Alpha')
        create_test_message(from_='alpha@example.com')
        create_test_message(textBody='alpha version released')

        response = client.get(
            '/api/accounts/test-account/messages/search?q=alpha',
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['matchCount'] == 3

    def test_search_pagination(self, client):
        """Should paginate search results"""
        headers = get_auth_headers()

        for i in range(25):
            create_test_message(subject=f'Test Message {i}')

        response = client.get(
            '/api/accounts/test-account/messages/search?q=test&page=1&limit=10',
            headers=headers
        )
        assert response.status_code == 200
        assert len(response.json['results']) == 10
        assert response.json['pagination']['total'] == 25

    def test_search_with_folder_filter(self, client):
        """Should filter search by folder"""
        headers = get_auth_headers()

        create_test_message(folder='Inbox', subject='Search Term')
        create_test_message(folder='Sent', subject='Search Term')

        response = client.get(
            '/api/accounts/test-account/messages/search?q=term&folder=Inbox',
            headers=headers
        )
        assert response.status_code == 200
        assert len(response.json['results']) == 1

    def test_search_relevance_scoring(self, client):
        """Should return results ranked by relevance"""
        headers = get_auth_headers()

        create_test_message(subject='Python Python Python')  # Higher score
        create_test_message(textBody='Python mentioned once')  # Lower score

        response = client.get(
            '/api/accounts/test-account/messages/search?q=python',
            headers=headers
        )
        assert response.status_code == 200
        results = response.json['results']
        # First result should have higher score
        assert results[0]['score'] >= results[1]['score']


# ===== BATCH OPERATIONS TESTS =====

class TestBatchOperations:
    """Test batch operations"""

    def test_batch_update_flags_success(self, client):
        """Should update multiple messages at once"""
        headers = get_auth_headers()

        msg1 = create_test_message()
        msg2 = create_test_message()
        msg3 = create_test_message()

        response = client.put(
            '/api/accounts/test-account/messages/batch/flags',
            json={
                'messageIds': [msg1['messageId'], msg2['messageId'], msg3['messageId']],
                'isRead': True,
                'isStarred': True
            },
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['updatedCount'] == 3
        assert response.json['failedCount'] == 0

    def test_batch_update_with_failures(self, client):
        """Should handle partial failures in batch"""
        headers = get_auth_headers()

        msg1 = create_test_message()
        msg2 = create_test_message()

        response = client.put(
            '/api/accounts/test-account/messages/batch/flags',
            json={
                'messageIds': [msg1['messageId'], 'nonexistent', msg2['messageId']],
                'isRead': True
            },
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['updatedCount'] == 2
        assert response.json['failedCount'] == 1

    def test_batch_move_to_folder(self, client):
        """Should move multiple messages to folder"""
        headers = get_auth_headers()

        msg1 = create_test_message(folder='Inbox')
        msg2 = create_test_message(folder='Inbox')

        response = client.put(
            '/api/accounts/test-account/messages/batch/flags',
            json={
                'messageIds': [msg1['messageId'], msg2['messageId']],
                'folder': 'Archive'
            },
            headers=headers
        )
        assert response.status_code == 200
        assert email_messages[msg1['messageId']]['folder'] == 'Archive'
        assert email_messages[msg2['messageId']]['folder'] == 'Archive'


# ===== EDGE CASES AND SECURITY =====

class TestEdgeCasesAndSecurity:
    """Test edge cases and security concerns"""

    def test_query_param_auth_fallback(self, client):
        """Should accept tenant_id/user_id as query params"""
        msg = create_test_message()

        response = client.get(
            f'/api/accounts/test-account/messages/{msg["messageId"]}?tenant_id=test-tenant&user_id=test-user'
        )
        assert response.status_code == 200

    def test_soft_deleted_messages_excluded(self, client):
        """Should exclude soft-deleted messages from list"""
        headers = get_auth_headers()

        msg1 = create_test_message()
        msg2 = create_test_message()

        # Soft delete one
        email_messages[msg2['messageId']]['isDeleted'] = True

        response = client.get(
            '/api/accounts/test-account/messages',
            headers=headers
        )
        assert response.status_code == 200
        assert len(response.json['messages']) == 1

    def test_invalid_pagination_defaults(self, client):
        """Should handle invalid pagination params"""
        headers = get_auth_headers()
        create_test_message()

        response = client.get(
            '/api/accounts/test-account/messages?page=0&limit=200',
            headers=headers
        )
        assert response.status_code == 200
        # Should default to page=1, limit=20
        assert response.json['pagination']['page'] == 1
        assert response.json['pagination']['limit'] == 20

    def test_case_insensitive_search(self, client):
        """Should perform case-insensitive search"""
        headers = get_auth_headers()

        create_test_message(subject='Python Programming')

        for query in ['python', 'PYTHON', 'Python', 'PYtHoN']:
            response = client.get(
                f'/api/accounts/test-account/messages/search?q={query}',
                headers=headers
            )
            assert response.status_code == 200
            assert response.json['matchCount'] == 1

    def test_empty_response_bodies_handled(self, client):
        """Should handle messages with empty bodies"""
        headers = get_auth_headers()

        msg = create_test_message(textBody='', htmlBody='')
        message_flags[msg['messageId']] = {'isRead': False}

        response = client.get(
            f'/api/accounts/test-account/messages/{msg["messageId"]}',
            headers=headers
        )
        assert response.status_code == 200
        assert response.json['textBody'] == ''


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
