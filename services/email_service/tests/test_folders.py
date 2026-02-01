"""
Comprehensive test suite for Email Folders API - Phase 7

Tests all folder endpoints with full coverage:
- List folders with message counts
- Create folders
- Update folders (rename, counts, sync state)
- Delete folders (soft and hard delete)
- Get messages in folder
- Folder hierarchy operations
- Multi-tenant safety verification
- Error handling and validation
"""
import pytest
import json
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock
from flask import Flask
from src.models.folder import EmailFolder
from src.models.account import EmailAccount
from src.db import db
import uuid


@pytest.fixture
def app():
    """Create Flask app for testing"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JSON_SORT_KEYS'] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create Flask test client"""
    return app.test_client()


@pytest.fixture
def tenant_id():
    """Standard tenant ID for tests"""
    return str(uuid.uuid4())


@pytest.fixture
def user_id():
    """Standard user ID for tests"""
    return str(uuid.uuid4())


@pytest.fixture
def account_id():
    """Standard account ID for tests"""
    return str(uuid.uuid4())


@pytest.fixture
def test_account(app, tenant_id, user_id, account_id):
    """Create test email account"""
    with app.app_context():
        now = int(datetime.utcnow().timestamp() * 1000)
        account = EmailAccount(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id,
            account_name='Test Account',
            email_address='test@example.com',
            protocol='imap',
            hostname='imap.example.com',
            port=993,
            encryption='tls',
            username='testuser',
            credential_id='cred-123',
            is_sync_enabled=True,
            sync_interval=300,
            is_enabled=True,
            created_at=now,
            updated_at=now
        )
        db.session.add(account)
        db.session.commit()
        return account


@pytest.fixture
def test_folder(app, tenant_id, user_id, account_id):
    """Create test email folder"""
    with app.app_context():
        now = int(datetime.utcnow().timestamp() * 1000)
        folder = EmailFolder(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            user_id=user_id,
            account_id=account_id,
            folder_name='INBOX',
            display_name='Inbox',
            parent_folder_id=None,
            folder_type='inbox',
            imap_name='INBOX',
            is_system_folder=True,
            unread_count=5,
            total_count=42,
            is_selectable=True,
            has_children=False,
            is_visible=True,
            created_at=now,
            updated_at=now
        )
        db.session.add(folder)
        db.session.commit()
        return folder


# ============================================================================
# LIST FOLDERS TESTS
# ============================================================================

class TestListFolders:
    """Test GET /api/accounts/:id/folders"""

    def test_list_folders_success(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test successfully listing folders"""
        response = client.get(
            f'/api/accounts/{account_id}/folders',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'folders' in data
        assert 'count' in data
        assert data['count'] == 1
        assert data['folders'][0]['folderName'] == 'INBOX'
        assert data['folders'][0]['unreadCount'] == 5
        assert data['folders'][0]['totalCount'] == 42

    def test_list_folders_missing_tenant_id(self, client, account_id, user_id):
        """Test missing tenant_id parameter"""
        response = client.get(
            f'/api/accounts/{account_id}/folders',
            query_string={'user_id': user_id}
        )

        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['error'] == 'Unauthorized'

    def test_list_folders_missing_user_id(self, client, account_id, tenant_id):
        """Test missing user_id parameter"""
        response = client.get(
            f'/api/accounts/{account_id}/folders',
            query_string={'tenant_id': tenant_id}
        )

        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['error'] == 'Unauthorized'

    def test_list_folders_account_not_found(self, client, tenant_id, user_id):
        """Test listing folders for non-existent account"""
        response = client.get(
            f'/api/accounts/nonexistent-account/folders',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error'] == 'Not found'

    def test_list_folders_multi_tenant_isolation(self, client, app, test_account, test_folder, account_id):
        """Test that folders from different tenants are isolated"""
        different_tenant = str(uuid.uuid4())
        different_user = str(uuid.uuid4())

        response = client.get(
            f'/api/accounts/{account_id}/folders',
            query_string={
                'tenant_id': different_tenant,
                'user_id': different_user
            }
        )

        assert response.status_code == 404

    def test_list_folders_with_parent_filter(self, client, app, tenant_id, user_id, account_id):
        """Test listing folders filtered by parent"""
        with app.app_context():
            parent_id = str(uuid.uuid4())
            now = int(datetime.utcnow().timestamp() * 1000)

            # Create parent folder
            parent = EmailFolder(
                id=parent_id,
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Parent',
                display_name='Parent Folder',
                parent_folder_id=None,
                folder_type='custom',
                imap_name='Parent',
                is_system_folder=False,
                unread_count=0,
                total_count=0,
                created_at=now,
                updated_at=now
            )
            db.session.add(parent)

            # Create child folder
            child = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Child',
                display_name='Child Folder',
                parent_folder_id=parent_id,
                folder_type='custom',
                imap_name='Parent/Child',
                is_system_folder=False,
                unread_count=0,
                total_count=0,
                created_at=now,
                updated_at=now
            )
            db.session.add(child)
            db.session.commit()

        response = client.get(
            f'/api/accounts/{account_id}/folders',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id,
                'parent_id': parent_id
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['count'] == 1
        assert data['folders'][0]['folderName'] == 'Child'


# ============================================================================
# CREATE FOLDER TESTS
# ============================================================================

class TestCreateFolder:
    """Test POST /api/accounts/:id/folders"""

    def test_create_folder_success(self, client, test_account, tenant_id, user_id, account_id):
        """Test successfully creating a folder"""
        response = client.post(
            f'/api/accounts/{account_id}/folders',
            data=json.dumps({
                'folderName': 'Projects',
                'displayName': 'My Projects',
                'folderType': 'custom'
            }),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['folderName'] == 'Projects'
        assert data['displayName'] == 'My Projects'
        assert data['folderType'] == 'custom'
        assert data['isSystemFolder'] is False

    def test_create_folder_missing_headers(self, client, account_id):
        """Test creating folder without auth headers"""
        response = client.post(
            f'/api/accounts/{account_id}/folders',
            data=json.dumps({'folderName': 'Projects'}),
            headers={'Content-Type': 'application/json'}
        )

        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['error'] == 'Unauthorized'

    def test_create_folder_missing_folder_name(self, client, test_account, tenant_id, user_id, account_id):
        """Test creating folder without folder name"""
        response = client.post(
            f'/api/accounts/{account_id}/folders',
            data=json.dumps({'displayName': 'My Projects'}),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error'] == 'Invalid request'
        assert 'Missing required fields' in data['message']

    def test_create_folder_empty_name(self, client, test_account, tenant_id, user_id, account_id):
        """Test creating folder with empty name"""
        response = client.post(
            f'/api/accounts/{account_id}/folders',
            data=json.dumps({'folderName': ''}),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'non-empty string' in data['message']

    def test_create_folder_name_too_long(self, client, test_account, tenant_id, user_id, account_id):
        """Test creating folder with name exceeding length limit"""
        response = client.post(
            f'/api/accounts/{account_id}/folders',
            data=json.dumps({'folderName': 'x' * 300}),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert '255 characters' in data['message']

    def test_create_folder_invalid_type(self, client, test_account, tenant_id, user_id, account_id):
        """Test creating folder with invalid type"""
        response = client.post(
            f'/api/accounts/{account_id}/folders',
            data=json.dumps({
                'folderName': 'Projects',
                'folderType': 'invalid_type'
            }),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'Invalid folder type' in data['message']

    def test_create_folder_duplicate_name(self, client, test_account, tenant_id, user_id, account_id):
        """Test creating folder with duplicate name"""
        first_response = client.post(
            f'/api/accounts/{account_id}/folders',
            data=json.dumps({'folderName': 'Projects'}),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert first_response.status_code == 201

        # Try to create another with same name
        second_response = client.post(
            f'/api/accounts/{account_id}/folders',
            data=json.dumps({'folderName': 'Projects'}),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert second_response.status_code == 409
        data = json.loads(second_response.data)
        assert 'already exists' in data['message']

    def test_create_folder_nonexistent_account(self, client, tenant_id, user_id):
        """Test creating folder for non-existent account"""
        response = client.post(
            f'/api/accounts/nonexistent-account/folders',
            data=json.dumps({'folderName': 'Projects'}),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error'] == 'Not found'


# ============================================================================
# UPDATE FOLDER TESTS
# ============================================================================

class TestUpdateFolder:
    """Test PUT /api/accounts/:id/folders/:folderId"""

    def test_update_folder_display_name(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test updating folder display name"""
        response = client.put(
            f'/api/accounts/{account_id}/folders/{test_folder.id}',
            data=json.dumps({'displayName': 'My Inbox'}),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['displayName'] == 'My Inbox'

    def test_update_folder_message_counts(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test updating message counts"""
        response = client.put(
            f'/api/accounts/{account_id}/folders/{test_folder.id}',
            data=json.dumps({
                'unreadCount': 10,
                'totalCount': 50
            }),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['unreadCount'] == 10
        assert data['totalCount'] == 50

    def test_update_folder_sync_state(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test updating folder sync state"""
        response = client.put(
            f'/api/accounts/{account_id}/folders/{test_folder.id}',
            data=json.dumps({
                'syncStateUidvalidity': '123456789',
                'syncStateUidnext': 1000
            }),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        # Verify sync state was stored
        assert 'id' in data

    def test_update_folder_invalid_unread_count(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test updating with invalid unread count"""
        response = client.put(
            f'/api/accounts/{account_id}/folders/{test_folder.id}',
            data=json.dumps({'unreadCount': -5}),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'cannot be negative' in data['message']

    def test_update_system_folder_display_name(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test that system folder display name cannot be changed"""
        # test_folder is a system folder (inbox)
        response = client.put(
            f'/api/accounts/{account_id}/folders/{test_folder.id}',
            data=json.dumps({'displayName': 'Changed Inbox'}),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 403
        data = json.loads(response.data)
        assert 'Cannot rename system folders' in data['message']

    def test_update_nonexistent_folder(self, client, test_account, tenant_id, user_id, account_id):
        """Test updating non-existent folder"""
        response = client.put(
            f'/api/accounts/{account_id}/folders/nonexistent',
            data=json.dumps({'displayName': 'Updated'}),
            headers={
                'X-Tenant-ID': tenant_id,
                'X-User-ID': user_id,
                'Content-Type': 'application/json'
            }
        )

        assert response.status_code == 404

    def test_update_folder_missing_headers(self, client, test_folder, account_id):
        """Test updating folder without auth headers"""
        response = client.put(
            f'/api/accounts/{account_id}/folders/{test_folder.id}',
            data=json.dumps({'displayName': 'Updated'}),
            headers={'Content-Type': 'application/json'}
        )

        assert response.status_code == 401


# ============================================================================
# DELETE FOLDER TESTS
# ============================================================================

class TestDeleteFolder:
    """Test DELETE /api/accounts/:id/folders/:folderId"""

    def test_delete_folder_soft_delete(self, client, app, test_account, tenant_id, user_id, account_id):
        """Test soft deleting a folder"""
        # Create a custom (non-system) folder
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)
            folder = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Projects',
                display_name='My Projects',
                parent_folder_id=None,
                folder_type='custom',
                imap_name='Projects',
                is_system_folder=False,
                unread_count=0,
                total_count=0,
                is_visible=True,
                created_at=now,
                updated_at=now
            )
            db.session.add(folder)
            db.session.commit()
            folder_id = folder.id

        response = client.delete(
            f'/api/accounts/{account_id}/folders/{folder_id}',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Folder deleted successfully'
        assert data['hardDeleted'] is False

    def test_delete_folder_hard_delete(self, client, app, test_account, tenant_id, user_id, account_id):
        """Test hard deleting a folder"""
        # Create a custom folder
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)
            folder = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Projects',
                display_name='My Projects',
                parent_folder_id=None,
                folder_type='custom',
                imap_name='Projects',
                is_system_folder=False,
                unread_count=0,
                total_count=0,
                is_visible=True,
                created_at=now,
                updated_at=now
            )
            db.session.add(folder)
            db.session.commit()
            folder_id = folder.id

        response = client.delete(
            f'/api/accounts/{account_id}/folders/{folder_id}',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id,
                'hard_delete': 'true'
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['hardDeleted'] is True

    def test_delete_system_folder(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test that system folders cannot be deleted"""
        # test_folder is a system folder (inbox)
        response = client.delete(
            f'/api/accounts/{account_id}/folders/{test_folder.id}',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 403
        data = json.loads(response.data)
        assert 'Cannot delete system folders' in data['message']

    def test_delete_nonexistent_folder(self, client, test_account, tenant_id, user_id, account_id):
        """Test deleting non-existent folder"""
        response = client.delete(
            f'/api/accounts/{account_id}/folders/nonexistent',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 404

    def test_delete_folder_missing_credentials(self, client, test_folder, account_id):
        """Test deleting folder without tenant_id"""
        response = client.delete(
            f'/api/accounts/{account_id}/folders/{test_folder.id}',
            query_string={'user_id': 'user123'}
        )

        assert response.status_code == 401


# ============================================================================
# GET FOLDER DETAILS TESTS
# ============================================================================

class TestGetFolder:
    """Test GET /api/accounts/:id/folders/:folderId"""

    def test_get_folder_success(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test successfully getting folder details"""
        response = client.get(
            f'/api/accounts/{account_id}/folders/{test_folder.id}',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == test_folder.id
        assert data['folderName'] == 'INBOX'
        assert data['unreadCount'] == 5
        assert data['totalCount'] == 42

    def test_get_folder_nonexistent(self, client, tenant_id, user_id, account_id):
        """Test getting non-existent folder"""
        response = client.get(
            f'/api/accounts/{account_id}/folders/nonexistent',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 404

    def test_get_folder_wrong_account(self, client, app, test_account, tenant_id, user_id):
        """Test getting folder from wrong account"""
        # Create folder for different account
        different_account_id = str(uuid.uuid4())
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)
            folder = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=different_account_id,
                folder_name='INBOX',
                display_name='Inbox',
                folder_type='inbox',
                imap_name='INBOX',
                is_system_folder=True,
                created_at=now,
                updated_at=now
            )
            db.session.add(folder)
            db.session.commit()
            folder_id = folder.id

        response = client.get(
            f'/api/accounts/{test_account.id}/folders/{folder_id}',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 404


# ============================================================================
# FOLDER MESSAGES TESTS
# ============================================================================

class TestFolderMessages:
    """Test GET /api/accounts/:id/folders/:folderId/messages"""

    def test_list_folder_messages_success(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test listing messages in a folder"""
        response = client.get(
            f'/api/accounts/{account_id}/folders/{test_folder.id}/messages',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'messages' in data
        assert 'count' in data
        assert 'total' in data
        assert data['total'] == test_folder.total_count

    def test_list_folder_messages_with_pagination(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test message listing with pagination"""
        response = client.get(
            f'/api/accounts/{account_id}/folders/{test_folder.id}/messages',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id,
                'limit': 10,
                'offset': 5
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['limit'] == 10
        assert data['offset'] == 5

    def test_list_folder_messages_invalid_limit(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test with invalid limit"""
        response = client.get(
            f'/api/accounts/{account_id}/folders/{test_folder.id}/messages',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id,
                'limit': 1000
            }
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'between 1 and 500' in data['message']

    def test_list_folder_messages_negative_offset(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test with negative offset"""
        response = client.get(
            f'/api/accounts/{account_id}/folders/{test_folder.id}/messages',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id,
                'offset': -1
            }
        )

        assert response.status_code == 400


# ============================================================================
# FOLDER HIERARCHY TESTS
# ============================================================================

class TestFolderHierarchy:
    """Test GET /api/accounts/:id/folders/:folderId/hierarchy"""

    def test_get_folder_hierarchy_flat(self, client, test_account, test_folder, tenant_id, user_id, account_id):
        """Test getting hierarchy for folder without children"""
        response = client.get(
            f'/api/accounts/{account_id}/folders/{test_folder.id}/hierarchy',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'folder' in data
        assert 'parentPath' in data
        assert 'children' in data
        assert len(data['parentPath']) == 0
        assert len(data['children']) == 0

    def test_get_folder_hierarchy_with_children(self, client, app, test_account, tenant_id, user_id, account_id):
        """Test getting hierarchy for folder with children"""
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)

            # Create parent folder
            parent = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Parent',
                display_name='Parent Folder',
                parent_folder_id=None,
                folder_type='custom',
                imap_name='Parent',
                is_system_folder=False,
                created_at=now,
                updated_at=now,
                has_children=True
            )
            db.session.add(parent)

            # Create child folders
            for i in range(2):
                child = EmailFolder(
                    id=str(uuid.uuid4()),
                    tenant_id=tenant_id,
                    user_id=user_id,
                    account_id=account_id,
                    folder_name=f'Child{i}',
                    display_name=f'Child Folder {i}',
                    parent_folder_id=parent.id,
                    folder_type='custom',
                    imap_name=f'Parent/Child{i}',
                    is_system_folder=False,
                    created_at=now,
                    updated_at=now
                )
                db.session.add(child)

            db.session.commit()
            parent_id = parent.id

        response = client.get(
            f'/api/accounts/{account_id}/folders/{parent_id}/hierarchy',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['children']) == 2

    def test_get_folder_hierarchy_nonexistent(self, client, tenant_id, user_id, account_id):
        """Test getting hierarchy for non-existent folder"""
        response = client.get(
            f'/api/accounts/{account_id}/folders/nonexistent/hierarchy',
            query_string={
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        )

        assert response.status_code == 404


# ============================================================================
# FOLDER MODEL TESTS
# ============================================================================

class TestFolderModel:
    """Test EmailFolder model methods"""

    def test_folder_to_dict(self, app, tenant_id, user_id, account_id):
        """Test converting folder to dictionary"""
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)
            folder = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Test',
                display_name='Test Folder',
                parent_folder_id=None,
                folder_type='custom',
                imap_name='Test',
                is_system_folder=False,
                unread_count=5,
                total_count=10,
                created_at=now,
                updated_at=now
            )

            dict_repr = folder.to_dict()
            assert dict_repr['folderName'] == 'Test'
            assert dict_repr['unreadCount'] == 5
            assert dict_repr['totalCount'] == 10

    def test_folder_increment_count(self, app, tenant_id, user_id, account_id):
        """Test incrementing message counts"""
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)
            folder = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Test',
                display_name='Test Folder',
                folder_type='custom',
                imap_name='Test',
                is_system_folder=False,
                unread_count=0,
                total_count=0,
                created_at=now,
                updated_at=now
            )
            db.session.add(folder)
            db.session.commit()

            folder.increment_message_count(is_unread=True)

            assert folder.unread_count == 1
            assert folder.total_count == 1

    def test_folder_decrement_count(self, app, tenant_id, user_id, account_id):
        """Test decrementing message counts"""
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)
            folder = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Test',
                display_name='Test Folder',
                folder_type='custom',
                imap_name='Test',
                is_system_folder=False,
                unread_count=5,
                total_count=10,
                created_at=now,
                updated_at=now
            )
            db.session.add(folder)
            db.session.commit()

            folder.decrement_message_count(is_unread=True)

            assert folder.unread_count == 4
            assert folder.total_count == 9

    def test_folder_get_child_folders(self, app, tenant_id, user_id, account_id):
        """Test retrieving child folders"""
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)

            parent = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Parent',
                display_name='Parent',
                folder_type='custom',
                imap_name='Parent',
                is_system_folder=False,
                created_at=now,
                updated_at=now,
                has_children=True
            )
            db.session.add(parent)
            db.session.flush()

            for i in range(3):
                child = EmailFolder(
                    id=str(uuid.uuid4()),
                    tenant_id=tenant_id,
                    user_id=user_id,
                    account_id=account_id,
                    folder_name=f'Child{i}',
                    display_name=f'Child {i}',
                    parent_folder_id=parent.id,
                    folder_type='custom',
                    imap_name=f'Parent/Child{i}',
                    is_system_folder=False,
                    created_at=now,
                    updated_at=now
                )
                db.session.add(child)

            db.session.commit()

            children = parent.get_child_folders()
            assert len(children) == 3

    def test_folder_get_hierarchy_path(self, app, tenant_id, user_id, account_id):
        """Test getting full hierarchy path"""
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)

            root = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Root',
                display_name='Root',
                folder_type='custom',
                imap_name='Root',
                is_system_folder=False,
                created_at=now,
                updated_at=now
            )
            db.session.add(root)
            db.session.flush()

            middle = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Middle',
                display_name='Middle',
                parent_folder_id=root.id,
                folder_type='custom',
                imap_name='Root/Middle',
                is_system_folder=False,
                created_at=now,
                updated_at=now
            )
            db.session.add(middle)
            db.session.flush()

            leaf = EmailFolder(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                user_id=user_id,
                account_id=account_id,
                folder_name='Leaf',
                display_name='Leaf',
                parent_folder_id=middle.id,
                folder_type='custom',
                imap_name='Root/Middle/Leaf',
                is_system_folder=False,
                created_at=now,
                updated_at=now
            )
            db.session.add(leaf)
            db.session.commit()

            path = leaf.get_hierarchy_path()
            assert len(path) == 3
            assert path[0].id == root.id
            assert path[1].id == middle.id
            assert path[2].id == leaf.id
