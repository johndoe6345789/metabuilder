#!/usr/bin/env python3
"""
One-shot migration: provisions a DBAL Credential for every existing pastebin
account, and re-points ownership of their existing Snippets/Namespaces from
the local Flask user_auth UUID to their username.

RUN THIS EXACTLY ONCE, BEFORE deploying the app.py changes that switch JWT
`sub` claims from the local UUID to the username (see comments in
register()/login() in app.py). Until this script runs, every existing user's
content is still owned by their UUID; once app.py's new code starts minting
username-keyed tokens, un-migrated users will appear to have lost access to
their own snippets until this script re-points ownership.

Idempotent / safe to re-run:
  - Credential creation uses DBAL's upsert-by-username semantics (setCredential
    is an upsert), so re-running just overwrites the placeholder password again
    — harmless, since nobody has been told that placeholder anyway.
  - Ownership re-pointing only touches rows where userId still equals the old
    UUID; already-migrated rows (userId == username) are silently skipped.

What this does NOT do: recover anyone's original password. Passwords in
user_auth are werkzeug-hashed; there is no way to derive a compatible
Argon2id hash without the plaintext. Every migrated account gets a random,
never-disclosed placeholder DBAL password — migrated users must use the
existing "forgot password" flow (which now also updates their DBAL
Credential, see reset_password() in app.py) before they can log in via
DBAL OIDC. Their legacy Flask-native username/password login keeps working
unaffected in the meantime.

Usage:
    DBAL_BASE_URL=http://localhost:8080 \\
    DBAL_ADMIN_TOKEN=... \\
    DATABASE_PATH=/app/data/snippets.db \\
    python3 migrate_to_dbal_oidc.py [--dry-run]
"""
import os
import secrets
import sqlite3
import sys

import requests

DATABASE_PATH    = os.environ.get('DATABASE_PATH', '/app/data/snippets.db')
DBAL_BASE_URL    = os.environ.get('DBAL_BASE_URL', '').rstrip('/')
DBAL_TENANT_ID   = os.environ.get('DBAL_TENANT_ID', 'pastebin')
DBAL_ADMIN_TOKEN = os.environ.get('DBAL_ADMIN_TOKEN', '')
DRY_RUN = '--dry-run' in sys.argv


def dbal_request(method: str, path: str, json_body=None):
    if not DBAL_BASE_URL:
        raise SystemExit('DBAL_BASE_URL is required')
    headers = {'Content-Type': 'application/json'}
    if DBAL_ADMIN_TOKEN:
        headers['Authorization'] = f'Bearer {DBAL_ADMIN_TOKEN}'
    return requests.request(method, f'{DBAL_BASE_URL}{path}', json=json_body, headers=headers, timeout=10)


def dbal_all_pages(path_with_params: str, limit: int = 500) -> list:
    results = []
    page = 1
    sep = '&' if '?' in path_with_params else '?'
    while True:
        r = dbal_request('GET', f'{path_with_params}{sep}limit={limit}&page={page}')
        if not r.ok:
            break
        payload = r.json().get('data', {})
        batch = payload.get('data', [])
        results.extend(batch)
        if len(results) >= payload.get('total', 0):
            break
        page += 1
    return results


def migrate_credential(username: str) -> bool:
    placeholder = secrets.token_urlsafe(32)  # never disclosed — see module docstring
    if DRY_RUN:
        print(f'  [dry-run] would create DBAL Credential for {username!r}')
        return True
    r = dbal_request('POST', '/admin/credentials', {'username': username, 'password': placeholder})
    if not r.ok:
        print(f'  ERROR creating credential for {username!r}: {r.status_code} {r.text}')
        return False
    return True


def repoint_ownership(entity: str, old_owner: str, username: str) -> int:
    rows = dbal_all_pages(f'/{DBAL_TENANT_ID}/pastebin/{entity}?filter.userId={old_owner}')
    if not rows:
        return 0
    if DRY_RUN:
        print(f'  [dry-run] would re-point {len(rows)} {entity} row(s) from {old_owner!r} to {username!r}')
        return len(rows)
    updated = 0
    for row in rows:
        row_id = row.get('id')
        if not row_id:
            continue
        r = dbal_request('PATCH', f'/{DBAL_TENANT_ID}/pastebin/{entity}/{row_id}', {'userId': username})
        if r.ok:
            updated += 1
        else:
            print(f'  ERROR re-pointing {entity} {row_id}: {r.status_code} {r.text}')
    return updated


def main():
    if not DBAL_ADMIN_TOKEN:
        raise SystemExit('DBAL_ADMIN_TOKEN is required')

    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    users = conn.execute('SELECT id, username FROM user_auth').fetchall()
    conn.close()

    print(f'Found {len(users)} local account(s) in {DATABASE_PATH}')
    if DRY_RUN:
        print('--- DRY RUN: no changes will be made ---')

    migrated, failed = 0, 0
    for user in users:
        old_uuid = user['id']
        username = user['username']
        print(f'Migrating {username!r} (was {old_uuid!r})...')

        if not migrate_credential(username):
            failed += 1
            continue

        snippets = repoint_ownership('Snippet', old_uuid, username)
        namespaces = repoint_ownership('Namespace', old_uuid, username)
        print(f'  re-pointed {snippets} Snippet(s), {namespaces} Namespace(s)')
        migrated += 1

    print(f'\nDone: {migrated} migrated, {failed} failed, {len(users)} total.')
    if not DRY_RUN and migrated:
        print('Migrated users must use "Forgot password" once before DBAL OIDC login works for them.')


if __name__ == '__main__':
    main()
