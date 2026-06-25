#!/usr/bin/env python3
"""
Reports Manager
Self-documenting script for managing project completion reports and logs
Data stored in SQLite3 for efficient querying and search
"""

import argparse
import subprocess
import sys
import sqlite3
from pathlib import Path
from datetime import datetime
import hashlib

DB_FILE = Path(__file__).parent / 'reports.db'

def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE NOT NULL,
            title TEXT,
            content TEXT NOT NULL,
            type TEXT NOT NULL,
            size INTEGER,
            hash TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            archived INTEGER DEFAULT 0,
            tags TEXT
        )
    ''')

    c.execute('''
        CREATE INDEX IF NOT EXISTS idx_filename ON reports(filename)
    ''')

    c.execute('''
        CREATE INDEX IF NOT EXISTS idx_type ON reports(type)
    ''')

    c.execute('''
        CREATE INDEX IF NOT EXISTS idx_archived ON reports(archived)
    ''')

    c.execute('''
        CREATE VIRTUAL TABLE IF NOT EXISTS reports_fts USING fts5(
            filename, title, content, tags,
            content='reports',
            content_rowid='id'
        )
    ''')

    conn.commit()
    conn.close()

def import_file(filepath, archived=False):
    """Import a file into the database"""
    if not filepath.exists():
        return False

    content = filepath.read_text()
    size = filepath.stat().st_size
    file_hash = hashlib.sha256(content.encode()).hexdigest()

    # Extract title from first line if markdown
    title = content.split('\n')[0].strip('#').strip() if content else filepath.stem

    # Determine type
    if filepath.suffix == '.md':
        file_type = 'markdown'
    elif filepath.suffix == '.txt':
        file_type = 'text'
    elif filepath.suffix == '.log':
        file_type = 'log'
    else:
        file_type = 'other'

    # Extract date from filename if present
    created = datetime.fromtimestamp(filepath.stat().st_ctime).isoformat()
    updated = datetime.fromtimestamp(filepath.stat().st_mtime).isoformat()

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    try:
        c.execute('''
            INSERT OR REPLACE INTO reports
            (filename, title, content, type, size, hash, created_at, updated_at, archived)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (filepath.name, title, content, file_type, size, file_hash, created, updated, 1 if archived else 0))

        # Update FTS index
        c.execute('''
            INSERT OR REPLACE INTO reports_fts (rowid, filename, title, content)
            SELECT id, filename, title, content FROM reports WHERE filename = ?
        ''', (filepath.name,))

        conn.commit()
        return True
    except Exception as e:
        print(f"Error importing {filepath.name}: {e}")
        return False
    finally:
        conn.close()

def list_reports(pattern=None, archived=False, report_type=None):
    """List reports from database"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    query = 'SELECT filename, type, size, created_at, archived FROM reports WHERE 1=1'
    params = []

    if not archived:
        query += ' AND archived = 0'

    if report_type:
        query += ' AND type = ?'
        params.append(report_type)

    if pattern:
        query += ' AND filename LIKE ?'
        params.append(f'%{pattern}%')

    query += ' ORDER BY created_at DESC'

    c.execute(query, params)
    results = c.fetchall()
    conn.close()

    return results

def search_reports(query, limit=10):
    """Full-text search across reports"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute('''
        SELECT r.filename, r.type, r.created_at,
               snippet(reports_fts, 2, '<mark>', '</mark>', '...', 50) as snippet
        FROM reports_fts fts
        JOIN reports r ON fts.rowid = r.id
        WHERE reports_fts MATCH ?
        ORDER BY rank
        LIMIT ?
    ''', (query, limit))

    results = c.fetchall()
    conn.close()

    return results

def show_report(filename):
    """Get report content"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute('SELECT content FROM reports WHERE filename = ?', (filename,))
    result = c.fetchone()
    conn.close()

    return result[0] if result else None

def get_stats():
    """Get database statistics"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute('SELECT type, COUNT(*), SUM(size) FROM reports WHERE archived = 0 GROUP BY type')
    active = c.fetchall()

    c.execute('SELECT type, COUNT(*), SUM(size) FROM reports WHERE archived = 1 GROUP BY type')
    archived = c.fetchall()

    c.execute('SELECT COUNT(*), SUM(size) FROM reports')
    total = c.fetchone()

    conn.close()

    return {
        'active': active,
        'archived': archived,
        'total_files': total[0],
        'total_size': total[1] or 0
    }

def archive_old(days=90):
    """Archive old reports"""
    cutoff = datetime.now().timestamp() - (days * 86400)
    cutoff_iso = datetime.fromtimestamp(cutoff).isoformat()

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute('UPDATE reports SET archived = 1 WHERE created_at < ? AND archived = 0', (cutoff_iso,))
    count = c.rowcount
    conn.commit()
    conn.close()

    return count

def main():
    parser = argparse.ArgumentParser(
        description='Reports Manager - SQLite-backed project reports',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Storage: SQLite3 database (reports.db)

Features:
  - Full-text search (FTS5)
  - Efficient querying
  - Metadata tracking
  - Archive management
  - Content deduplication

Examples:
  # Initialize database
  %(prog)s init

  # Import files from archive-2026/
  %(prog)s import archive-2026/*.md

  # List all reports
  %(prog)s list

  # Search reports
  %(prog)s search "workflow"

  # Show specific report
  %(prog)s show COMPLETE.md

  # Show statistics
  %(prog)s stats

  # Archive old reports (90+ days)
  %(prog)s archive --days 90

  # Export report to file
  %(prog)s export COMPLETE.md output.md
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # init
    subparsers.add_parser('init', help='Initialize database')

    # import
    import_parser = subparsers.add_parser('import', help='Import files to database')
    import_parser.add_argument('files', nargs='+', help='Files to import')
    import_parser.add_argument('--archived', action='store_true', help='Mark as archived')

    # create
    create_parser = subparsers.add_parser('create', help='Create report directly in database')
    create_parser.add_argument('title', type=str, help='Report title')
    create_parser.add_argument('content', type=str, help='Report content')
    create_parser.add_argument('--type', type=str, choices=['markdown', 'text', 'log'], default='markdown', help='Report type')
    create_parser.add_argument('--archived', action='store_true', help='Mark as archived')

    # update
    update_parser = subparsers.add_parser('update', help='Update existing report')
    update_parser.add_argument('filename', type=str, help='Report filename to update')
    update_parser.add_argument('--title', type=str, help='New title')
    update_parser.add_argument('--content', type=str, help='New content')
    update_parser.add_argument('--type', type=str, choices=['markdown', 'text', 'log'], help='New type')

    # list
    list_parser = subparsers.add_parser('list', help='List reports')
    list_parser.add_argument('--pattern', type=str, help='Filter by pattern')
    list_parser.add_argument('--type', choices=['markdown', 'text', 'log'], help='Filter by type')
    list_parser.add_argument('--archived', action='store_true', help='Include archived')

    # search
    search_parser = subparsers.add_parser('search', help='Search reports (FTS5)')
    search_parser.add_argument('query', type=str, help='Search query')
    search_parser.add_argument('--limit', type=int, default=10, help='Max results')

    # show
    show_parser = subparsers.add_parser('show', help='Show report content')
    show_parser.add_argument('filename', type=str, help='Report filename')

    # stats
    subparsers.add_parser('stats', help='Show statistics')

    # archive
    archive_parser = subparsers.add_parser('archive', help='Archive old reports')
    archive_parser.add_argument('--days', type=int, default=90, help='Archive older than N days')

    # export
    export_parser = subparsers.add_parser('export', help='Export report to file')
    export_parser.add_argument('filename', type=str, help='Report to export')
    export_parser.add_argument('output', type=str, help='Output file')

    # delete
    delete_parser = subparsers.add_parser('delete', help='Delete report from database')
    delete_parser.add_argument('filename', type=str, help='Report filename to delete')

    # delete-many
    delete_many_parser = subparsers.add_parser('delete-many', help='Delete multiple reports')
    delete_many_parser.add_argument('pattern', type=str, help='Pattern to match (SQL LIKE pattern, e.g., "2026-01-%%")')
    delete_many_parser.add_argument('--type', type=str, choices=['markdown', 'text', 'log'], help='Filter by type')
    delete_many_parser.add_argument('--archived-only', action='store_true', help='Only delete archived reports')
    delete_many_parser.add_argument('--confirm', action='store_true', help='Skip confirmation prompt')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    try:
        if args.command == 'init':
            print("🔧 Initializing reports database...")
            init_db()
            print(f"✅ Database created: {DB_FILE}")
            return 0

        elif args.command == 'import':
            init_db()
            print(f"📥 Importing {len(args.files)} files...")

            imported = 0
            for pattern in args.files:
                for filepath in Path('.').glob(pattern):
                    if filepath.is_file():
                        if import_file(filepath, args.archived):
                            imported += 1
                            print(f"  ✓ {filepath.name}")

            print(f"\n✅ Imported {imported} files")
            return 0

        elif args.command == 'create':
            init_db()

            # Generate filename from title
            filename = args.title.lower().replace(' ', '-') + ('.md' if args.type == 'markdown' else f'.{args.type}')

            # Get current timestamp
            now = datetime.now()
            created = now.isoformat()
            updated = created

            # Calculate size and hash
            content_bytes = args.content.encode()
            size = len(content_bytes)
            file_hash = hashlib.sha256(content_bytes).hexdigest()

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            try:
                c.execute('''
                    INSERT INTO reports
                    (filename, title, content, type, size, hash, created_at, updated_at, archived)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (filename, args.title, args.content, args.type, size, file_hash, created, updated, 1 if args.archived else 0))

                # Update FTS index
                c.execute('''
                    INSERT INTO reports_fts (rowid, filename, title, content)
                    SELECT id, filename, title, content FROM reports WHERE filename = ?
                ''', (filename,))

                conn.commit()
                print(f"✅ Created report: {filename}")
                return 0
            except Exception as e:
                print(f"❌ Error creating report: {e}")
                return 1
            finally:
                conn.close()

        elif args.command == 'list':
            reports = list_reports(args.pattern, args.archived, args.type)

            if not reports:
                print("No reports found")
                return 0

            print(f"{'Filename':<50} {'Type':<10} {'Size':<10} {'Created':<20}")
            print("-" * 95)

            for filename, rtype, size, created, archived in reports:
                size_str = f"{size / 1024:.1f}K" if size > 1024 else f"{size}B"
                created_dt = datetime.fromisoformat(created).strftime('%Y-%m-%d %H:%M')
                archived_str = " [A]" if archived else ""
                print(f"{filename:<50} {rtype:<10} {size_str:<10} {created_dt:<20}{archived_str}")

            print(f"\nTotal: {len(reports)} reports")

        elif args.command == 'search':
            results = search_reports(args.query, args.limit)

            if not results:
                print(f"No results for: {args.query}")
                return 0

            print(f"🔍 Search results for '{args.query}'\n")

            for i, (filename, rtype, created, snippet) in enumerate(results, 1):
                created_dt = datetime.fromisoformat(created).strftime('%Y-%m-%d')
                print(f"{i}. {filename} ({rtype}, {created_dt})")
                print(f"   {snippet}")
                print()

        elif args.command == 'show':
            content = show_report(args.filename)

            if not content:
                print(f"❌ Report not found: {args.filename}")
                return 1

            print(content)

        elif args.command == 'stats':
            stats = get_stats()

            print("📊 Reports Statistics\n")
            print("Active Reports:")
            for rtype, count, size in stats['active']:
                size_mb = (size or 0) / (1024 * 1024)
                print(f"  {rtype:<10} {count:>5} files  {size_mb:>6.2f} MB")

            if stats['archived']:
                print("\nArchived Reports:")
                for rtype, count, size in stats['archived']:
                    size_mb = (size or 0) / (1024 * 1024)
                    print(f"  {rtype:<10} {count:>5} files  {size_mb:>6.2f} MB")

            total_mb = stats['total_size'] / (1024 * 1024)
            print(f"\nTotal: {stats['total_files']} files, {total_mb:.2f} MB")

        elif args.command == 'archive':
            count = archive_old(args.days)
            print(f"📦 Archived {count} reports older than {args.days} days")

        elif args.command == 'export':
            content = show_report(args.filename)

            if not content:
                print(f"❌ Report not found: {args.filename}")
                return 1

            Path(args.output).write_text(content)
            print(f"✅ Exported to: {args.output}")

        elif args.command == 'update':
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            try:
                # Build update query dynamically
                updates = []
                params = []

                if args.title:
                    updates.append('title = ?')
                    params.append(args.title)

                if args.content:
                    updates.append('content = ?')
                    params.append(args.content)
                    # Recalculate size and hash
                    content_bytes = args.content.encode()
                    updates.append('size = ?')
                    params.append(len(content_bytes))
                    updates.append('hash = ?')
                    params.append(hashlib.sha256(content_bytes).hexdigest())

                if args.type:
                    updates.append('type = ?')
                    params.append(args.type)

                if not updates:
                    print("❌ No updates specified (use --title, --content, or --type)")
                    return 1

                # Always update updated_at
                updates.append('updated_at = ?')
                params.append(datetime.now().isoformat())

                # Add filename to params
                params.append(args.filename)

                # Execute update
                c.execute(f"UPDATE reports SET {', '.join(updates)} WHERE filename = ?", params)

                if c.rowcount == 0:
                    print(f"❌ Report not found: {args.filename}")
                    return 1

                # Update FTS index
                c.execute('''
                    INSERT OR REPLACE INTO reports_fts (rowid, filename, title, content)
                    SELECT id, filename, title, content FROM reports WHERE filename = ?
                ''', (args.filename,))

                conn.commit()
                print(f"✅ Updated report: {args.filename}")
                return 0
            except Exception as e:
                print(f"❌ Error updating report: {e}")
                return 1
            finally:
                conn.close()

        elif args.command == 'delete':
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            try:
                # Delete from main table
                c.execute('DELETE FROM reports WHERE filename = ?', (args.filename,))

                if c.rowcount == 0:
                    print(f"❌ Report not found: {args.filename}")
                    return 1

                # Delete from FTS table
                c.execute('DELETE FROM reports_fts WHERE filename = ?', (args.filename,))

                conn.commit()
                print(f"✅ Deleted report: {args.filename}")
                return 0
            except Exception as e:
                print(f"❌ Error deleting report: {e}")
                return 1
            finally:
                conn.close()

        elif args.command == 'delete-many':
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            try:
                # Build query to find matching reports
                query = 'SELECT filename FROM reports WHERE filename LIKE ?'
                params = [args.pattern]

                if args.type:
                    query += ' AND type = ?'
                    params.append(args.type)

                if args.archived_only:
                    query += ' AND archived = 1'

                c.execute(query, params)
                matching = c.fetchall()

                if not matching:
                    print(f"❌ No reports found matching pattern: {args.pattern}")
                    return 1

                print(f"Found {len(matching)} reports matching pattern: {args.pattern}")
                for filename, in matching:
                    print(f"  - {filename}")

                if not args.confirm:
                    response = input(f"\n⚠️  Delete {len(matching)} reports? [y/N]: ")
                    if response.lower() != 'y':
                        print("❌ Cancelled")
                        return 1

                # Delete from main table
                delete_query = 'DELETE FROM reports WHERE filename LIKE ?'
                delete_params = [args.pattern]

                if args.type:
                    delete_query += ' AND type = ?'
                    delete_params.append(args.type)

                if args.archived_only:
                    delete_query += ' AND archived = 1'

                c.execute(delete_query, delete_params)
                deleted_count = c.rowcount

                # Delete from FTS table (matching filenames)
                for filename, in matching:
                    c.execute('DELETE FROM reports_fts WHERE filename = ?', (filename,))

                conn.commit()
                print(f"✅ Deleted {deleted_count} reports")
                return 0
            except Exception as e:
                print(f"❌ Error deleting reports: {e}")
                return 1
            finally:
                conn.close()

        return 0

    except KeyboardInterrupt:
        print("\n⚠️  Interrupted")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
