"""
Comprehensive test suite for Phase 7 email models
Tests EmailFolder, EmailMessage, and EmailAttachment with Flask-SQLAlchemy
These tests focus on the Phase 7 models independent of EmailAccount
"""
import pytest
from datetime import datetime
import sys
import os
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from src.db import db, init_db

# Import Phase 7 models (from src/models.py)
import importlib.util
from pathlib import Path

# Load models.py as a module
models_path = Path(__file__).parent.parent / 'src' / 'models.py'
spec = importlib.util.spec_from_file_location("models_phase7", models_path)
models_module = importlib.util.module_from_spec(spec)
sys.modules['models_phase7'] = models_module
spec.loader.exec_module(models_module)

EmailFolder = models_module.EmailFolder
EmailMessage = models_module.EmailMessage
EmailAttachment = models_module.EmailAttachment


@pytest.fixture
def app():
    """Create Flask app for testing with Phase 7 models only"""
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True

    init_db(app)

    with app.app_context():
        # Create only Phase 7 tables (skip EmailAccount which uses UUID)
        for model in [EmailFolder, EmailMessage, EmailAttachment]:
            model.__table__.create(db.engine, checkfirst=True)

        yield app

        db.session.remove()
        # Drop tables in reverse order (to respect foreign keys)
        for model in [EmailAttachment, EmailMessage, EmailFolder]:
            try:
                model.__table__.drop(db.engine, checkfirst=True)
            except Exception as e:
                logger.warning(f"Could not drop table: {e}")


@pytest.fixture
def client(app):
    """Get test client"""
    return app.test_client()


def get_test_account_id():
    """Get a test account ID"""
    return f"test-account-{uuid4().hex[:8]}"


# ==================== EmailFolder Tests ====================

class TestEmailFolder:
    """Test suite for EmailFolder model"""

    def test_create_email_folder(self, app):
        """Test creating an email folder"""
        with app.app_context():
            account_id = get_test_account_id()

            folder = EmailFolder(
                tenant_id='tenant-123',
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX',
                unread_count=5,
                message_count=42
            )
            db.session.add(folder)
            db.session.commit()

            # Verify folder was created
            retrieved = EmailFolder.query.filter_by(id=folder.id).first()
            assert retrieved is not None
            assert retrieved.name == 'INBOX'
            assert retrieved.unread_count == 5
            assert retrieved.message_count == 42

    def test_email_folder_defaults(self, app):
        """Test EmailFolder default values"""
        with app.app_context():
            account_id = get_test_account_id()

            folder = EmailFolder(
                tenant_id='tenant-123',
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            retrieved = EmailFolder.query.first()
            assert retrieved.unread_count == 0
            assert retrieved.message_count == 0
            assert retrieved.created_at is not None
            assert retrieved.updated_at is not None

    def test_email_folder_to_dict(self, app):
        """Test EmailFolder.to_dict() method"""
        with app.app_context():
            account_id = get_test_account_id()

            folder = EmailFolder(
                tenant_id='tenant-123',
                account_id=account_id,
                name='Sent Mail',
                folder_path='[Gmail]/Sent Mail',
                unread_count=0,
                message_count=100,
                flags=['\\Sent', '\\HasNoChildren']
            )
            db.session.add(folder)
            db.session.commit()

            data = folder.to_dict()
            assert data['name'] == 'Sent Mail'
            assert data['folderPath'] == '[Gmail]/Sent Mail'
            assert data['unreadCount'] == 0
            assert data['flags'] == ['\\Sent', '\\HasNoChildren']

    def test_get_folder_by_id(self, app):
        """Test get_by_id static method with multi-tenant safety"""
        with app.app_context():
            account_id = get_test_account_id()

            folder = EmailFolder(
                tenant_id='tenant-abc',
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            # Get with correct tenant_id
            retrieved = EmailFolder.get_by_id(folder.id, 'tenant-abc')
            assert retrieved is not None
            assert retrieved.id == folder.id

            # Get with wrong tenant_id (multi-tenant safety)
            retrieved = EmailFolder.get_by_id(folder.id, 'tenant-wrong')
            assert retrieved is None

    def test_list_folders_by_account(self, app):
        """Test list_by_account static method"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-456'

            folder1 = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            folder2 = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='Drafts',
                folder_path='[Gmail]/Drafts'
            )
            db.session.add_all([folder1, folder2])
            db.session.commit()

            # List folders
            folders = EmailFolder.list_by_account(account_id, tenant_id)
            assert len(folders) == 2


# ==================== EmailMessage Tests ====================

class TestEmailMessage:
    """Test suite for EmailMessage model"""

    def test_create_email_message(self, app):
        """Test creating an email message"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-msg'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            now_ms = int(datetime.utcnow().timestamp() * 1000)
            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<test123@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Test Email',
                body='This is a test',
                received_at=now_ms,
                is_html=False
            )
            db.session.add(message)
            db.session.commit()

            # Verify
            retrieved = EmailMessage.query.filter_by(id=message.id).first()
            assert retrieved is not None
            assert retrieved.subject == 'Test Email'
            assert retrieved.from_address == 'sender@example.com'
            assert retrieved.is_read == False

    def test_message_soft_delete(self, app):
        """Test soft delete flag for messages"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-del'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<softdel@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Test',
                received_at=int(datetime.utcnow().timestamp() * 1000),
                is_deleted=False
            )
            db.session.add(message)
            db.session.commit()

            message.is_deleted = True
            db.session.commit()

            # Message still exists (soft delete)
            retrieved = EmailMessage.query.filter_by(id=message.id).first()
            assert retrieved is not None
            assert retrieved.is_deleted == True

    def test_message_to_dict(self, app):
        """Test EmailMessage.to_dict() method"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-dict'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            now_ms = int(datetime.utcnow().timestamp() * 1000)
            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<dicttest@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Dict Test',
                body='Test body',
                received_at=now_ms,
                is_read=True,
                is_starred=True
            )
            db.session.add(message)
            db.session.commit()

            data = message.to_dict(include_body=True)
            assert data['subject'] == 'Dict Test'
            assert data['fromAddress'] == 'sender@example.com'
            assert data['body'] == 'Test body'
            assert data['isRead'] == True
            assert data['isStarred'] == True

    def test_count_unread_messages(self, app):
        """Test count_unread static method"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-count'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            now_ms = int(datetime.utcnow().timestamp() * 1000)

            # Add messages
            msg1 = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<unread1@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Unread 1',
                received_at=now_ms,
                is_read=False
            )
            msg2 = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<unread2@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Unread 2',
                received_at=now_ms,
                is_read=False
            )
            msg3 = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<read@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Read',
                received_at=now_ms,
                is_read=True
            )
            db.session.add_all([msg1, msg2, msg3])
            db.session.commit()

            unread_count = EmailMessage.count_unread(folder.id, tenant_id)
            assert unread_count == 2


# ==================== EmailAttachment Tests ====================

class TestEmailAttachment:
    """Test suite for EmailAttachment model"""

    def test_create_email_attachment(self, app):
        """Test creating an email attachment"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-attach'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<attach@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='With Attachment',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            attachment = EmailAttachment(
                message_id=message.id,
                tenant_id=tenant_id,
                filename='document.pdf',
                mime_type='application/pdf',
                size=102400,
                blob_url='s3://bucket/document.pdf'
            )
            db.session.add(attachment)
            db.session.commit()

            # Verify
            retrieved = EmailAttachment.query.filter_by(id=attachment.id).first()
            assert retrieved is not None
            assert retrieved.filename == 'document.pdf'
            assert retrieved.mime_type == 'application/pdf'
            assert retrieved.size == 102400

    def test_attachment_to_dict(self, app):
        """Test EmailAttachment.to_dict() method"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-attdict'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<dictatt@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Test',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            attachment = EmailAttachment(
                message_id=message.id,
                tenant_id=tenant_id,
                filename='image.jpg',
                mime_type='image/jpeg',
                size=51200,
                blob_url='s3://bucket/image.jpg',
                content_hash='abc123def456'
            )
            db.session.add(attachment)
            db.session.commit()

            data = attachment.to_dict()
            assert data['filename'] == 'image.jpg'
            assert data['mimeType'] == 'image/jpeg'
            assert data['size'] == 51200
            assert data['contentHash'] == 'abc123def456'

    def test_list_attachments_by_message(self, app):
        """Test list_by_message static method"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-attlist'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<listatt@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Test',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            # Create attachments
            att1 = EmailAttachment(
                message_id=message.id,
                tenant_id=tenant_id,
                filename='file1.txt',
                mime_type='text/plain',
                size=1024,
                blob_url='s3://bucket/file1.txt'
            )
            att2 = EmailAttachment(
                message_id=message.id,
                tenant_id=tenant_id,
                filename='file2.pdf',
                mime_type='application/pdf',
                size=2048,
                blob_url='s3://bucket/file2.pdf'
            )
            db.session.add_all([att1, att2])
            db.session.commit()

            # List attachments
            attachments = EmailAttachment.list_by_message(message.id, tenant_id)
            assert len(attachments) == 2


# ==================== Relationship Tests ====================

class TestRelationships:
    """Test suite for model relationships"""

    def test_folder_message_relationship(self, app):
        """Test EmailFolder -> EmailMessage relationship"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-rel'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<rel@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Test',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            # Access through relationship
            assert message.email_folder.id == folder.id
            assert len(folder.email_messages) == 1
            assert folder.email_messages[0].id == message.id

    def test_message_attachment_relationship(self, app):
        """Test EmailMessage -> EmailAttachment relationship"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-rel2'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<rel2@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Test',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            attachment = EmailAttachment(
                message_id=message.id,
                tenant_id=tenant_id,
                filename='test.txt',
                mime_type='text/plain',
                size=100,
                blob_url='s3://bucket/test.txt'
            )
            db.session.add(attachment)
            db.session.commit()

            # Access through relationship
            assert attachment.email_message.id == message.id
            assert len(message.email_attachments) == 1
            assert message.email_attachments[0].id == attachment.id

    def test_cascade_delete_folder_messages(self, app):
        """Test cascade delete from folder to messages"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-cascade'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<cascade@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Test',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            message_id = message.id
            folder_id = folder.id

            # Delete folder
            db.session.delete(folder)
            db.session.commit()

            # Verify message was cascade deleted
            assert EmailFolder.query.filter_by(id=folder_id).first() is None
            assert EmailMessage.query.filter_by(id=message_id).first() is None

    def test_cascade_delete_message_attachments(self, app):
        """Test cascade delete from message to attachments"""
        with app.app_context():
            account_id = get_test_account_id()
            tenant_id = 'tenant-cascade2'

            folder = EmailFolder(
                tenant_id=tenant_id,
                account_id=account_id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=tenant_id,
                message_id='<cascade2@example.com>',
                from_address='sender@example.com',
                to_addresses='test@example.com',
                subject='Test',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            attachment = EmailAttachment(
                message_id=message.id,
                tenant_id=tenant_id,
                filename='test.txt',
                mime_type='text/plain',
                size=100,
                blob_url='s3://bucket/test.txt'
            )
            db.session.add(attachment)
            db.session.commit()

            attachment_id = attachment.id
            message_id = message.id

            # Delete message
            db.session.delete(message)
            db.session.commit()

            # Verify attachment was cascade deleted
            assert EmailMessage.query.filter_by(id=message_id).first() is None
            assert EmailAttachment.query.filter_by(id=attachment_id).first() is None
