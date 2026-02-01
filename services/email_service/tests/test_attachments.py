"""
Comprehensive tests for Attachments API (Phase 7)
Tests all endpoints, file upload/download, virus scanning, deduplication, and access control
"""
import pytest
import uuid
import json
import io
import os
from datetime import datetime
from typing import Dict, Any, Tuple
from pathlib import Path

# Import test fixtures and helpers
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from src.models import EmailAccount, EmailFolder, EmailMessage, EmailAttachment
from src.config import init_db, get_session, drop_all_tables
from src.db import db


@pytest.fixture(scope='session')
def setup_db():
    """Setup test database once per session"""
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True

    with app.app_context():
        init_db()
        yield
        drop_all_tables()


@pytest.fixture
def client(setup_db):
    """Flask test client with database"""
    with app.test_client() as client:
        yield client


@pytest.fixture(autouse=True)
def cleanup_db():
    """Clean up database after each test"""
    yield
    with app.app_context():
        db.session.query(EmailAttachment).delete()
        db.session.query(EmailMessage).delete()
        db.session.query(EmailFolder).delete()
        db.session.query(EmailAccount).delete()
        db.session.commit()


def create_test_account(
    tenant_id: str = 'tenant-1',
    user_id: str = 'user-1',
    **overrides
) -> EmailAccount:
    """Helper to create test email account"""
    now = int(datetime.utcnow().timestamp() * 1000)

    account = EmailAccount(
        email='test@example.com',
        user_id=user_id,
        tenant_id=tenant_id,
        imap_server='imap.example.com',
        imap_port=993,
        smtp_server='smtp.example.com',
        smtp_port=587,
        is_active=True,
        created_at=now,
        updated_at=now,
        **overrides
    )

    db.session.add(account)
    db.session.commit()
    return account


def create_test_folder(
    account_id: str,
    tenant_id: str = 'tenant-1',
    name: str = 'Inbox',
    **overrides
) -> EmailFolder:
    """Helper to create test email folder"""
    now = int(datetime.utcnow().timestamp() * 1000)

    folder = EmailFolder(
        account_id=account_id,
        tenant_id=tenant_id,
        name=name,
        folder_path=f'[Gmail]/{name}' if name != 'Inbox' else 'INBOX',
        created_at=now,
        updated_at=now,
        **overrides
    )

    db.session.add(folder)
    db.session.commit()
    return folder


def create_test_message(
    folder_id: str,
    tenant_id: str = 'tenant-1',
    subject: str = 'Test Email',
    **overrides
) -> EmailMessage:
    """Helper to create test email message"""
    now = int(datetime.utcnow().timestamp() * 1000)
    msg_id = str(uuid.uuid4())

    message = EmailMessage(
        folder_id=folder_id,
        tenant_id=tenant_id,
        message_id=msg_id,
        from_address='sender@example.com',
        to_addresses='recipient@example.com',
        subject=subject,
        is_read=False,
        is_deleted=False,
        received_at=now,
        created_at=now,
        updated_at=now,
        **overrides
    )

    db.session.add(message)
    db.session.commit()
    return message


def create_test_attachment(
    message_id: str,
    tenant_id: str = 'tenant-1',
    filename: str = 'test.pdf',
    mime_type: str = 'application/pdf',
    size: int = 1024,
    **overrides
) -> EmailAttachment:
    """Helper to create test attachment"""
    now = int(datetime.utcnow().timestamp() * 1000)

    attachment = EmailAttachment(
        message_id=message_id,
        tenant_id=tenant_id,
        filename=filename,
        mime_type=mime_type,
        size=size,
        blob_url=f'{message_id}/{filename}',
        blob_key=f'{message_id}/{filename}',
        uploaded_at=now,
        created_at=now,
        updated_at=now,
        **overrides
    )

    db.session.add(attachment)
    db.session.commit()
    return attachment


def get_auth_headers(
    tenant_id: str = 'tenant-1',
    user_id: str = 'user-1'
) -> Dict[str, str]:
    """Helper to generate auth headers"""
    return {
        'X-Tenant-ID': tenant_id,
        'X-User-ID': user_id,
        'X-User-Role': 'user'
    }


class TestListAttachments:
    """Test GET /api/v1/messages/{id}/attachments"""

    def test_list_attachments_success(self, client):
        """Test listing attachments for a message"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)
        att1 = create_test_attachment(message.id, filename='doc1.pdf')
        att2 = create_test_attachment(message.id, filename='doc2.docx')

        headers = get_auth_headers()
        response = client.get(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers
        )

        assert response.status_code == 200
        data = json.loads(response.data)

        assert 'data' in data
        assert 'pagination' in data
        assert len(data['data']) == 2
        assert data['pagination']['total'] == 2
        assert data['data'][0]['filename'] == 'doc1.pdf'
        assert data['data'][1]['filename'] == 'doc2.docx'
        assert data['data'][0]['mimeType'] == 'application/pdf'
        assert data['data'][0]['size'] == 1024

    def test_list_attachments_empty(self, client):
        """Test listing attachments when none exist"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)

        headers = get_auth_headers()
        response = client.get(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['pagination']['total'] == 0
        assert len(data['data']) == 0

    def test_list_attachments_pagination(self, client):
        """Test pagination of attachment list"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)

        # Create 15 attachments
        for i in range(15):
            create_test_attachment(message.id, filename=f'doc{i}.pdf')

        headers = get_auth_headers()

        # First page
        response = client.get(
            f'/api/v1/messages/{message.id}/attachments?offset=0&limit=5',
            headers=headers
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['data']) == 5
        assert data['pagination']['total'] == 15

        # Second page
        response = client.get(
            f'/api/v1/messages/{message.id}/attachments?offset=5&limit=5',
            headers=headers
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['data']) == 5

        # Last page
        response = client.get(
            f'/api/v1/messages/{message.id}/attachments?offset=10&limit=5',
            headers=headers
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['data']) == 5

    def test_list_attachments_message_not_found(self, client):
        """Test listing attachments for non-existent message"""
        headers = get_auth_headers()
        response = client.get(
            f'/api/v1/messages/nonexistent/attachments',
            headers=headers
        )

        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error'] == 'Not found'

    def test_list_attachments_multi_tenant_isolation(self, client):
        """Test multi-tenant isolation on list"""
        account1 = create_test_account(tenant_id='tenant-1')
        folder1 = create_test_folder(account1.id, tenant_id='tenant-1')
        message1 = create_test_message(folder1.id, tenant_id='tenant-1')
        att1 = create_test_attachment(message1.id, tenant_id='tenant-1')

        account2 = create_test_account(tenant_id='tenant-2')
        folder2 = create_test_folder(account2.id, tenant_id='tenant-2')
        message2 = create_test_message(folder2.id, tenant_id='tenant-2')
        att2 = create_test_attachment(message2.id, tenant_id='tenant-2')

        # Tenant 1 should not see tenant 2's attachments
        headers = get_auth_headers(tenant_id='tenant-1')
        response = client.get(
            f'/api/v1/messages/{message2.id}/attachments',
            headers=headers
        )

        assert response.status_code == 404

    def test_list_attachments_invalid_pagination(self, client):
        """Test invalid pagination parameters"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)

        headers = get_auth_headers()

        # Invalid offset
        response = client.get(
            f'/api/v1/messages/{message.id}/attachments?offset=-1',
            headers=headers
        )
        assert response.status_code == 400

        # Invalid limit
        response = client.get(
            f'/api/v1/messages/{message.id}/attachments?limit=0',
            headers=headers
        )
        assert response.status_code == 400

        # Limit too large
        response = client.get(
            f'/api/v1/messages/{message.id}/attachments?limit=101',
            headers=headers
        )
        assert response.status_code == 400

    def test_list_attachments_missing_auth_headers(self, client):
        """Test missing authentication headers"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)

        response = client.get(f'/api/v1/messages/{message.id}/attachments')
        assert response.status_code == 401


class TestDownloadAttachment:
    """Test GET /api/v1/attachments/{id}/download"""

    def test_download_attachment_success(self, client):
        """Test downloading an attachment"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)
        attachment = create_test_attachment(message.id, filename='test.pdf')

        # Create actual file in blob storage
        blob_path = os.path.join('/tmp/email_attachments', attachment.blob_key)
        os.makedirs(os.path.dirname(blob_path), exist_ok=True)
        with open(blob_path, 'wb') as f:
            f.write(b'PDF content')

        headers = get_auth_headers()
        response = client.get(
            f'/api/v1/attachments/{attachment.id}/download',
            headers=headers
        )

        assert response.status_code == 200
        assert response.data == b'PDF content'
        assert response.content_type == 'application/pdf'
        assert 'attachment' in response.headers['Content-Disposition']
        assert 'test.pdf' in response.headers['Content-Disposition']

        # Cleanup
        os.remove(blob_path)

    def test_download_attachment_inline(self, client):
        """Test downloading attachment as inline (display in browser)"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)
        attachment = create_test_attachment(message.id, filename='image.png', mime_type='image/png')

        blob_path = os.path.join('/tmp/email_attachments', attachment.blob_key)
        os.makedirs(os.path.dirname(blob_path), exist_ok=True)
        with open(blob_path, 'wb') as f:
            f.write(b'PNG data')

        headers = get_auth_headers()
        response = client.get(
            f'/api/v1/attachments/{attachment.id}/download?inline=true',
            headers=headers
        )

        assert response.status_code == 200
        assert 'inline' in response.headers['Content-Disposition']

        # Cleanup
        os.remove(blob_path)

    def test_download_attachment_not_found(self, client):
        """Test downloading non-existent attachment"""
        headers = get_auth_headers()
        response = client.get(
            f'/api/v1/attachments/nonexistent/download',
            headers=headers
        )

        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error'] == 'Not found'

    def test_download_attachment_file_missing(self, client):
        """Test downloading when file is missing from storage"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)
        attachment = create_test_attachment(message.id)

        # Don't create actual file in blob storage
        headers = get_auth_headers()
        response = client.get(
            f'/api/v1/attachments/{attachment.id}/download',
            headers=headers
        )

        assert response.status_code == 404

    def test_download_attachment_multi_tenant_isolation(self, client):
        """Test multi-tenant isolation on download"""
        account1 = create_test_account(tenant_id='tenant-1')
        folder1 = create_test_folder(account1.id, tenant_id='tenant-1')
        message1 = create_test_message(folder1.id, tenant_id='tenant-1')
        att1 = create_test_attachment(message1.id, tenant_id='tenant-1')

        account2 = create_test_account(tenant_id='tenant-2')
        folder2 = create_test_folder(account2.id, tenant_id='tenant-2')
        message2 = create_test_message(folder2.id, tenant_id='tenant-2')
        att2 = create_test_attachment(message2.id, tenant_id='tenant-2')

        # Tenant 1 should not be able to download tenant 2's attachment
        headers = get_auth_headers(tenant_id='tenant-1')
        response = client.get(
            f'/api/v1/attachments/{att2.id}/download',
            headers=headers
        )

        assert response.status_code == 404


class TestUploadAttachment:
    """Test POST /api/v1/messages/{id}/attachments"""

    def test_upload_attachment_success(self, client):
        """Test successful file upload"""
        account = create_test_account()
        folder = create_test_folder(account.id, name='Drafts')
        message = create_test_message(folder.id)

        file_data = b'Test PDF content'
        headers = get_auth_headers()

        response = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers,
            data={'file': (io.BytesIO(file_data), 'test.pdf', 'application/pdf')}
        )

        assert response.status_code == 201
        data = json.loads(response.data)

        assert 'id' in data
        assert data['filename'] == 'test.pdf'
        assert data['mimeType'] == 'application/pdf'
        assert data['size'] == len(file_data)
        assert 'uploadedAt' in data
        assert 'contentHash' in data
        assert data['virusScanStatus'] in ['pending', 'safe']

        # Cleanup
        blob_path = os.path.join('/tmp/email_attachments', data['id'] + '.pdf')
        if os.path.exists(blob_path):
            os.remove(blob_path)

    def test_upload_attachment_not_draft(self, client):
        """Test uploading to non-draft message"""
        account = create_test_account()
        folder = create_test_folder(account.id, name='Inbox')
        message = create_test_message(folder.id)

        headers = get_auth_headers()
        response = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers,
            data={'file': (io.BytesIO(b'content'), 'test.pdf', 'application/pdf')}
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'draft' in data['message'].lower()

    def test_upload_attachment_file_too_large(self, client):
        """Test uploading file that exceeds max size"""
        account = create_test_account()
        folder = create_test_folder(account.id, name='Drafts')
        message = create_test_message(folder.id)

        # Create file larger than default 25MB
        file_data = b'x' * (26 * 1024 * 1024)

        headers = get_auth_headers()
        response = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers,
            data={'file': (io.BytesIO(file_data), 'large.bin', 'application/octet-stream')}
        )

        assert response.status_code == 413
        data = json.loads(response.data)
        assert 'exceeds' in data['message'].lower()

    def test_upload_attachment_invalid_mime_type(self, client):
        """Test uploading file with disallowed MIME type"""
        account = create_test_account()
        folder = create_test_folder(account.id, name='Drafts')
        message = create_test_message(folder.id)

        headers = get_auth_headers()
        response = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers,
            data={'file': (io.BytesIO(b'content'), 'test.exe', 'application/x-msdownload')}
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'not allowed' in data['message'].lower()

    def test_upload_attachment_deduplication(self, client):
        """Test deduplication of identical attachments"""
        account = create_test_account()
        folder = create_test_folder(account.id, name='Drafts')
        message = create_test_message(folder.id)

        file_data = b'Duplicate content'
        headers = get_auth_headers()

        # Upload first time
        response1 = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers,
            data={'file': (io.BytesIO(file_data), 'file.pdf', 'application/pdf')}
        )
        assert response1.status_code == 201
        data1 = json.loads(response1.data)
        hash1 = data1['contentHash']

        # Upload same content again
        response2 = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers,
            data={'file': (io.BytesIO(file_data), 'file2.pdf', 'application/pdf')}
        )
        assert response2.status_code == 201
        data2 = json.loads(response2.data)

        # Should have same hash
        assert data2['contentHash'] == hash1
        assert data2['virusScanStatus'] == 'duplicate'

    def test_upload_attachment_max_attachments(self, client):
        """Test exceeding maximum attachments per message"""
        account = create_test_account()
        folder = create_test_folder(account.id, name='Drafts')
        message = create_test_message(folder.id)

        # Create max attachments (20 by default)
        for i in range(20):
            create_test_attachment(message.id, filename=f'file{i}.pdf')

        headers = get_auth_headers()
        response = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers,
            data={'file': (io.BytesIO(b'content'), 'extra.pdf', 'application/pdf')}
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'maximum' in data['message'].lower()

    def test_upload_attachment_no_file(self, client):
        """Test uploading without file field"""
        account = create_test_account()
        folder = create_test_folder(account.id, name='Drafts')
        message = create_test_message(folder.id)

        headers = get_auth_headers()
        response = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers,
            data={}
        )

        assert response.status_code == 400

    def test_upload_attachment_empty_file(self, client):
        """Test uploading empty file"""
        account = create_test_account()
        folder = create_test_folder(account.id, name='Drafts')
        message = create_test_message(folder.id)

        headers = get_auth_headers()
        response = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers,
            data={'file': (io.BytesIO(b''), 'empty.pdf', 'application/pdf')}
        )

        assert response.status_code == 400

    def test_upload_attachment_message_not_found(self, client):
        """Test uploading to non-existent message"""
        headers = get_auth_headers()
        response = client.post(
            f'/api/v1/messages/nonexistent/attachments',
            headers=headers,
            data={'file': (io.BytesIO(b'content'), 'test.pdf', 'application/pdf')}
        )

        assert response.status_code == 404

    def test_upload_attachment_custom_filename(self, client):
        """Test uploading with custom filename"""
        account = create_test_account()
        folder = create_test_folder(account.id, name='Drafts')
        message = create_test_message(folder.id)

        headers = get_auth_headers()
        response = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers,
            data={
                'file': (io.BytesIO(b'content'), 'original.pdf', 'application/pdf'),
                'filename': 'custom.pdf'
            }
        )

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['filename'] == 'custom.pdf'

        # Cleanup
        blob_path = os.path.join('/tmp/email_attachments', data['id'] + '.pdf')
        if os.path.exists(blob_path):
            os.remove(blob_path)


class TestDeleteAttachment:
    """Test DELETE /api/v1/attachments/{id}"""

    def test_delete_attachment_success(self, client):
        """Test successful attachment deletion"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)
        attachment = create_test_attachment(message.id)

        # Create actual file
        blob_path = os.path.join('/tmp/email_attachments', attachment.blob_key)
        os.makedirs(os.path.dirname(blob_path), exist_ok=True)
        with open(blob_path, 'wb') as f:
            f.write(b'content')

        headers = get_auth_headers()
        response = client.delete(
            f'/api/v1/attachments/{attachment.id}',
            headers=headers
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True

        # Verify file was deleted
        assert not os.path.exists(blob_path)

        # Verify record was deleted
        from src.models import EmailAttachment as AttModel
        deleted = AttModel.get_by_id(attachment.id, 'tenant-1')
        assert deleted is None

    def test_delete_attachment_not_found(self, client):
        """Test deleting non-existent attachment"""
        headers = get_auth_headers()
        response = client.delete(
            f'/api/v1/attachments/nonexistent',
            headers=headers
        )

        assert response.status_code == 404

    def test_delete_attachment_multi_tenant_isolation(self, client):
        """Test multi-tenant isolation on delete"""
        account1 = create_test_account(tenant_id='tenant-1')
        folder1 = create_test_folder(account1.id, tenant_id='tenant-1')
        message1 = create_test_message(folder1.id, tenant_id='tenant-1')
        att1 = create_test_attachment(message1.id, tenant_id='tenant-1')

        account2 = create_test_account(tenant_id='tenant-2')
        folder2 = create_test_folder(account2.id, tenant_id='tenant-2')
        message2 = create_test_message(folder2.id, tenant_id='tenant-2')
        att2 = create_test_attachment(message2.id, tenant_id='tenant-2')

        # Tenant 1 should not be able to delete tenant 2's attachment
        headers = get_auth_headers(tenant_id='tenant-1')
        response = client.delete(
            f'/api/v1/attachments/{att2.id}',
            headers=headers
        )

        assert response.status_code == 404


class TestGetAttachmentMetadata:
    """Test GET /api/v1/attachments/{id}/metadata"""

    def test_get_metadata_success(self, client):
        """Test getting attachment metadata"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)
        attachment = create_test_attachment(
            message.id,
            filename='document.pdf',
            mime_type='application/pdf',
            size=5120
        )

        headers = get_auth_headers()
        response = client.get(
            f'/api/v1/attachments/{attachment.id}/metadata',
            headers=headers
        )

        assert response.status_code == 200
        data = json.loads(response.data)

        assert data['id'] == attachment.id
        assert data['filename'] == 'document.pdf'
        assert data['mimeType'] == 'application/pdf'
        assert data['size'] == 5120
        assert 'uploadedAt' in data
        assert 'contentHash' in data

    def test_get_metadata_not_found(self, client):
        """Test getting metadata for non-existent attachment"""
        headers = get_auth_headers()
        response = client.get(
            f'/api/v1/attachments/nonexistent/metadata',
            headers=headers
        )

        assert response.status_code == 404

    def test_get_metadata_multi_tenant_isolation(self, client):
        """Test multi-tenant isolation on metadata retrieval"""
        account1 = create_test_account(tenant_id='tenant-1')
        folder1 = create_test_folder(account1.id, tenant_id='tenant-1')
        message1 = create_test_message(folder1.id, tenant_id='tenant-1')
        att1 = create_test_attachment(message1.id, tenant_id='tenant-1')

        account2 = create_test_account(tenant_id='tenant-2')
        folder2 = create_test_folder(account2.id, tenant_id='tenant-2')
        message2 = create_test_message(folder2.id, tenant_id='tenant-2')
        att2 = create_test_attachment(message2.id, tenant_id='tenant-2')

        headers = get_auth_headers(tenant_id='tenant-1')
        response = client.get(
            f'/api/v1/attachments/{att2.id}/metadata',
            headers=headers
        )

        assert response.status_code == 404


class TestAuthenticationAndAuthorization:
    """Test authentication and authorization on all endpoints"""

    def test_missing_auth_headers(self, client):
        """Test all endpoints require auth headers"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)
        attachment = create_test_attachment(message.id)

        # Test without headers
        response = client.get(f'/api/v1/messages/{message.id}/attachments')
        assert response.status_code == 401

        response = client.get(f'/api/v1/attachments/{attachment.id}/download')
        assert response.status_code == 401

        response = client.post(
            f'/api/v1/messages/{message.id}/attachments',
            data={'file': (io.BytesIO(b'content'), 'test.pdf')}
        )
        assert response.status_code == 401

        response = client.delete(f'/api/v1/attachments/{attachment.id}')
        assert response.status_code == 401

        response = client.get(f'/api/v1/attachments/{attachment.id}/metadata')
        assert response.status_code == 401

    def test_invalid_tenant_id(self, client):
        """Test invalid tenant ID format"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)

        headers = {
            'X-Tenant-ID': 'invalid',  # Invalid UUID
            'X-User-ID': 'user-1'
        }

        response = client.get(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers
        )
        assert response.status_code == 400

    def test_invalid_user_id(self, client):
        """Test invalid user ID format"""
        account = create_test_account()
        folder = create_test_folder(account.id)
        message = create_test_message(folder.id)

        headers = {
            'X-Tenant-ID': 'tenant-1',
            'X-User-ID': 'invalid'  # Invalid UUID
        }

        response = client.get(
            f'/api/v1/messages/{message.id}/attachments',
            headers=headers
        )
        assert response.status_code == 400
