"""
Comprehensive test suite for Phase 7 email models
Tests EmailFolder, EmailMessage, and EmailAttachment with Flask-SQLAlchemy
"""
import pytest
from datetime import datetime
import sys
import os
import logging

logger = logging.getLogger(__name__)

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from src.db import db, init_db
from src.models.account import EmailAccount

# Import Phase 7 models (from src/models.py)
import importlib.util
import sys
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
    """Create Flask app for testing"""
    app = Flask(__name__)
    # Use PostgreSQL-compatible in-memory SQLite for testing
    # UUID type will be mapped to TEXT in SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    # Suppress SQLAlchemy warnings about unsupported types in SQLite
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'echo': False,
        'echo_pool': False,
    }

    init_db(app)

    with app.app_context():
        # We'll skip creating the email_accounts table since UUID is not supported in SQLite
        # Instead, we'll only create the Phase 7 models (EmailFolder, EmailMessage, EmailAttachment)
        # which are compatible with SQLite
        try:
            db.create_all()
        except Exception as e:
            # If UUID fails in SQLite, that's expected
            logger.warning(f"Could not create all tables (expected for SQLite with UUID): {e}")
            # Create only the Phase 7 models
            from sqlalchemy import MetaData, inspect
            inspector = inspect(db.engine)
            for model in [EmailFolder, EmailMessage, EmailAttachment]:
                if not inspector.has_table(model.__tablename__):
                    model.__table__.create(db.engine, checkfirst=True)

        yield app
        db.session.remove()
        # Drop only Phase 7 tables to avoid UUID issues
        for model in [EmailAttachment, EmailMessage, EmailFolder]:
            try:
                model.__table__.drop(db.engine, checkfirst=True)
            except:
                pass


@pytest.fixture
def client(app):
    """Get test client"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Get CLI test runner"""
    return app.test_cli_runner()


# ==================== EmailFolder Tests ====================

class TestEmailFolder:
    """Test suite for EmailFolder model"""

    def test_create_email_folder(self, app):
        """Test creating an email folder"""
        with app.app_context():
            # Create account first
            account = EmailAccount(
                id='test-account-1',
                tenant_id='tenant-123',
                user_id='user-456',
                account_name='Test Account',
                email_address='test@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create folder
            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
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

    def test_email_folder_to_dict(self, app):
        """Test EmailFolder.to_dict() method"""
        with app.app_context():
            account = EmailAccount(
                id='test-account-2',
                tenant_id='tenant-123',
                user_id='user-456',
                account_name='Test',
                email_address='test2@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
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
            account = EmailAccount(
                id='test-account-3',
                tenant_id='tenant-abc',
                user_id='user-xyz',
                account_name='Test',
                email_address='test3@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
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
            account = EmailAccount(
                id='test-account-4',
                tenant_id='tenant-456',
                user_id='user-789',
                account_name='Test',
                email_address='test4@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create multiple folders
            folder1 = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='INBOX',
                folder_path='INBOX'
            )
            folder2 = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='Drafts',
                folder_path='[Gmail]/Drafts'
            )
            db.session.add_all([folder1, folder2])
            db.session.commit()

            # List folders
            folders = EmailFolder.list_by_account(account.id, account.tenant_id)
            assert len(folders) == 2


# ==================== EmailMessage Tests ====================

class TestEmailMessage:
    """Test suite for EmailMessage model"""

    def test_create_email_message(self, app):
        """Test creating an email message"""
        with app.app_context():
            # Create account
            account = EmailAccount(
                id='test-account-5',
                tenant_id='tenant-msg',
                user_id='user-msg',
                account_name='Test',
                email_address='test5@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create folder
            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            # Create message
            now_ms = int(datetime.utcnow().timestamp() * 1000)
            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<test123@example.com>',
                from_address='sender@example.com',
                to_addresses='test5@example.com',
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
            # Create account
            account = EmailAccount(
                id='test-account-6',
                tenant_id='tenant-del',
                user_id='user-del',
                account_name='Test',
                email_address='test6@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create folder
            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            # Create message
            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<softdel@example.com>',
                from_address='sender@example.com',
                to_addresses='test6@example.com',
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
            # Create account
            account = EmailAccount(
                id='test-account-7',
                tenant_id='tenant-dict',
                user_id='user-dict',
                account_name='Test',
                email_address='test7@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create folder
            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            # Create message
            now_ms = int(datetime.utcnow().timestamp() * 1000)
            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<dicttest@example.com>',
                from_address='sender@example.com',
                to_addresses='test7@example.com',
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
            # Create account
            account = EmailAccount(
                id='test-account-8',
                tenant_id='tenant-count',
                user_id='user-count',
                account_name='Test',
                email_address='test8@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create folder
            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            now_ms = int(datetime.utcnow().timestamp() * 1000)

            # Add messages
            msg1 = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<unread1@example.com>',
                from_address='sender@example.com',
                to_addresses='test8@example.com',
                subject='Unread 1',
                received_at=now_ms,
                is_read=False
            )
            msg2 = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<unread2@example.com>',
                from_address='sender@example.com',
                to_addresses='test8@example.com',
                subject='Unread 2',
                received_at=now_ms,
                is_read=False
            )
            msg3 = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<read@example.com>',
                from_address='sender@example.com',
                to_addresses='test8@example.com',
                subject='Read',
                received_at=now_ms,
                is_read=True
            )
            db.session.add_all([msg1, msg2, msg3])
            db.session.commit()

            unread_count = EmailMessage.count_unread(folder.id, account.tenant_id)
            assert unread_count == 2


# ==================== EmailAttachment Tests ====================

class TestEmailAttachment:
    """Test suite for EmailAttachment model"""

    def test_create_email_attachment(self, app):
        """Test creating an email attachment"""
        with app.app_context():
            # Create account
            account = EmailAccount(
                id='test-account-9',
                tenant_id='tenant-attach',
                user_id='user-attach',
                account_name='Test',
                email_address='test9@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create folder
            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            # Create message
            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<attach@example.com>',
                from_address='sender@example.com',
                to_addresses='test9@example.com',
                subject='With Attachment',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            # Create attachment
            attachment = EmailAttachment(
                message_id=message.id,
                tenant_id=account.tenant_id,
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
            # Create account
            account = EmailAccount(
                id='test-account-10',
                tenant_id='tenant-attdict',
                user_id='user-attdict',
                account_name='Test',
                email_address='test10@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create folder
            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            # Create message
            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<dictatt@example.com>',
                from_address='sender@example.com',
                to_addresses='test10@example.com',
                subject='Test',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            # Create attachment
            attachment = EmailAttachment(
                message_id=message.id,
                tenant_id=account.tenant_id,
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
            # Create account
            account = EmailAccount(
                id='test-account-11',
                tenant_id='tenant-attlist',
                user_id='user-attlist',
                account_name='Test',
                email_address='test11@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create folder
            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            # Create message
            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<listatt@example.com>',
                from_address='sender@example.com',
                to_addresses='test11@example.com',
                subject='Test',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            # Create attachments
            att1 = EmailAttachment(
                message_id=message.id,
                tenant_id=account.tenant_id,
                filename='file1.txt',
                mime_type='text/plain',
                size=1024,
                blob_url='s3://bucket/file1.txt'
            )
            att2 = EmailAttachment(
                message_id=message.id,
                tenant_id=account.tenant_id,
                filename='file2.pdf',
                mime_type='application/pdf',
                size=2048,
                blob_url='s3://bucket/file2.pdf'
            )
            db.session.add_all([att1, att2])
            db.session.commit()

            # List attachments
            attachments = EmailAttachment.list_by_message(message.id, account.tenant_id)
            assert len(attachments) == 2


# ==================== Relationship Tests ====================

class TestRelationships:
    """Test suite for model relationships"""

    def test_folder_message_relationship(self, app):
        """Test EmailFolder -> EmailMessage relationship"""
        with app.app_context():
            # Create account
            account = EmailAccount(
                id='test-account-rel1',
                tenant_id='tenant-rel',
                user_id='user-rel',
                account_name='Test',
                email_address='rel@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create folder
            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            # Create message
            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<rel@example.com>',
                from_address='sender@example.com',
                to_addresses='rel@example.com',
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
            # Create account
            account = EmailAccount(
                id='test-account-rel2',
                tenant_id='tenant-rel2',
                user_id='user-rel2',
                account_name='Test',
                email_address='rel2@example.com',
                protocol='imap',
                hostname='imap.example.com',
                port=993,
                encryption='tls',
                username='test',
                credential_id='cred-123',
                created_at=int(datetime.utcnow().timestamp() * 1000),
                updated_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(account)
            db.session.commit()

            # Create folder
            folder = EmailFolder(
                tenant_id=account.tenant_id,
                account_id=account.id,
                name='INBOX',
                folder_path='INBOX'
            )
            db.session.add(folder)
            db.session.commit()

            # Create message
            message = EmailMessage(
                folder_id=folder.id,
                tenant_id=account.tenant_id,
                message_id='<rel2@example.com>',
                from_address='sender@example.com',
                to_addresses='rel2@example.com',
                subject='Test',
                received_at=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(message)
            db.session.commit()

            # Create attachment
            attachment = EmailAttachment(
                message_id=message.id,
                tenant_id=account.tenant_id,
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
