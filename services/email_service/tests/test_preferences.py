"""
User Preferences API Tests - Phase 7
Comprehensive test suite for user preferences/settings management

Test Coverage:
- GET /api/v1/users/:id/preferences
- PUT /api/v1/users/:id/preferences
- POST /api/v1/users/:id/preferences/reset
- POST /api/v1/users/:id/preferences/validate
- Multi-tenant isolation
- Authentication & authorization
- Validation of all preference categories
- Optimistic locking (version conflicts)
"""
import pytest
import uuid
import json
from datetime import datetime


class TestGetPreferences:
    """Tests for GET /api/v1/users/:id/preferences"""

    def test_get_preferences_creates_defaults(self, client, auth_headers, tenant_id, user_id):
        """Should create preferences with defaults if they don't exist"""
        response = client.get(
            f'/api/v1/users/{user_id}/preferences',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        prefs = data['data']

        # Verify defaults
        assert prefs['userId'] == user_id
        assert prefs['tenantId'] == tenant_id
        assert prefs['theme']['mode'] == 'light'
        assert prefs['theme']['accentColor'] == '#1976d2'
        assert prefs['localization']['timezone'] == 'UTC'
        assert prefs['localization']['locale'] == 'en_US'
        assert prefs['sync']['enabled'] is True
        assert prefs['sync']['frequencyMinutes'] == 5
        assert prefs['notifications']['enabled'] is True
        assert prefs['version'] == 1

    def test_get_preferences_returns_existing(self, client, auth_headers, tenant_id, user_id):
        """Should return existing preferences"""
        # Create preferences
        response1 = client.get(
            f'/api/v1/users/{user_id}/preferences',
            headers=auth_headers
        )
        assert response1.status_code == 200
        id1 = response1.get_json()['data']['id']

        # Get preferences again
        response2 = client.get(
            f'/api/v1/users/{user_id}/preferences',
            headers=auth_headers
        )
        assert response2.status_code == 200
        id2 = response2.get_json()['data']['id']

        # Should be same preferences
        assert id1 == id2

    def test_get_preferences_missing_tenant_id(self, client, user_id):
        """Should return 401 if X-Tenant-ID missing"""
        response = client.get(
            f'/api/v1/users/{user_id}/preferences',
            headers={'X-User-ID': str(uuid.uuid4())}
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['error'] == 'Unauthorized'

    def test_get_preferences_missing_user_id(self, client, auth_headers, tenant_id):
        """Should return 401 if X-User-ID missing"""
        response = client.get(
            f'/api/v1/users/some-user/preferences',
            headers={'X-Tenant-ID': tenant_id}
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['error'] == 'Unauthorized'

    def test_get_preferences_other_user_forbidden(self, client, auth_headers, tenant_id, user_id):
        """Should return 403 when accessing another user's preferences"""
        other_user_id = str(uuid.uuid4())
        response = client.get(
            f'/api/v1/users/{other_user_id}/preferences',
            headers=auth_headers
        )

        assert response.status_code == 403
        data = response.get_json()
        assert data['error'] == 'Forbidden'

    def test_get_preferences_multi_tenant_isolation(self, client, tenant_id, user_id):
        """Should isolate preferences by tenant"""
        # Create preferences in tenant 1
        headers1 = {
            'X-Tenant-ID': tenant_id,
            'X-User-ID': user_id,
            'Content-Type': 'application/json'
        }
        response1 = client.get(
            f'/api/v1/users/{user_id}/preferences',
            headers=headers1
        )
        assert response1.status_code == 200
        id1 = response1.get_json()['data']['id']

        # Get with different tenant (should be different preferences object)
        tenant_id_2 = str(uuid.uuid4())
        headers2 = {
            'X-Tenant-ID': tenant_id_2,
            'X-User-ID': user_id,
            'Content-Type': 'application/json'
        }
        response2 = client.get(
            f'/api/v1/users/{user_id}/preferences',
            headers=headers2
        )
        assert response2.status_code == 200
        id2 = response2.get_json()['data']['id']

        # Different IDs = different preferences objects
        assert id1 != id2


class TestUpdatePreferences:
    """Tests for PUT /api/v1/users/:id/preferences"""

    def test_update_theme_settings(self, client, auth_headers, tenant_id, user_id):
        """Should update theme settings"""
        update_data = {
            'theme': {
                'mode': 'dark',
                'accentColor': '#2196f3',
                'compactMode': True,
                'messageDensity': 'compact',
                'fontSizePercent': 110,
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        prefs = response.get_json()['data']
        assert prefs['theme']['mode'] == 'dark'
        assert prefs['theme']['accentColor'] == '#2196f3'
        assert prefs['theme']['compactMode'] is True
        assert prefs['theme']['messageDensity'] == 'compact'
        assert prefs['theme']['fontSizePercent'] == 110
        assert prefs['version'] == 2  # Incremented

    def test_update_localization_settings(self, client, auth_headers, tenant_id, user_id):
        """Should update localization settings"""
        update_data = {
            'localization': {
                'timezone': 'America/New_York',
                'locale': 'fr_FR',
                'dateFormat': 'd/MM/yyyy',
                'timeFormat': 'HH:mm',
                'use12hrClock': False,
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        prefs = response.get_json()['data']
        assert prefs['localization']['timezone'] == 'America/New_York'
        assert prefs['localization']['locale'] == 'fr_FR'
        assert prefs['localization']['dateFormat'] == 'd/MM/yyyy'
        assert prefs['localization']['use12hrClock'] is False

    def test_update_sync_settings(self, client, auth_headers, tenant_id, user_id):
        """Should update sync settings"""
        update_data = {
            'sync': {
                'enabled': False,
                'frequencyMinutes': 30,
                'backgroundSyncEnabled': False,
                'scope': 'last_90',
                'daysBack': 90,
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        prefs = response.get_json()['data']
        assert prefs['sync']['enabled'] is False
        assert prefs['sync']['frequencyMinutes'] == 30
        assert prefs['sync']['scope'] == 'last_90'

    def test_update_notification_settings(self, client, auth_headers, tenant_id, user_id):
        """Should update notification settings"""
        update_data = {
            'notifications': {
                'enabled': False,
                'newMail': False,
                'soundEnabled': False,
                'smartNotifications': True,
                'quietHoursEnabled': True,
                'quietHoursStart': '22:00',
                'quietHoursEnd': '07:00',
                'categories': {
                    'promotions': True,
                    'newsletters': False,
                }
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        prefs = response.get_json()['data']
        assert prefs['notifications']['enabled'] is False
        assert prefs['notifications']['quietHoursEnabled'] is True
        assert prefs['notifications']['quietHoursStart'] == '22:00'
        assert prefs['notifications']['quietHoursEnd'] == '07:00'

    def test_update_signature_settings(self, client, auth_headers, tenant_id, user_id):
        """Should update signature settings"""
        update_data = {
            'signature': {
                'enabled': True,
                'text': 'Best regards,\nJohn Doe',
                'html': '<p>Best regards,<br>John Doe</p>',
                'includeInReplies': True,
                'includeInForwards': False,
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        prefs = response.get_json()['data']
        assert prefs['signature']['enabled'] is True
        assert 'John Doe' in prefs['signature']['text']
        assert prefs['signature']['includeInReplies'] is True

    def test_update_privacy_settings(self, client, auth_headers, tenant_id, user_id):
        """Should update privacy settings"""
        update_data = {
            'privacy': {
                'readReceiptsEnabled': True,
                'sendReadReceipts': True,
                'pgpEnabled': False,
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        prefs = response.get_json()['data']
        assert prefs['privacy']['readReceiptsEnabled'] is True
        assert prefs['privacy']['sendReadReceipts'] is True

    def test_update_vacation_mode(self, client, auth_headers, tenant_id, user_id):
        """Should update vacation mode settings"""
        now_ms = int(datetime.utcnow().timestamp() * 1000)
        update_data = {
            'privacy': {
                'vacationModeEnabled': True,
                'vacationMessage': 'I am out of office. I will return on Jan 25.',
                'vacationStartDate': now_ms,
                'vacationEndDate': now_ms + 86400000,  # +1 day
                'vacationNotifySender': True,
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        prefs = response.get_json()['data']
        assert prefs['privacy']['vacationModeEnabled'] is True
        assert 'out of office' in prefs['privacy']['vacationMessage']

    def test_update_storage_settings(self, client, auth_headers, tenant_id, user_id):
        """Should update storage settings"""
        update_data = {
            'storage': {
                'quotaBytes': 16000000000,  # 16 GB
                'warningPercent': 75,
                'autoDeleteSpamDays': 30,
                'autoDeleteTrashDays': 7,
                'compressAttachments': True,
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        prefs = response.get_json()['data']
        assert prefs['storage']['quotaBytes'] == 16000000000
        assert prefs['storage']['warningPercent'] == 75
        assert prefs['storage']['compressAttachments'] is True

    def test_update_templates(self, client, auth_headers, tenant_id, user_id):
        """Should update quick reply templates"""
        update_data = {
            'templates': {
                'quickReplyTemplates': [
                    {'name': 'thanks', 'text': 'Thanks!'},
                    {'name': 'meeting', 'text': 'Let\'s schedule a meeting.'},
                ]
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        prefs = response.get_json()['data']
        assert len(prefs['templates']['quickReplyTemplates']) == 2
        assert prefs['templates']['quickReplyTemplates'][0]['name'] == 'thanks'

    def test_update_advanced_settings(self, client, auth_headers, tenant_id, user_id):
        """Should update advanced settings"""
        update_data = {
            'advanced': {
                'enableAiFeatures': False,
                'enableThreadedView': True,
                'enableConversationMode': False,
                'conversationThreadingStrategy': 'refs',
                'debugMode': False,
                'enableTelemetry': False,
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        prefs = response.get_json()['data']
        assert prefs['advanced']['enableAiFeatures'] is False
        assert prefs['advanced']['conversationThreadingStrategy'] == 'refs'
        assert prefs['advanced']['enableTelemetry'] is False

    def test_update_missing_body(self, client, auth_headers, tenant_id, user_id):
        """Should return 400 if request body missing"""
        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Request body required' in data['message']

    def test_update_invalid_theme_mode(self, client, auth_headers, tenant_id, user_id):
        """Should return 400 if theme.mode invalid"""
        update_data = {
            'theme': {
                'mode': 'invalid'
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'light' in data['message'] or 'dark' in data['message']

    def test_update_invalid_sync_frequency(self, client, auth_headers, tenant_id, user_id):
        """Should return 400 if sync frequency invalid"""
        update_data = {
            'sync': {
                'frequencyMinutes': 2000  # Too high
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'frequencyMinutes' in data['message'] or 'between' in data['message']

    def test_update_missing_quiet_hours_end(self, client, auth_headers, tenant_id, user_id):
        """Should return 400 if quiet hours enabled but end time missing"""
        update_data = {
            'notifications': {
                'quietHoursEnabled': True,
                'quietHoursStart': '22:00'
                # Missing quietHoursEnd
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'quietHoursEnd' in data['message']

    def test_update_vacation_without_message(self, client, auth_headers, tenant_id, user_id):
        """Should return 400 if vacation enabled without message"""
        now_ms = int(datetime.utcnow().timestamp() * 1000)
        update_data = {
            'privacy': {
                'vacationModeEnabled': True,
                'vacationStartDate': now_ms,
                'vacationEndDate': now_ms + 86400000,
                # Missing vacationMessage
            }
        }

        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'vacationMessage' in data['message']

    def test_update_other_user_forbidden(self, client, auth_headers, tenant_id, user_id):
        """Should return 403 when updating another user's preferences"""
        other_user_id = str(uuid.uuid4())
        update_data = {'theme': {'mode': 'dark'}}

        response = client.put(
            f'/api/v1/users/{other_user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 403

    def test_update_version_mismatch(self, client, auth_headers, tenant_id, user_id):
        """Should return 409 on version mismatch (optimistic locking)"""
        # Create preferences
        response1 = client.get(
            f'/api/v1/users/{user_id}/preferences',
            headers=auth_headers
        )
        assert response1.status_code == 200

        # Try to update with wrong version
        update_data = {
            'version': 999,  # Wrong version
            'theme': {'mode': 'dark'}
        }

        response2 = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response2.status_code == 409
        data = response2.get_json()
        assert 'Version mismatch' in data['message']

    def test_update_partial_settings(self, client, auth_headers, tenant_id, user_id):
        """Should allow partial updates"""
        # Get initial preferences
        response1 = client.get(
            f'/api/v1/users/{user_id}/preferences',
            headers=auth_headers
        )
        initial_timezone = response1.get_json()['data']['localization']['timezone']

        # Update only theme
        update_data = {
            'theme': {'mode': 'dark'}
        }
        response2 = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )

        assert response2.status_code == 200
        prefs = response2.get_json()['data']
        assert prefs['theme']['mode'] == 'dark'
        # Timezone should be unchanged
        assert prefs['localization']['timezone'] == initial_timezone


class TestResetPreferences:
    """Tests for POST /api/v1/users/:id/preferences/reset"""

    def test_reset_preferences(self, client, auth_headers, tenant_id, user_id):
        """Should reset preferences to defaults"""
        # Update preferences
        update_data = {
            'theme': {'mode': 'dark'},
            'localization': {'timezone': 'America/Los_Angeles'},
        }
        response1 = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json=update_data,
            headers=auth_headers
        )
        assert response1.status_code == 200
        old_id = response1.get_json()['data']['id']

        # Reset preferences
        response2 = client.post(
            f'/api/v1/users/{user_id}/preferences/reset',
            headers=auth_headers
        )
        assert response2.status_code == 200
        data = response2.get_json()
        assert data['status'] == 'success'
        prefs = data['data']

        # Should have new ID and reset values
        assert prefs['id'] != old_id
        assert prefs['theme']['mode'] == 'light'  # Reset to default
        assert prefs['localization']['timezone'] == 'UTC'  # Reset to default
        assert prefs['version'] == 1  # Fresh version

    def test_reset_other_user_forbidden(self, client, auth_headers, tenant_id):
        """Should return 403 when resetting another user's preferences"""
        other_user_id = str(uuid.uuid4())

        response = client.post(
            f'/api/v1/users/{other_user_id}/preferences/reset',
            headers=auth_headers
        )

        assert response.status_code == 403


class TestValidatePreferences:
    """Tests for POST /api/v1/users/:id/preferences/validate"""

    def test_validate_valid_payload(self, client, auth_headers, tenant_id, user_id):
        """Should return valid=true for correct payload"""
        payload = {
            'theme': {'mode': 'dark'},
            'sync': {'frequencyMinutes': 15},
        }

        response = client.post(
            f'/api/v1/users/{user_id}/preferences/validate',
            json=payload,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert data['valid'] is True

    def test_validate_invalid_payload(self, client, auth_headers, tenant_id, user_id):
        """Should return valid=false with error for invalid payload"""
        payload = {
            'theme': {'mode': 'invalid'}
        }

        response = client.post(
            f'/api/v1/users/{user_id}/preferences/validate',
            json=payload,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert data['valid'] is False
        assert 'error' in data

    def test_validate_missing_body(self, client, auth_headers, tenant_id, user_id):
        """Should return 400 if request body missing"""
        response = client.post(
            f'/api/v1/users/{user_id}/preferences/validate',
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_validate_other_user_forbidden(self, client, auth_headers, tenant_id):
        """Should return 403 when validating another user's preferences"""
        other_user_id = str(uuid.uuid4())
        payload = {'theme': {'mode': 'dark'}}

        response = client.post(
            f'/api/v1/users/{other_user_id}/preferences/validate',
            json=payload,
            headers=auth_headers
        )

        assert response.status_code == 403


class TestPreferencesMultiTenant:
    """Tests for multi-tenant isolation"""

    def test_preferences_isolated_by_tenant(self, client, user_id):
        """Should isolate preferences by tenant"""
        tenant1 = str(uuid.uuid4())
        tenant2 = str(uuid.uuid4())

        headers1 = {
            'X-Tenant-ID': tenant1,
            'X-User-ID': user_id,
            'Content-Type': 'application/json'
        }
        headers2 = {
            'X-Tenant-ID': tenant2,
            'X-User-ID': user_id,
            'Content-Type': 'application/json'
        }

        # Create preferences in tenant1
        response1 = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json={'theme': {'mode': 'dark'}},
            headers=headers1
        )
        assert response1.status_code == 200
        id1 = response1.get_json()['data']['id']

        # Create preferences in tenant2
        response2 = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json={'theme': {'mode': 'light'}},
            headers=headers2
        )
        assert response2.status_code == 200
        id2 = response2.get_json()['data']['id']

        # Preferences should be different objects
        assert id1 != id2

        # Verify isolation: tenant1 should see dark mode
        response3 = client.get(
            f'/api/v1/users/{user_id}/preferences',
            headers=headers1
        )
        assert response3.get_json()['data']['theme']['mode'] == 'dark'

        # Verify isolation: tenant2 should see light mode
        response4 = client.get(
            f'/api/v1/users/{user_id}/preferences',
            headers=headers2
        )
        assert response4.get_json()['data']['theme']['mode'] == 'light'


class TestPreferencesValidationRules:
    """Tests for all validation rules"""

    @pytest.mark.parametrize('invalid_mode', ['invalid', 'LIGHT', 'DARK', ''])
    def test_invalid_theme_modes(self, client, auth_headers, user_id, invalid_mode):
        """Should reject invalid theme modes"""
        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json={'theme': {'mode': invalid_mode}},
            headers=auth_headers
        )
        assert response.status_code == 400

    @pytest.mark.parametrize('valid_mode', ['light', 'dark', 'auto'])
    def test_valid_theme_modes(self, client, auth_headers, user_id, valid_mode):
        """Should accept valid theme modes"""
        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json={'theme': {'mode': valid_mode}},
            headers=auth_headers
        )
        assert response.status_code == 200

    @pytest.mark.parametrize('invalid_color', ['#fff', '#ffffffff', 'red', 'rgb(255,0,0)'])
    def test_invalid_accent_colors(self, client, auth_headers, user_id, invalid_color):
        """Should reject invalid accent colors"""
        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json={'theme': {'accentColor': invalid_color}},
            headers=auth_headers
        )
        assert response.status_code == 400

    @pytest.mark.parametrize('valid_color', ['#000000', '#ffffff', '#2196f3'])
    def test_valid_accent_colors(self, client, auth_headers, user_id, valid_color):
        """Should accept valid accent colors"""
        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json={'theme': {'accentColor': valid_color}},
            headers=auth_headers
        )
        assert response.status_code == 200

    @pytest.mark.parametrize('invalid_freq', [0, -1, 1441, 10000])
    def test_invalid_sync_frequencies(self, client, auth_headers, user_id, invalid_freq):
        """Should reject invalid sync frequencies"""
        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json={'sync': {'frequencyMinutes': invalid_freq}},
            headers=auth_headers
        )
        assert response.status_code == 400

    @pytest.mark.parametrize('valid_freq', [1, 5, 10, 30, 60, 1440])
    def test_valid_sync_frequencies(self, client, auth_headers, user_id, valid_freq):
        """Should accept valid sync frequencies"""
        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json={'sync': {'frequencyMinutes': valid_freq}},
            headers=auth_headers
        )
        assert response.status_code == 200

    @pytest.mark.parametrize('invalid_scope', ['invalid', 'LAST_30', 'past_month'])
    def test_invalid_sync_scopes(self, client, auth_headers, user_id, invalid_scope):
        """Should reject invalid sync scopes"""
        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json={'sync': {'scope': invalid_scope}},
            headers=auth_headers
        )
        assert response.status_code == 400

    @pytest.mark.parametrize('valid_scope', ['all', 'last_30', 'last_90', 'last_180'])
    def test_valid_sync_scopes(self, client, auth_headers, user_id, valid_scope):
        """Should accept valid sync scopes"""
        response = client.put(
            f'/api/v1/users/{user_id}/preferences',
            json={'sync': {'scope': valid_scope}},
            headers=auth_headers
        )
        assert response.status_code == 200
