# Email Filters & Labels - Quick Start Guide

## What's New

Phase 7 adds comprehensive email filtering and labeling capabilities:
- **Automatic email organization** with rule-based filters
- **Custom labels** for email categorization
- **Execution order management** for predictable behavior
- **Dry-run support** for testing filters before applying

## 30-Second Overview

### Filters
Rules that automatically organize emails based on criteria (from, to, subject, contains, date_range)
and execute actions (move to folder, mark read, apply labels, delete).

### Labels
User-defined tags for categorizing emails with color coding and display ordering.

## Installation

Already integrated into email_service! No additional setup needed.

## Basic Usage

### Create a Filter
```bash
curl -X POST http://localhost:5000/api/v1/accounts/{accountId}/filters \
  -H "X-Tenant-ID: {tenantId}" \
  -H "X-User-ID: {userId}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work Emails",
    "criteria": {"from": "@company.com"},
    "actions": {"apply_labels": ["label-id-123"]},
    "order": 0
  }'
```

### Create a Label
```bash
curl -X POST http://localhost:5000/api/v1/accounts/{accountId}/labels \
  -H "X-Tenant-ID: {tenantId}" \
  -H "X-User-ID: {userId}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Important",
    "color": "#FF0000"
  }'
```

### List Filters
```bash
curl http://localhost:5000/api/v1/accounts/{accountId}/filters \
  -H "X-Tenant-ID: {tenantId}" \
  -H "X-User-ID: {userId}"
```

### Execute Filter
```bash
curl -X POST http://localhost:5000/api/v1/accounts/{accountId}/filters/{filterId}/execute \
  -H "X-Tenant-ID: {tenantId}" \
  -H "X-User-ID: {userId}" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

## Common Patterns

### Auto-organize by Domain
```json
{
  "name": "Gmail Emails",
  "criteria": {"from": "@gmail.com"},
  "actions": {"move_to_folder": "personal-folder-id"},
  "order": 0
}
```

### Flag Important Senders
```json
{
  "name": "CEO Emails",
  "criteria": {"from": "ceo@company.com"},
  "actions": {"apply_labels": ["critical"]},
  "order": 1
}
```

### Cleanup Old Marketing
```json
{
  "name": "Auto-delete old marketing",
  "criteria": {
    "from": "marketing@example.com",
    "date_range": {
      "start": 0,
      "end": 1704067200000
    }
  },
  "actions": {"delete": true},
  "order": 5
}
```

### Complex Multi-Step
```json
{
  "name": "High-priority work",
  "criteria": {
    "from": "@company.com",
    "subject": "urgent"
  },
  "actions": {
    "move_to_folder": "urgent-folder-id",
    "apply_labels": ["work", "urgent"],
    "mark_read": false
  },
  "order": 0
}
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/accounts/{id}/filters` | Create filter |
| GET | `/api/v1/accounts/{id}/filters` | List filters |
| GET | `/api/v1/accounts/{id}/filters/{id}` | Get filter |
| PUT | `/api/v1/accounts/{id}/filters/{id}` | Update filter |
| DELETE | `/api/v1/accounts/{id}/filters/{id}` | Delete filter |
| POST | `/api/v1/accounts/{id}/filters/{id}/execute` | Execute filter |
| POST | `/api/v1/accounts/{id}/labels` | Create label |
| GET | `/api/v1/accounts/{id}/labels` | List labels |
| GET | `/api/v1/accounts/{id}/labels/{id}` | Get label |
| PUT | `/api/v1/accounts/{id}/labels/{id}` | Update label |
| DELETE | `/api/v1/accounts/{id}/labels/{id}` | Delete label |

## Criteria Types

| Criterion | Example | Behavior |
|-----------|---------|----------|
| `from` | `"@company.com"` | Match sender address (case-insensitive substring) |
| `to` | `"user@example.com"` | Match recipient (case-insensitive substring) |
| `subject` | `"meeting"` | Match subject text (case-insensitive substring) |
| `contains` | `"important"` | Match body text (case-insensitive substring) |
| `date_range` | `{start, end}` | Match emails within date range (ms since epoch) |

## Action Types

| Action | Value | Behavior |
|--------|-------|----------|
| `mark_read` | `true/false` | Auto-mark email as read/unread |
| `delete` | `true` | Soft-delete email |
| `move_to_folder` | `"folder-id"` | Move to specific folder |
| `apply_labels` | `["id1", "id2"]` | Apply one or more labels |

## Execution Order

Filters execute in `order` sequence:
- **order: 0** - Execute first
- **order: 1** - Execute second
- **order: 5** - Execute fifth
- etc.

Use execution order to create dependent workflows:
```
0. Classify by domain (add labels)
1. Move to folders
2. Mark as read
3. Delete old messages
```

## Testing Filters

### Dry-run First
```bash
# Test without modifying emails
curl -X POST http://localhost:5000/api/v1/accounts/{id}/filters/{id}/execute \
  -H "X-Tenant-ID: {tenantId}" \
  -H "X-User-ID: {userId}" \
  -d '{"dryRun": true}'
```

Response shows matched and applied counts without making changes.

### Then Apply
```bash
# Apply for real
curl -X POST http://localhost:5000/api/v1/accounts/{id}/filters/{id}/execute \
  -H "X-Tenant-ID: {tenantId}" \
  -H "X-User-ID: {userId}" \
  -d '{"dryRun": false}'
```

## Label Best Practices

- **One word or short phrase**: "Important", "Work", "Review"
- **Use distinct colors**: Different colors for different categories
- **Keep count low**: ~20 labels max for usability
- **Organize hierarchically**: "Work", "Work/Finance", "Work/Legal"
- **Document purpose**: Use description field

## Filter Best Practices

- **Test with dry-run first**: Always validate before applying
- **Use specific criteria**: Avoid overly broad rules
- **Order matters**: Put specific filters first, broad filters last
- **Keep count reasonable**: ~50 filters max per account
- **Monitor execution**: Track matched/applied counts
- **Review periodically**: Delete unused filters

## Troubleshooting

### Filter Not Matching
1. Check criteria spelling (case-insensitive)
2. Verify date_range uses milliseconds (not seconds)
3. Test with simple criteria first (just "from")
4. Use dry-run to see matched count

### Label Not Applying
1. Verify label exists: `GET /api/v1/accounts/{id}/labels`
2. Check label ID is correct in actions
3. Ensure label belongs to same account/tenant

### Folder Move Failing
1. Verify folder exists: `GET /api/v1/accounts/{id}/folders`
2. Check folder ID is correct
3. Ensure folder belongs to same account

### Multi-tenant Issues
1. Check X-Tenant-ID header is present
2. Check X-User-ID header is present
3. Verify account exists for this tenant/user

## Examples in Code

See `tests/test_filters_api.py` for 40+ test cases covering:
- Filter CRUD (create, read, update, delete)
- Label management
- Filter execution
- Validation
- Error handling
- Multi-tenant safety

## Files

| File | Purpose |
|------|---------|
| `src/models.py` | EmailFilter, EmailLabel, EmailFilterLabel models |
| `src/routes/filters.py` | Filter & Label API endpoints |
| `tests/test_filters_api.py` | Comprehensive test suite |
| `PHASE_7_FILTERS_API.md` | Full documentation |
| `FILTERS_QUICK_START.md` | This file |

## Key Classes

### EmailFilter
- `name` - Filter rule name
- `criteria` - Dict of matching conditions
- `actions` - Dict of actions to perform
- `order` - Execution sequence (0 = first)
- `is_enabled` - Enable/disable flag
- `apply_to_new` - Apply on new incoming emails
- `apply_to_existing` - Apply to existing emails

### EmailLabel
- `name` - Label name (unique per account)
- `color` - HEX color code (#RRGGBB)
- `description` - Optional description
- `order` - Display order

## FAQ

**Q: Can I change filter order after creation?**
A: Yes, use PUT to update the `order` field.

**Q: Can I disable filters without deleting?**
A: Yes, set `isEnabled: false` via PUT.

**Q: What happens if two filters match the same email?**
A: All matching filters execute in order sequence.

**Q: Can I apply a filter retroactively?**
A: Yes, use POST `/filters/{id}/execute` with `dryRun: false`.

**Q: How many filters can I create?**
A: No hard limit, but performance is optimized for ~50 per account.

**Q: What's the difference between mark_read and delete?**
A: mark_read flags as read; delete soft-deletes (can be undeleted).

**Q: Can filters reference other filters?**
A: No, filters are independent. Use execution order for dependencies.

**Q: What's the regex support?**
A: Criteria use substring matching (no regex). Use specific keywords instead.

## Support

For issues or questions:
1. Check examples in test suite
2. Review `PHASE_7_FILTERS_API.md` for detailed docs
3. Verify auth headers are set
4. Test with curl before integrating

## What's Next

- **Phase 8**: Advanced filter conditions (regex, attachments, size)
- **Phase 9**: Filter templates and presets
- **Phase 10**: Machine learning-based suggestions
