"""
Phase 7 IMAP Protocol Handler - Usage Examples
Real-world integration examples for the IMAP handler
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.handlers.imap import (
    IMAPProtocolHandler,
    IMAPConnectionPool,
    IMAPConnectionConfig,
)


# ============================================================================
# Example 1: Basic Email Sync
# ============================================================================
def example_basic_sync():
    """Basic example: Connect and fetch messages"""
    print("\n=== Example 1: Basic Email Sync ===")

    # Create handler
    handler = IMAPProtocolHandler()

    # Create config
    config = IMAPConnectionConfig(
        hostname="imap.gmail.com",
        port=993,
        username="user@gmail.com",
        password="app-specific-password",
        encryption="tls",
    )

    # Connect and authenticate
    if handler.connect(**config.__dict__):
        print("✓ Connected to Gmail IMAP server")

        # List folders
        folders = handler.list_folders(config)
        print(f"\nFound {len(folders)} folders:")
        for folder in folders[:5]:  # Show first 5
            print(f"  - {folder.display_name} ({folder.folder_type})")

        # Fetch messages from INBOX
        messages = handler.fetch_messages(config, "INBOX")
        print(f"\nFetched {len(messages)} messages from INBOX")

        if messages:
            msg = messages[0]
            print(f"\nFirst message:")
            print(f"  From: {msg.from_addr}")
            print(f"  Subject: {msg.subject}")
            print(f"  UID: {msg.uid}")
            print(f"  Read: {msg.is_read}")

        # Clean up
        handler.disconnect()
        print("\n✓ Disconnected")
    else:
        print("✗ Connection failed")


# ============================================================================
# Example 2: Incremental Sync with UID Tracking
# ============================================================================
def example_incremental_sync():
    """Incremental sync: Fetch only new messages since last sync"""
    print("\n=== Example 2: Incremental Sync ===")

    handler = IMAPProtocolHandler()
    config = IMAPConnectionConfig(
        hostname="imap.gmail.com",
        port=993,
        username="user@gmail.com",
        password="app-specific-password",
    )

    # Simulate last synced UID from database
    last_uid = 12345

    # Fetch only new messages (UID > 12345)
    new_messages = handler.fetch_messages(config, "INBOX", start_uid=last_uid)

    print(f"Last synced UID: {last_uid}")
    print(f"New messages: {len(new_messages)}")

    if new_messages:
        max_uid = max(msg.uid for msg in new_messages)
        print(f"New last UID: {max_uid}")

    handler.disconnect()


# ============================================================================
# Example 3: Search Operations
# ============================================================================
def example_search():
    """Search for messages using IMAP criteria"""
    print("\n=== Example 3: Search Operations ===")

    handler = IMAPProtocolHandler()
    config = IMAPConnectionConfig(
        hostname="imap.gmail.com",
        port=993,
        username="user@gmail.com",
        password="app-specific-password",
    )

    # Search for unread messages
    print("\nSearching for unread messages...")
    unread_uids = handler.search(config, "INBOX", "UNSEEN")
    print(f"Found {len(unread_uids)} unread messages: {unread_uids[:10]}")

    # Search from specific sender
    print("\nSearching for messages from boss...")
    boss_uids = handler.search(config, "INBOX", 'FROM "boss@company.com"')
    print(f"Found {len(boss_uids)} messages from boss")

    # Search with multiple criteria
    print("\nSearching for unread messages from boss...")
    criteria = 'FROM "boss@company.com" UNSEEN'
    important_uids = handler.search(config, "INBOX", criteria)
    print(f"Found {len(important_uids)} important unread messages")

    handler.disconnect()


# ============================================================================
# Example 4: Message Operations (Read/Star)
# ============================================================================
def example_message_operations():
    """Perform operations on messages"""
    print("\n=== Example 4: Message Operations ===")

    handler = IMAPProtocolHandler()
    config = IMAPConnectionConfig(
        hostname="imap.gmail.com",
        port=993,
        username="user@gmail.com",
        password="app-specific-password",
    )

    # Get unread messages
    unread_uids = handler.search(config, "INBOX", "UNSEEN")

    if unread_uids:
        uid = unread_uids[0]
        print(f"\nOperating on message UID {uid}:")

        # Mark as read
        if handler.mark_as_read(config, uid):
            print("✓ Marked as read")

        # Add star
        if handler.add_star(config, uid):
            print("✓ Added star")

        # Remove star
        if handler.remove_star(config, uid):
            print("✓ Removed star")

        # Mark as unread
        if handler.mark_as_unread(config, uid):
            print("✓ Marked as unread")

    handler.disconnect()


# ============================================================================
# Example 5: Connection Pooling
# ============================================================================
def example_connection_pooling():
    """Use connection pool for multiple accounts"""
    print("\n=== Example 5: Connection Pooling ===")

    # Create pool with 3 connections per account
    pool = IMAPConnectionPool(max_connections_per_account=3)

    # Account 1
    config1 = IMAPConnectionConfig(
        hostname="imap.gmail.com",
        port=993,
        username="user1@gmail.com",
        password="password1",
    )

    # Account 2
    config2 = IMAPConnectionConfig(
        hostname="imap.company.com",
        port=993,
        username="user@company.com",
        password="password2",
    )

    # Use pooled connections
    print("\nFetching messages from Account 1...")
    with pool.pooled_connection(config1) as conn:
        conn.select_folder("INBOX")
        folders = conn.list_folders()
        print(f"Account 1: {len(folders)} folders")

    print("\nFetching messages from Account 2...")
    with pool.pooled_connection(config2) as conn:
        conn.select_folder("INBOX")
        folders = conn.list_folders()
        print(f"Account 2: {len(folders)} folders")

    # Connections are reused from pool on next call
    print("\nReusing connections from pool...")
    with pool.pooled_connection(config1) as conn:
        print("Account 1 connection reused from pool")

    # Clean up pool
    pool.clear_pool()
    print("\nPool cleared")


# ============================================================================
# Example 6: IDLE Mode (Real-time Notifications)
# ============================================================================
def example_idle_mode():
    """IDLE mode for real-time email notifications"""
    print("\n=== Example 6: IDLE Mode ===")

    handler = IMAPProtocolHandler()
    config = IMAPConnectionConfig(
        hostname="imap.gmail.com",
        port=993,
        username="user@gmail.com",
        password="app-specific-password",
    )

    def on_new_message(response):
        """Callback for new messages"""
        print(f"\n[IDLE] New notification: {response}")

    # Start IDLE mode
    print("Starting IDLE mode...")
    if handler.start_idle(config, callback=on_new_message):
        print("✓ IDLE mode started")
        print("Listening for new messages (press Ctrl+C to stop)...")

        # Simulate waiting for messages
        import time
        try:
            time.sleep(30)  # Listen for 30 seconds
        except KeyboardInterrupt:
            print("\nStopping IDLE mode...")

        # Stop IDLE mode
        if handler.stop_idle(config):
            print("✓ IDLE mode stopped")

    handler.disconnect()


# ============================================================================
# Example 7: Bulk Operations
# ============================================================================
def example_bulk_operations():
    """Perform bulk operations on messages"""
    print("\n=== Example 7: Bulk Operations ===")

    handler = IMAPProtocolHandler()
    config = IMAPConnectionConfig(
        hostname="imap.gmail.com",
        port=993,
        username="user@gmail.com",
        password="app-specific-password",
    )

    # Mark all unread messages in spam as read
    print("Processing spam folder...")
    spam_uids = handler.search(config, "[Gmail]/Spam", "UNSEEN")

    print(f"Found {len(spam_uids)} unread spam messages")

    for uid in spam_uids[:10]:  # Process first 10
        handler.mark_as_read(config, uid, "[Gmail]/Spam")
        print(f"  Marked UID {uid} as read")

    handler.disconnect()
    print("✓ Done")


# ============================================================================
# Example 8: UID Validity (For Message Stability)
# ============================================================================
def example_uid_validity():
    """Check UID validity for stable message references"""
    print("\n=== Example 8: UID Validity ===")

    handler = IMAPProtocolHandler()
    config = IMAPConnectionConfig(
        hostname="imap.gmail.com",
        port=993,
        username="user@gmail.com",
        password="app-specific-password",
    )

    # Get UID validity for INBOX
    validity = handler.get_uid_validity(config, "INBOX")

    print(f"INBOX UID Validity: {validity}")
    print(f"\nUID validity ensures UIDs remain stable across sessions.")
    print(f"Store this value with messages for long-term reference.")

    handler.disconnect()


# ============================================================================
# Example 9: Multi-Account Sync
# ============================================================================
def example_multi_account_sync():
    """Sync multiple email accounts in parallel"""
    print("\n=== Example 9: Multi-Account Sync ===")

    from concurrent.futures import ThreadPoolExecutor, as_completed

    accounts = [
        {
            "id": "account_1",
            "hostname": "imap.gmail.com",
            "port": 993,
            "username": "user1@gmail.com",
            "password": "password1",
        },
        {
            "id": "account_2",
            "hostname": "imap.company.com",
            "port": 993,
            "username": "user@company.com",
            "password": "password2",
        },
    ]

    def sync_account(account):
        """Sync single account"""
        config = IMAPConnectionConfig(
            hostname=account["hostname"],
            port=account["port"],
            username=account["username"],
            password=account["password"],
        )

        handler = IMAPProtocolHandler()
        folders = handler.list_folders(config)
        handler.disconnect()

        return {
            "account_id": account["id"],
            "folder_count": len(folders),
        }

    # Sync all accounts in parallel
    print(f"Syncing {len(accounts)} accounts...")

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(sync_account, account): account["id"]
            for account in accounts
        }

        for future in as_completed(futures):
            result = future.result()
            print(f"✓ {result['account_id']}: {result['folder_count']} folders")


# ============================================================================
# Example 10: Error Handling
# ============================================================================
def example_error_handling():
    """Handle various error conditions"""
    print("\n=== Example 10: Error Handling ===")

    handler = IMAPProtocolHandler()

    # Invalid credentials
    print("\n1. Testing invalid credentials...")
    config_invalid = IMAPConnectionConfig(
        hostname="imap.gmail.com",
        port=993,
        username="invalid@gmail.com",
        password="wrongpassword",
        max_retries=1,  # Quick fail for demo
    )

    if not handler.connect(**config_invalid.__dict__):
        print("✓ Properly handled invalid credentials")

    # Invalid hostname
    print("\n2. Testing invalid hostname...")
    config_bad_host = IMAPConnectionConfig(
        hostname="invalid.server.com",
        port=993,
        username="user@example.com",
        password="password",
        max_retries=1,  # Quick fail for demo
    )

    if not handler.connect(**config_bad_host.__dict__):
        print("✓ Properly handled invalid hostname")

    # Invalid folder
    print("\n3. Testing invalid folder...")
    config_valid = IMAPConnectionConfig(
        hostname="imap.gmail.com",
        port=993,
        username="user@gmail.com",
        password="app-specific-password",
    )

    try:
        messages = handler.fetch_messages(config_valid, "NonExistentFolder")
        print(f"✓ Handled invalid folder (returned {len(messages)} messages)")
    except Exception as e:
        print(f"✓ Caught error: {e}")

    handler.disconnect()


# ============================================================================
# Main
# ============================================================================
if __name__ == "__main__":
    print("=" * 70)
    print("Phase 7 IMAP Protocol Handler - Usage Examples")
    print("=" * 70)
    print("\nNote: These examples require valid Gmail/IMAP credentials.")
    print("Set credentials in the example functions before running.")
    print("\nAvailable examples:")
    print("  1. example_basic_sync()")
    print("  2. example_incremental_sync()")
    print("  3. example_search()")
    print("  4. example_message_operations()")
    print("  5. example_connection_pooling()")
    print("  6. example_idle_mode()")
    print("  7. example_bulk_operations()")
    print("  8. example_uid_validity()")
    print("  9. example_multi_account_sync()")
    print("  10. example_error_handling()")
    print("\nTo run an example:")
    print("  python3 -c \"from examples.imap_handler_examples import example_basic_sync; example_basic_sync()\"")
    print("=" * 70)
