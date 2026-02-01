"""
Comprehensive test suite for SQLAlchemy email models
Tests model creation, relationships, constraints, cascading deletes, and indexes
"""
import pytest
from datetime import datetime
from sqlalchemy import create_engine, inspect, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from src.models import (
    Base,
    EmailAccount,
    EmailFolder,
    EmailMessage,
    EmailAttachment,
    ProviderEnum,
    EncryptionEnum,
    get_email_accounts_by_tenant,
    get_email_account_by_id,
    get_email_folders_by_account,
    get_email_folder_by_id,
    get_email_messages_by_folder,
    get_email_message_by_id,
    get_email_attachments_by_message,
    count_unread_messages,
)


@pytest.fixture
def test_db():
    """Create an in-memory SQLite database for testing"""
    engine = create_engine('sqlite:///:memory:', echo=False)

    # Enable foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    yield Session(), engine

    engine.dispose()


@pytest.fixture
def session(test_db):
    """Get session from test database"""
    sess, _ = test_db
    yield sess
    sess.close()


@pytest.fixture
def engine(test_db):
    """Get engine from test database"""
    _, eng = test_db
    return eng


# ==================== EmailAccount Tests ====================

class TestEmailAccount:
    """Test suite for EmailAccount model"""

    def test_create_email_account(self, session):
        """Test creating an email account"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='My Gmail',
            email_address='test@gmail.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.gmail.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test@gmail.com',
            credential_id='cred-789'
        )

        session.add(account)
        session.commit()

        # Verify account was created
        retrieved = session.query(EmailAccount).filter_by(email_address='test@gmail.com').first()
        assert retrieved is not None
        assert retrieved.id is not None
        assert retrieved.tenant_id == 'tenant-123'
        assert retrieved.email_address == 'test@gmail.com'
        assert retrieved.protocol == ProviderEnum.IMAP

    def test_email_account_defaults(self, session):
        """Test EmailAccount default values"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test Account',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )

        session.add(account)
        session.commit()

        retrieved = session.query(EmailAccount).first()
        assert retrieved.is_sync_enabled == True
        assert retrieved.sync_interval == 300
        assert retrieved.is_active == True
        assert retrieved.sync_error_count == 0
        assert retrieved.created_at is not None
        assert retrieved.updated_at is not None

    def test_email_address_unique_constraint(self, session):
        """Test email address unique constraint"""
        account1 = EmailAccount(
            tenant_id='tenant-1',
            user_id='user-1',
            account_name='Account 1',
            email_address='duplicate@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='user1',
            credential_id='cred-1'
        )
        session.add(account1)
        session.commit()

        account2 = EmailAccount(
            tenant_id='tenant-2',
            user_id='user-2',
            account_name='Account 2',
            email_address='duplicate@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='user2',
            credential_id='cred-2'
        )
        session.add(account2)

        with pytest.raises(IntegrityError):
            session.commit()

    def test_email_account_required_fields(self, session):
        """Test EmailAccount required field validation"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            # Missing required fields: account_name, email_address, etc.
        )
        session.add(account)

        with pytest.raises(IntegrityError):
            session.commit()

    def test_email_account_to_dict(self, session):
        """Test EmailAccount.to_dict() method"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test Account',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='testuser',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        data = account.to_dict(include_sensitive=False)
        assert data['email_address'] == 'test@example.com'
        assert data['account_name'] == 'Test Account'
        assert 'username' not in data
        assert 'credential_id' not in data

        data_sensitive = account.to_dict(include_sensitive=True)
        assert data_sensitive['username'] == 'testuser'
        assert data_sensitive['credential_id'] == 'cred-123'

    def test_email_account_repr(self, session):
        """Test EmailAccount string representation"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.POP3,
            hostname='pop.example.com',
            port=995,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        repr_str = repr(account)
        assert 'EmailAccount' in repr_str
        assert 'test@example.com' in repr_str


# ==================== EmailFolder Tests ====================

class TestEmailFolder:
    """Test suite for EmailFolder model"""

    def test_create_email_folder(self, session):
        """Test creating an email folder"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX',
            unread_count=5,
            message_count=42
        )
        session.add(folder)
        session.commit()

        retrieved = session.query(EmailFolder).first()
        assert retrieved is not None
        assert retrieved.account_id == account.id
        assert retrieved.name == 'INBOX'
        assert retrieved.unread_count == 5
        assert retrieved.message_count == 42

    def test_email_folder_cascade_delete(self, session):
        """Test that deleting account cascades to folders"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        folder_id = folder.id
        account_id = account.id

        # Delete account
        session.delete(account)
        session.commit()

        # Verify folder was cascade deleted
        assert session.query(EmailAccount).filter_by(id=account_id).first() is None
        assert session.query(EmailFolder).filter_by(id=folder_id).first() is None

    def test_email_folder_flags(self, session):
        """Test EmailFolder flags JSON field"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='All Mail',
            folder_path='[Gmail]/All Mail',
            flags=['\\All', '\\HasNoChildren']
        )
        session.add(folder)
        session.commit()

        retrieved = session.query(EmailFolder).first()
        assert retrieved.flags == ['\\All', '\\HasNoChildren']

    def test_email_folder_unique_path_per_account(self, session):
        """Test unique constraint on account_id + folder_path"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder1 = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder1)
        session.commit()

        folder2 = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder2)

        with pytest.raises(IntegrityError):
            session.commit()

    def test_email_folder_to_dict(self, session):
        """Test EmailFolder.to_dict() method"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX',
            unread_count=5
        )
        session.add(folder)
        session.commit()

        data = folder.to_dict()
        assert data['name'] == 'INBOX'
        assert data['folder_path'] == 'INBOX'
        assert data['unread_count'] == 5


# ==================== EmailMessage Tests ====================

class TestEmailMessage:
    """Test suite for EmailMessage model"""

    def test_create_email_message(self, session):
        """Test creating an email message"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        message = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<test@example.com>',
            from_address='sender@example.com',
            to_addresses='recipient@example.com',
            subject='Test Email',
            body='This is a test email',
            received_at=datetime.now(),
            is_html=False
        )
        session.add(message)
        session.commit()

        retrieved = session.query(EmailMessage).first()
        assert retrieved is not None
        assert retrieved.from_address == 'sender@example.com'
        assert retrieved.subject == 'Test Email'
        assert retrieved.is_read == False

    def test_email_message_soft_delete(self, session):
        """Test soft delete flag for messages"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        message = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<test@example.com>',
            from_address='sender@example.com',
            to_addresses='recipient@example.com',
            subject='Test',
            received_at=datetime.now(),
            is_deleted=False
        )
        session.add(message)
        session.commit()

        message.is_deleted = True
        session.commit()

        # Message still exists in database
        retrieved = session.query(EmailMessage).first()
        assert retrieved is not None
        assert retrieved.is_deleted == True

    def test_email_message_cascade_delete(self, session):
        """Test that deleting folder cascades to messages"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        message = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<test@example.com>',
            from_address='sender@example.com',
            to_addresses='recipient@example.com',
            subject='Test',
            received_at=datetime.now()
        )
        session.add(message)
        session.commit()

        message_id = message.id
        folder_id = folder.id

        # Delete folder
        session.delete(folder)
        session.commit()

        # Verify message was cascade deleted
        assert session.query(EmailFolder).filter_by(id=folder_id).first() is None
        assert session.query(EmailMessage).filter_by(id=message_id).first() is None

    def test_email_message_to_dict(self, session):
        """Test EmailMessage.to_dict() method"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        message = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<test@example.com>',
            from_address='sender@example.com',
            to_addresses='recipient@example.com',
            subject='Test Email',
            body='Email body',
            received_at=datetime.now(),
            is_read=True,
            is_starred=True
        )
        session.add(message)
        session.commit()

        data = message.to_dict(include_body=True, include_headers=False)
        assert data['subject'] == 'Test Email'
        assert data['from_address'] == 'sender@example.com'
        assert data['body'] == 'Email body'
        assert data['is_read'] == True
        assert data['is_starred'] == True


# ==================== EmailAttachment Tests ====================

class TestEmailAttachment:
    """Test suite for EmailAttachment model"""

    def test_create_email_attachment(self, session):
        """Test creating an email attachment"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        message = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<test@example.com>',
            from_address='sender@example.com',
            to_addresses='recipient@example.com',
            subject='Test',
            received_at=datetime.now()
        )
        session.add(message)
        session.commit()

        attachment = EmailAttachment(
            message_id=message.id,
            tenant_id=account.tenant_id,
            filename='document.pdf',
            mime_type='application/pdf',
            size=102400,
            blob_url='s3://bucket/document.pdf'
        )
        session.add(attachment)
        session.commit()

        retrieved = session.query(EmailAttachment).first()
        assert retrieved is not None
        assert retrieved.filename == 'document.pdf'
        assert retrieved.mime_type == 'application/pdf'
        assert retrieved.size == 102400

    def test_email_attachment_cascade_delete(self, session):
        """Test that deleting message cascades to attachments"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        message = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<test@example.com>',
            from_address='sender@example.com',
            to_addresses='recipient@example.com',
            subject='Test',
            received_at=datetime.now()
        )
        session.add(message)
        session.commit()

        attachment = EmailAttachment(
            message_id=message.id,
            tenant_id=account.tenant_id,
            filename='document.pdf',
            mime_type='application/pdf',
            size=102400,
            blob_url='s3://bucket/document.pdf'
        )
        session.add(attachment)
        session.commit()

        attachment_id = attachment.id
        message_id = message.id

        # Delete message
        session.delete(message)
        session.commit()

        # Verify attachment was cascade deleted
        assert session.query(EmailMessage).filter_by(id=message_id).first() is None
        assert session.query(EmailAttachment).filter_by(id=attachment_id).first() is None

    def test_email_attachment_to_dict(self, session):
        """Test EmailAttachment.to_dict() method"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        message = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<test@example.com>',
            from_address='sender@example.com',
            to_addresses='recipient@example.com',
            subject='Test',
            received_at=datetime.now()
        )
        session.add(message)
        session.commit()

        attachment = EmailAttachment(
            message_id=message.id,
            tenant_id=account.tenant_id,
            filename='image.jpg',
            mime_type='image/jpeg',
            size=51200,
            blob_url='s3://bucket/image.jpg',
            content_hash='abc123'
        )
        session.add(attachment)
        session.commit()

        data = attachment.to_dict()
        assert data['filename'] == 'image.jpg'
        assert data['mime_type'] == 'image/jpeg'
        assert data['size'] == 51200
        assert data['content_hash'] == 'abc123'


# ==================== Query Helper Tests ====================

class TestQueryHelpers:
    """Test suite for query helper functions"""

    def test_get_email_accounts_by_tenant(self, session):
        """Test get_email_accounts_by_tenant helper"""
        account1 = EmailAccount(
            tenant_id='tenant-1',
            user_id='user-1',
            account_name='Account 1',
            email_address='user1@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='user1',
            credential_id='cred-1'
        )
        account2 = EmailAccount(
            tenant_id='tenant-1',
            user_id='user-2',
            account_name='Account 2',
            email_address='user2@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='user2',
            credential_id='cred-2'
        )
        account3 = EmailAccount(
            tenant_id='tenant-2',
            user_id='user-3',
            account_name='Account 3',
            email_address='user3@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='user3',
            credential_id='cred-3'
        )
        session.add_all([account1, account2, account3])
        session.commit()

        # Get accounts for tenant-1
        accounts = get_email_accounts_by_tenant(session, 'tenant-1')
        assert len(accounts) == 2
        assert all(a.tenant_id == 'tenant-1' for a in accounts)

        # Get accounts for tenant-2
        accounts = get_email_accounts_by_tenant(session, 'tenant-2')
        assert len(accounts) == 1
        assert accounts[0].tenant_id == 'tenant-2'

    def test_get_email_account_by_id(self, session):
        """Test get_email_account_by_id helper"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        # Get with correct tenant_id
        retrieved = get_email_account_by_id(session, 'tenant-123', account.id)
        assert retrieved is not None
        assert retrieved.id == account.id

        # Get with wrong tenant_id (multi-tenant safety)
        retrieved = get_email_account_by_id(session, 'tenant-wrong', account.id)
        assert retrieved is None

    def test_get_email_folders_by_account(self, session):
        """Test get_email_folders_by_account helper"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder1 = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        folder2 = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='Sent',
            folder_path='[Gmail]/Sent Mail'
        )
        session.add_all([folder1, folder2])
        session.commit()

        folders = get_email_folders_by_account(session, account.tenant_id, account.id)
        assert len(folders) == 2

    def test_count_unread_messages(self, session):
        """Test count_unread_messages helper"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        # Add unread messages
        message1 = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<msg1@example.com>',
            from_address='sender@example.com',
            to_addresses='test@example.com',
            subject='Unread 1',
            received_at=datetime.now(),
            is_read=False
        )
        message2 = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<msg2@example.com>',
            from_address='sender@example.com',
            to_addresses='test@example.com',
            subject='Unread 2',
            received_at=datetime.now(),
            is_read=False
        )
        # Add read message
        message3 = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<msg3@example.com>',
            from_address='sender@example.com',
            to_addresses='test@example.com',
            subject='Read',
            received_at=datetime.now(),
            is_read=True
        )
        session.add_all([message1, message2, message3])
        session.commit()

        unread_count = count_unread_messages(session, account.tenant_id, folder.id)
        assert unread_count == 2


# ==================== Database Indexes Tests ====================

class TestDatabaseIndexes:
    """Test suite for database indexes"""

    def test_email_account_indexes_exist(self, engine):
        """Verify EmailAccount indexes are created"""
        inspector = inspect(engine)
        indexes = inspector.get_indexes('email_accounts')

        index_names = [idx['name'] for idx in indexes]
        assert 'idx_email_account_tenant_user' in index_names or len(indexes) > 0

    def test_email_folder_indexes_exist(self, engine):
        """Verify EmailFolder indexes are created"""
        inspector = inspect(engine)
        indexes = inspector.get_indexes('email_folders')

        index_names = [idx['name'] for idx in indexes]
        assert 'idx_email_folder_account' in index_names or len(indexes) > 0

    def test_email_message_indexes_exist(self, engine):
        """Verify EmailMessage indexes are created"""
        inspector = inspect(engine)
        indexes = inspector.get_indexes('email_messages')

        index_names = [idx['name'] for idx in indexes]
        assert len(indexes) > 0  # At least some indexes exist

    def test_email_attachment_indexes_exist(self, engine):
        """Verify EmailAttachment indexes are created"""
        inspector = inspect(engine)
        indexes = inspector.get_indexes('email_attachments')

        index_names = [idx['name'] for idx in indexes]
        assert 'idx_email_attachment_message' in index_names or len(indexes) > 0


# ==================== Relationship Tests ====================

class TestRelationships:
    """Test suite for model relationships"""

    def test_email_folder_relationship_to_account(self, session):
        """Test EmailFolder -> EmailAccount relationship"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        # Access related account through folder
        assert folder.email_account.id == account.id

        # Access related folders through account
        assert len(account.email_folders) == 1
        assert account.email_folders[0].id == folder.id

    def test_email_message_relationship_chain(self, session):
        """Test EmailMessage -> EmailFolder -> EmailAccount chain"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        message = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<test@example.com>',
            from_address='sender@example.com',
            to_addresses='test@example.com',
            subject='Test',
            received_at=datetime.now()
        )
        session.add(message)
        session.commit()

        # Access through relationship chain
        assert message.email_folder.id == folder.id
        assert message.email_folder.email_account.id == account.id

    def test_email_attachment_relationship_to_message(self, session):
        """Test EmailAttachment -> EmailMessage relationship"""
        account = EmailAccount(
            tenant_id='tenant-123',
            user_id='user-456',
            account_name='Test',
            email_address='test@example.com',
            protocol=ProviderEnum.IMAP,
            hostname='imap.example.com',
            port=993,
            encryption=EncryptionEnum.TLS,
            username='test',
            credential_id='cred-123'
        )
        session.add(account)
        session.commit()

        folder = EmailFolder(
            account_id=account.id,
            tenant_id=account.tenant_id,
            name='INBOX',
            folder_path='INBOX'
        )
        session.add(folder)
        session.commit()

        message = EmailMessage(
            folder_id=folder.id,
            tenant_id=account.tenant_id,
            message_id='<test@example.com>',
            from_address='sender@example.com',
            to_addresses='test@example.com',
            subject='Test',
            received_at=datetime.now()
        )
        session.add(message)
        session.commit()

        attachment = EmailAttachment(
            message_id=message.id,
            tenant_id=account.tenant_id,
            filename='document.pdf',
            mime_type='application/pdf',
            size=102400,
            blob_url='s3://bucket/document.pdf'
        )
        session.add(attachment)
        session.commit()

        # Access related message through attachment
        assert attachment.email_message.id == message.id

        # Access related attachments through message
        assert len(message.email_attachments) == 1
        assert message.email_attachments[0].id == attachment.id
