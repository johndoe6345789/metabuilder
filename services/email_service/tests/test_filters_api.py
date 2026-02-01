"""
Test Suite for Email Filters and Labels API - Phase 7
Comprehensive tests for filter and label management endpoints:
- POST /api/v1/accounts/:id/filters - Create filter rule
- GET /api/v1/accounts/:id/filters - List filters
- PUT /api/v1/accounts/:id/filters/:id - Update filter
- DELETE /api/v1/accounts/:id/filters/:id - Delete filter
- POST /api/v1/accounts/:id/labels - Create label
- GET /api/v1/accounts/:id/labels - List labels
- PUT /api/v1/accounts/:id/labels/:id - Update label
- DELETE /api/v1/accounts/:id/labels/:id - Delete label
- POST /api/v1/accounts/:id/filters/:id/execute - Execute filter

Tests cover:
- Happy path scenarios
- Input validation
- Error handling
- Multi-tenant safety
- Filter matching and execution
- Label management
"""
import pytest
import json
import uuid
from datetime import datetime


# ============================================================================
# FILTER CREATION TESTS
# ============================================================================

class TestCreateFilter:
    """Tests for POST /api/v1/accounts/{id}/filters endpoint"""

    def test_create_filter_success(self, client, auth_headers, created_account):
        """Test successful filter creation"""
        account_id = created_account['id']
        filter_data = {
            'name': 'Work Emails',
            'description': 'Filter for work emails',
            'criteria': {
                'from': '@company.com'
            },
            'actions': {
                'move_to_folder': 'folder-id-1',
                'apply_labels': ['label-id-1']
            },
            'order': 0,
            'isEnabled': True,
            'applyToNew': True,
            'applyToExisting': False
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['id'] is not None
        assert data['name'] == 'Work Emails'
        assert data['description'] == 'Filter for work emails'
        assert data['criteria']['from'] == '@company.com'
        assert data['actions']['move_to_folder'] == 'folder-id-1'
        assert data['order'] == 0
        assert data['isEnabled'] is True
        assert data['applyToNew'] is True
        assert data['applyToExisting'] is False
        assert data['createdAt'] is not None
        assert data['updatedAt'] is not None

    def test_create_filter_with_multiple_criteria(self, client, auth_headers, created_account):
        """Test filter creation with multiple criteria"""
        account_id = created_account['id']
        filter_data = {
            'name': 'Important Work',
            'criteria': {
                'from': '@company.com',
                'subject': 'urgent',
                'contains': 'important'
            },
            'actions': {
                'mark_read': False,
                'apply_labels': ['label-id-1', 'label-id-2']
            }
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['criteria']['from'] == '@company.com'
        assert data['criteria']['subject'] == 'urgent'
        assert data['criteria']['contains'] == 'important'

    def test_create_filter_with_date_range(self, client, auth_headers, created_account):
        """Test filter creation with date range criteria"""
        account_id = created_account['id']
        start_time = int(datetime.utcnow().timestamp() * 1000)
        end_time = start_time + (30 * 24 * 60 * 60 * 1000)  # 30 days later

        filter_data = {
            'name': 'Recent Emails',
            'criteria': {
                'date_range': {
                    'start': start_time,
                    'end': end_time
                }
            },
            'actions': {
                'mark_read': True
            }
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['criteria']['date_range']['start'] == start_time
        assert data['criteria']['date_range']['end'] == end_time

    def test_create_filter_with_delete_action(self, client, auth_headers, created_account):
        """Test filter creation with delete action"""
        account_id = created_account['id']
        filter_data = {
            'name': 'Delete Spam',
            'criteria': {
                'subject': 'spam'
            },
            'actions': {
                'delete': True
            }
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['actions']['delete'] is True

    def test_create_filter_missing_name(self, client, auth_headers, created_account):
        """Test filter creation fails without name"""
        account_id = created_account['id']
        filter_data = {
            'criteria': {'from': '@company.com'},
            'actions': {'mark_read': True}
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Missing required fields' in data['message']

    def test_create_filter_missing_criteria(self, client, auth_headers, created_account):
        """Test filter creation fails without criteria"""
        account_id = created_account['id']
        filter_data = {
            'name': 'Test Filter',
            'actions': {'mark_read': True}
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Missing required fields' in data['message']

    def test_create_filter_missing_actions(self, client, auth_headers, created_account):
        """Test filter creation fails without actions"""
        account_id = created_account['id']
        filter_data = {
            'name': 'Test Filter',
            'criteria': {'from': '@company.com'}
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Missing required fields' in data['message']

    def test_create_filter_empty_criteria(self, client, auth_headers, created_account):
        """Test filter creation fails with empty criteria"""
        account_id = created_account['id']
        filter_data = {
            'name': 'Test Filter',
            'criteria': {},
            'actions': {'mark_read': True}
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'At least one criteria' in data['message']

    def test_create_filter_empty_actions(self, client, auth_headers, created_account):
        """Test filter creation fails with empty actions"""
        account_id = created_account['id']
        filter_data = {
            'name': 'Test Filter',
            'criteria': {'from': '@company.com'},
            'actions': {}
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'At least one action' in data['message']

    def test_create_filter_invalid_order(self, client, auth_headers, created_account):
        """Test filter creation with invalid order"""
        account_id = created_account['id']
        filter_data = {
            'name': 'Test Filter',
            'criteria': {'from': '@company.com'},
            'actions': {'mark_read': True},
            'order': 'invalid'
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Order must be a valid integer' in data['message']

    def test_create_filter_account_not_found(self, client, auth_headers):
        """Test filter creation fails with non-existent account"""
        fake_account_id = str(uuid.uuid4())
        filter_data = {
            'name': 'Test Filter',
            'criteria': {'from': '@company.com'},
            'actions': {'mark_read': True}
        }

        response = client.post(
            f'/api/v1/accounts/{fake_account_id}/filters',
            json=filter_data,
            headers=auth_headers
        )

        assert response.status_code == 404
        data = response.get_json()
        assert 'Account not found' in data['message']

    def test_create_filter_no_auth_headers(self, client, created_account):
        """Test filter creation fails without auth headers"""
        account_id = created_account['id']
        filter_data = {
            'name': 'Test Filter',
            'criteria': {'from': '@company.com'},
            'actions': {'mark_read': True}
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json=filter_data,
            headers={'Content-Type': 'application/json'}
        )

        assert response.status_code == 401


# ============================================================================
# FILTER LIST AND GET TESTS
# ============================================================================

class TestListFilters:
    """Tests for GET /api/v1/accounts/{id}/filters endpoint"""

    def test_list_filters_empty(self, client, auth_headers, created_account):
        """Test listing filters when none exist"""
        account_id = created_account['id']

        response = client.get(
            f'/api/v1/accounts/{account_id}/filters',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['filters'] == []
        assert data['total'] == 0

    def test_list_filters_multiple(self, client, auth_headers, created_account):
        """Test listing multiple filters"""
        account_id = created_account['id']

        # Create multiple filters
        for i in range(3):
            filter_data = {
                'name': f'Filter {i}',
                'criteria': {'from': f'user{i}@example.com'},
                'actions': {'mark_read': True},
                'order': i
            }
            client.post(
                f'/api/v1/accounts/{account_id}/filters',
                json=filter_data,
                headers=auth_headers
            )

        response = client.get(
            f'/api/v1/accounts/{account_id}/filters',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['filters']) == 3
        assert data['total'] == 3
        # Verify order
        assert data['filters'][0]['order'] == 0
        assert data['filters'][1]['order'] == 1
        assert data['filters'][2]['order'] == 2

    def test_list_filters_enabled_only(self, client, auth_headers, created_account):
        """Test listing only enabled filters"""
        account_id = created_account['id']

        # Create enabled filter
        client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json={
                'name': 'Enabled Filter',
                'criteria': {'from': '@company.com'},
                'actions': {'mark_read': True},
                'isEnabled': True
            },
            headers=auth_headers
        )

        # Create disabled filter
        client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json={
                'name': 'Disabled Filter',
                'criteria': {'from': '@example.com'},
                'actions': {'mark_read': True},
                'isEnabled': False
            },
            headers=auth_headers
        )

        response = client.get(
            f'/api/v1/accounts/{account_id}/filters?enabled=true',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['filters']) == 1
        assert data['filters'][0]['name'] == 'Enabled Filter'

    def test_list_filters_account_not_found(self, client, auth_headers):
        """Test listing filters for non-existent account"""
        fake_account_id = str(uuid.uuid4())

        response = client.get(
            f'/api/v1/accounts/{fake_account_id}/filters',
            headers=auth_headers
        )

        assert response.status_code == 404


class TestGetFilter:
    """Tests for GET /api/v1/accounts/{id}/filters/{filter_id} endpoint"""

    def test_get_filter_success(self, client, auth_headers, created_account):
        """Test getting a specific filter"""
        account_id = created_account['id']

        # Create filter
        create_response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json={
                'name': 'Test Filter',
                'criteria': {'from': '@company.com'},
                'actions': {'mark_read': True}
            },
            headers=auth_headers
        )
        filter_id = create_response.get_json()['id']

        # Get filter
        response = client.get(
            f'/api/v1/accounts/{account_id}/filters/{filter_id}',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == filter_id
        assert data['name'] == 'Test Filter'

    def test_get_filter_not_found(self, client, auth_headers, created_account):
        """Test getting non-existent filter"""
        account_id = created_account['id']
        fake_filter_id = str(uuid.uuid4())

        response = client.get(
            f'/api/v1/accounts/{account_id}/filters/{fake_filter_id}',
            headers=auth_headers
        )

        assert response.status_code == 404


# ============================================================================
# FILTER UPDATE AND DELETE TESTS
# ============================================================================

class TestUpdateFilter:
    """Tests for PUT /api/v1/accounts/{id}/filters/{filter_id} endpoint"""

    def test_update_filter_success(self, client, auth_headers, created_account):
        """Test successful filter update"""
        account_id = created_account['id']

        # Create filter
        create_response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json={
                'name': 'Original Name',
                'criteria': {'from': '@company.com'},
                'actions': {'mark_read': True},
                'isEnabled': True
            },
            headers=auth_headers
        )
        filter_id = create_response.get_json()['id']

        # Update filter
        response = client.put(
            f'/api/v1/accounts/{account_id}/filters/{filter_id}',
            json={
                'name': 'Updated Name',
                'isEnabled': False,
                'order': 1
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == 'Updated Name'
        assert data['isEnabled'] is False
        assert data['order'] == 1

    def test_update_filter_criteria(self, client, auth_headers, created_account):
        """Test updating filter criteria"""
        account_id = created_account['id']

        # Create filter
        create_response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json={
                'name': 'Test Filter',
                'criteria': {'from': '@company.com'},
                'actions': {'mark_read': True}
            },
            headers=auth_headers
        )
        filter_id = create_response.get_json()['id']

        # Update criteria
        response = client.put(
            f'/api/v1/accounts/{account_id}/filters/{filter_id}',
            json={
                'criteria': {
                    'from': '@company.com',
                    'subject': 'urgent'
                }
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['criteria']['from'] == '@company.com'
        assert data['criteria']['subject'] == 'urgent'

    def test_update_filter_not_found(self, client, auth_headers, created_account):
        """Test updating non-existent filter"""
        account_id = created_account['id']
        fake_filter_id = str(uuid.uuid4())

        response = client.put(
            f'/api/v1/accounts/{account_id}/filters/{fake_filter_id}',
            json={'name': 'Updated Name'},
            headers=auth_headers
        )

        assert response.status_code == 404


class TestDeleteFilter:
    """Tests for DELETE /api/v1/accounts/{id}/filters/{filter_id} endpoint"""

    def test_delete_filter_success(self, client, auth_headers, created_account):
        """Test successful filter deletion"""
        account_id = created_account['id']

        # Create filter
        create_response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json={
                'name': 'Test Filter',
                'criteria': {'from': '@company.com'},
                'actions': {'mark_read': True}
            },
            headers=auth_headers
        )
        filter_id = create_response.get_json()['id']

        # Delete filter
        response = client.delete(
            f'/api/v1/accounts/{account_id}/filters/{filter_id}',
            headers=auth_headers
        )

        assert response.status_code == 204

        # Verify deletion
        get_response = client.get(
            f'/api/v1/accounts/{account_id}/filters/{filter_id}',
            headers=auth_headers
        )
        assert get_response.status_code == 404

    def test_delete_filter_not_found(self, client, auth_headers, created_account):
        """Test deleting non-existent filter"""
        account_id = created_account['id']
        fake_filter_id = str(uuid.uuid4())

        response = client.delete(
            f'/api/v1/accounts/{account_id}/filters/{fake_filter_id}',
            headers=auth_headers
        )

        assert response.status_code == 404


# ============================================================================
# FILTER EXECUTION TESTS
# ============================================================================

class TestExecuteFilter:
    """Tests for POST /api/v1/accounts/{id}/filters/{filter_id}/execute endpoint"""

    def test_execute_filter_dry_run(self, client, auth_headers, created_account):
        """Test executing filter in dry-run mode"""
        account_id = created_account['id']

        # Create filter
        create_response = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json={
                'name': 'Test Filter',
                'criteria': {'from': '@company.com'},
                'actions': {'mark_read': True}
            },
            headers=auth_headers
        )
        filter_id = create_response.get_json()['id']

        # Execute filter in dry-run
        response = client.post(
            f'/api/v1/accounts/{account_id}/filters/{filter_id}/execute',
            json={'dryRun': True},
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['filterId'] == filter_id
        assert data['dryRun'] is True
        assert 'matchedCount' in data
        assert 'appliedCount' in data

    def test_execute_filter_not_found(self, client, auth_headers, created_account):
        """Test executing non-existent filter"""
        account_id = created_account['id']
        fake_filter_id = str(uuid.uuid4())

        response = client.post(
            f'/api/v1/accounts/{account_id}/filters/{fake_filter_id}/execute',
            json={},
            headers=auth_headers
        )

        assert response.status_code == 404


# ============================================================================
# LABEL CREATION TESTS
# ============================================================================

class TestCreateLabel:
    """Tests for POST /api/v1/accounts/{id}/labels endpoint"""

    def test_create_label_success(self, client, auth_headers, created_account):
        """Test successful label creation"""
        account_id = created_account['id']
        label_data = {
            'name': 'Important',
            'color': '#FF0000',
            'description': 'Important emails',
            'order': 0
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json=label_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['id'] is not None
        assert data['name'] == 'Important'
        assert data['color'] == '#FF0000'
        assert data['description'] == 'Important emails'
        assert data['order'] == 0
        assert data['createdAt'] is not None
        assert data['updatedAt'] is not None

    def test_create_label_with_default_color(self, client, auth_headers, created_account):
        """Test label creation with default color"""
        account_id = created_account['id']
        label_data = {
            'name': 'Default Color Label'
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json=label_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['color'] == '#4285F4'  # Default color

    def test_create_label_missing_name(self, client, auth_headers, created_account):
        """Test label creation fails without name"""
        account_id = created_account['id']
        label_data = {
            'color': '#FF0000'
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json=label_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Missing required fields' in data['message']

    def test_create_label_invalid_color(self, client, auth_headers, created_account):
        """Test label creation with invalid color format"""
        account_id = created_account['id']
        label_data = {
            'name': 'Invalid Color',
            'color': 'red'  # Not hex format
        }

        response = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json=label_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'hex color code' in data['message']

    def test_create_label_duplicate_name(self, client, auth_headers, created_account):
        """Test label creation fails with duplicate name"""
        account_id = created_account['id']

        # Create first label
        client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json={'name': 'Important'},
            headers=auth_headers
        )

        # Try to create duplicate
        response = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json={'name': 'Important'},
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'already exists' in data['message']

    def test_create_label_account_not_found(self, client, auth_headers):
        """Test label creation fails with non-existent account"""
        fake_account_id = str(uuid.uuid4())
        label_data = {
            'name': 'Important'
        }

        response = client.post(
            f'/api/v1/accounts/{fake_account_id}/labels',
            json=label_data,
            headers=auth_headers
        )

        assert response.status_code == 404


# ============================================================================
# LABEL LIST AND GET TESTS
# ============================================================================

class TestListLabels:
    """Tests for GET /api/v1/accounts/{id}/labels endpoint"""

    def test_list_labels_empty(self, client, auth_headers, created_account):
        """Test listing labels when none exist"""
        account_id = created_account['id']

        response = client.get(
            f'/api/v1/accounts/{account_id}/labels',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['labels'] == []
        assert data['total'] == 0

    def test_list_labels_multiple(self, client, auth_headers, created_account):
        """Test listing multiple labels"""
        account_id = created_account['id']

        # Create multiple labels
        for i in range(3):
            label_data = {
                'name': f'Label {i}',
                'color': f'#FF000{i}',
                'order': i
            }
            client.post(
                f'/api/v1/accounts/{account_id}/labels',
                json=label_data,
                headers=auth_headers
            )

        response = client.get(
            f'/api/v1/accounts/{account_id}/labels',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['labels']) == 3
        assert data['total'] == 3


class TestGetLabel:
    """Tests for GET /api/v1/accounts/{id}/labels/{label_id} endpoint"""

    def test_get_label_success(self, client, auth_headers, created_account):
        """Test getting a specific label"""
        account_id = created_account['id']

        # Create label
        create_response = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json={'name': 'Test Label', 'color': '#FF0000'},
            headers=auth_headers
        )
        label_id = create_response.get_json()['id']

        # Get label
        response = client.get(
            f'/api/v1/accounts/{account_id}/labels/{label_id}',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == label_id
        assert data['name'] == 'Test Label'

    def test_get_label_not_found(self, client, auth_headers, created_account):
        """Test getting non-existent label"""
        account_id = created_account['id']
        fake_label_id = str(uuid.uuid4())

        response = client.get(
            f'/api/v1/accounts/{account_id}/labels/{fake_label_id}',
            headers=auth_headers
        )

        assert response.status_code == 404


# ============================================================================
# LABEL UPDATE AND DELETE TESTS
# ============================================================================

class TestUpdateLabel:
    """Tests for PUT /api/v1/accounts/{id}/labels/{label_id} endpoint"""

    def test_update_label_success(self, client, auth_headers, created_account):
        """Test successful label update"""
        account_id = created_account['id']

        # Create label
        create_response = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json={'name': 'Original', 'color': '#FF0000'},
            headers=auth_headers
        )
        label_id = create_response.get_json()['id']

        # Update label
        response = client.put(
            f'/api/v1/accounts/{account_id}/labels/{label_id}',
            json={
                'name': 'Updated',
                'color': '#00FF00',
                'order': 1
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == 'Updated'
        assert data['color'] == '#00FF00'
        assert data['order'] == 1

    def test_update_label_invalid_color(self, client, auth_headers, created_account):
        """Test label update with invalid color"""
        account_id = created_account['id']

        # Create label
        create_response = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json={'name': 'Test', 'color': '#FF0000'},
            headers=auth_headers
        )
        label_id = create_response.get_json()['id']

        # Try invalid update
        response = client.put(
            f'/api/v1/accounts/{account_id}/labels/{label_id}',
            json={'color': 'invalid'},
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_update_label_duplicate_name(self, client, auth_headers, created_account):
        """Test label update fails with duplicate name"""
        account_id = created_account['id']

        # Create two labels
        resp1 = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json={'name': 'Label 1'},
            headers=auth_headers
        )
        resp2 = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json={'name': 'Label 2'},
            headers=auth_headers
        )

        label_id_2 = resp2.get_json()['id']

        # Try to rename to existing name
        response = client.put(
            f'/api/v1/accounts/{account_id}/labels/{label_id_2}',
            json={'name': 'Label 1'},
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'already exists' in data['message']

    def test_update_label_not_found(self, client, auth_headers, created_account):
        """Test updating non-existent label"""
        account_id = created_account['id']
        fake_label_id = str(uuid.uuid4())

        response = client.put(
            f'/api/v1/accounts/{account_id}/labels/{fake_label_id}',
            json={'name': 'Updated'},
            headers=auth_headers
        )

        assert response.status_code == 404


class TestDeleteLabel:
    """Tests for DELETE /api/v1/accounts/{id}/labels/{label_id} endpoint"""

    def test_delete_label_success(self, client, auth_headers, created_account):
        """Test successful label deletion"""
        account_id = created_account['id']

        # Create label
        create_response = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json={'name': 'To Delete'},
            headers=auth_headers
        )
        label_id = create_response.get_json()['id']

        # Delete label
        response = client.delete(
            f'/api/v1/accounts/{account_id}/labels/{label_id}',
            headers=auth_headers
        )

        assert response.status_code == 204

        # Verify deletion
        get_response = client.get(
            f'/api/v1/accounts/{account_id}/labels/{label_id}',
            headers=auth_headers
        )
        assert get_response.status_code == 404

    def test_delete_label_not_found(self, client, auth_headers, created_account):
        """Test deleting non-existent label"""
        account_id = created_account['id']
        fake_label_id = str(uuid.uuid4())

        response = client.delete(
            f'/api/v1/accounts/{account_id}/labels/{fake_label_id}',
            headers=auth_headers
        )

        assert response.status_code == 404


# ============================================================================
# MULTI-TENANT SAFETY TESTS
# ============================================================================

class TestMultiTenantSafety:
    """Tests for multi-tenant isolation in filters and labels"""

    def test_filter_isolation_between_tenants(self, client, created_account):
        """Test that filters are isolated between tenants"""
        account_id = created_account['id']

        # Create filter with tenant 1
        tenant1_headers = {
            'X-Tenant-ID': str(uuid.uuid4()),
            'X-User-ID': str(uuid.uuid4()),
            'Content-Type': 'application/json'
        }
        response1 = client.post(
            f'/api/v1/accounts/{account_id}/filters',
            json={
                'name': 'Filter 1',
                'criteria': {'from': '@company.com'},
                'actions': {'mark_read': True}
            },
            headers=tenant1_headers
        )
        assert response1.status_code == 404  # Account not found for this tenant

    def test_label_isolation_between_tenants(self, client, created_account):
        """Test that labels are isolated between tenants"""
        account_id = created_account['id']

        # Try to create label with different tenant
        different_tenant_headers = {
            'X-Tenant-ID': str(uuid.uuid4()),
            'X-User-ID': str(uuid.uuid4()),
            'Content-Type': 'application/json'
        }
        response = client.post(
            f'/api/v1/accounts/{account_id}/labels',
            json={'name': 'Label'},
            headers=different_tenant_headers
        )
        assert response.status_code == 404  # Account not found for this tenant
