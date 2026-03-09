#!/usr/bin/env python3
"""
Documentation Manager
Self-documenting script for managing project documentation
Data stored in SQLite3 for efficient querying and search
"""

import argparse
import subprocess
import sys
import sqlite3
from pathlib import Path
from datetime import datetime
import hashlib

DB_FILE = Path(__file__).parent / 'docs.db'

def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE NOT NULL,
            title TEXT,
            content TEXT NOT NULL,
            category TEXT,
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
        CREATE INDEX IF NOT EXISTS idx_filename ON documents(filename)
    ''')

    c.execute('''
        CREATE INDEX IF NOT EXISTS idx_category ON documents(category)
    ''')

    c.execute('''
        CREATE INDEX IF NOT EXISTS idx_archived ON documents(archived)
    ''')

    c.execute('''
        CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
            filename, title, content, category, tags,
            content='documents',
            content_rowid='id'
        )
    ''')

    conn.commit()
    conn.close()

def import_file(filepath, category=None, archived=False):
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
    else:
        file_type = 'other'

    # Auto-detect category from path if not provided
    if not category and filepath.parent.name != 'docs':
        category = filepath.parent.name

    created = datetime.fromtimestamp(filepath.stat().st_ctime).isoformat()
    updated = datetime.fromtimestamp(filepath.stat().st_mtime).isoformat()

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    try:
        c.execute('''
            INSERT OR REPLACE INTO documents
            (filename, title, content, category, type, size, hash, created_at, updated_at, archived)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (filepath.name, title, content, category, file_type, size, file_hash, created, updated, 1 if archived else 0))

        # Update FTS index
        c.execute('''
            INSERT OR REPLACE INTO documents_fts (rowid, filename, title, content, category)
            SELECT id, filename, title, content, category FROM documents WHERE filename = ?
        ''', (filepath.name,))

        conn.commit()
        return True
    except Exception as e:
        print(f"Error importing {filepath.name}: {e}")
        return False
    finally:
        conn.close()

def list_documents(pattern=None, category=None, archived=False):
    """List documents from database"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    query = 'SELECT filename, category, type, size, created_at FROM documents WHERE 1=1'
    params = []

    if not archived:
        query += ' AND archived = 0'

    if category:
        query += ' AND category = ?'
        params.append(category)

    if pattern:
        query += ' AND filename LIKE ?'
        params.append(f'%{pattern}%')

    query += ' ORDER BY category, filename'

    c.execute(query, params)
    results = c.fetchall()
    conn.close()

    return results

def search_documents(query, limit=20):
    """Full-text search across documents"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute('''
        SELECT d.filename, d.category, d.type,
               snippet(documents_fts, 2, '<mark>', '</mark>', '...', 60) as snippet
        FROM documents_fts fts
        JOIN documents d ON fts.rowid = d.id
        WHERE documents_fts MATCH ?
        ORDER BY rank
        LIMIT ?
    ''', (query, limit))

    results = c.fetchall()
    conn.close()

    return results

def show_document(filename):
    """Get document content"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute('SELECT content FROM documents WHERE filename = ?', (filename,))
    result = c.fetchone()
    conn.close()

    return result[0] if result else None

def get_stats():
    """Get database statistics"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute('SELECT category, type, COUNT(*), SUM(size) FROM documents WHERE archived = 0 GROUP BY category, type')
    active = c.fetchall()

    c.execute('SELECT category, COUNT(*) FROM documents WHERE archived = 1 GROUP BY category')
    archived = c.fetchall()

    c.execute('SELECT COUNT(*), SUM(size) FROM documents')
    total = c.fetchone()

    c.execute('SELECT DISTINCT category FROM documents WHERE archived = 0 ORDER BY category')
    categories = [row[0] for row in c.fetchall() if row[0]]

    conn.close()

    return {
        'active': active,
        'archived': archived,
        'total_files': total[0],
        'total_size': total[1] or 0,
        'categories': categories
    }

def archive_category(category, year=None):
    """Archive documents by category"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    query = 'UPDATE documents SET archived = 1 WHERE category = ? AND archived = 0'
    params = [category]

    if year:
        query += ' AND created_at LIKE ?'
        params.append(f'{year}%')

    c.execute(query, params)
    count = c.rowcount
    conn.commit()
    conn.close()

    return count

def main():
    parser = argparse.ArgumentParser(
        description='Documentation Manager - SQLite-backed project docs',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Storage: SQLite3 database (docs.db)

Features:
  - Full-text search (FTS5)
  - Category organization
  - Metadata tracking
  - Archive management
  - Content deduplication

Examples:
  # Initialize database
  %(prog)s init

  # Import all markdown from guides/
  %(prog)s import guides/*.md --category guides

  # List all documents
  %(prog)s list

  # List by category
  %(prog)s list --category guides

  # Search documents
  %(prog)s search "workflow"

  # Show specific document
  %(prog)s show CLAUDE.md

  # Show statistics
  %(prog)s stats

  # Archive 2026 guides
  %(prog)s archive guides --year 2026

  # Export document to file
  %(prog)s export CLAUDE.md output.md
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # init
    subparsers.add_parser('init', help='Initialize database')

    # import
    import_parser = subparsers.add_parser('import', help='Import files to database')
    import_parser.add_argument('files', nargs='+', help='Files to import')
    import_parser.add_argument('--category', type=str, help='Category name')
    import_parser.add_argument('--archived', action='store_true', help='Mark as archived')

    # create
    create_parser = subparsers.add_parser('create', help='Create document directly in database')
    create_parser.add_argument('title', type=str, help='Document title')
    create_parser.add_argument('content', type=str, help='Document content')
    create_parser.add_argument('--category', type=str, help='Category name')
    create_parser.add_argument('--type', type=str, choices=['markdown', 'text'], default='markdown', help='Document type')
    create_parser.add_argument('--archived', action='store_true', help='Mark as archived')

    # update
    update_parser = subparsers.add_parser('update', help='Update existing document')
    update_parser.add_argument('filename', type=str, help='Document filename to update')
    update_parser.add_argument('--title', type=str, help='New title')
    update_parser.add_argument('--content', type=str, help='New content')
    update_parser.add_argument('--category', type=str, help='New category')
    update_parser.add_argument('--type', type=str, choices=['markdown', 'text'], help='New type')

    # delete
    delete_parser = subparsers.add_parser('delete', help='Delete document from database')
    delete_parser.add_argument('filename', type=str, help='Document filename to delete')

    # delete-many
    delete_many_parser = subparsers.add_parser('delete-many', help='Delete multiple documents')
    delete_many_parser.add_argument('pattern', type=str, help='Pattern to match (SQL LIKE pattern, e.g., "2026-01-%%")')
    delete_many_parser.add_argument('--category', type=str, help='Filter by category')
    delete_many_parser.add_argument('--type', type=str, choices=['markdown', 'text'], help='Filter by type')
    delete_many_parser.add_argument('--archived-only', action='store_true', help='Only delete archived documents')
    delete_many_parser.add_argument('--confirm', action='store_true', help='Skip confirmation prompt')

    # list
    list_parser = subparsers.add_parser('list', help='List documents')
    list_parser.add_argument('--pattern', type=str, help='Filter by pattern')
    list_parser.add_argument('--category', type=str, help='Filter by category')
    list_parser.add_argument('--archived', action='store_true', help='Include archived')

    # search
    search_parser = subparsers.add_parser('search', help='Search documents (FTS5)')
    search_parser.add_argument('query', type=str, help='Search query')
    search_parser.add_argument('--limit', type=int, default=20, help='Max results')

    # show
    show_parser = subparsers.add_parser('show', help='Show document content')
    show_parser.add_argument('filename', type=str, help='Document filename')

    # stats
    subparsers.add_parser('stats', help='Show statistics')

    # archive
    archive_parser = subparsers.add_parser('archive', help='Archive category')
    archive_parser.add_argument('category', type=str, help='Category to archive')
    archive_parser.add_argument('--year', type=int, help='Only archive from year')

    # export
    export_parser = subparsers.add_parser('export', help='Export document to file')
    export_parser.add_argument('filename', type=str, help='Document to export')
    export_parser.add_argument('output', type=str, help='Output file')

    # categories
    subparsers.add_parser('categories', help='List all categories')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    try:
        if args.command == 'init':
            print("🔧 Initializing documentation database...")
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
                        if import_file(filepath, args.category, args.archived):
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
                    INSERT INTO documents
                    (filename, title, content, category, type, size, hash, created_at, updated_at, archived)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (filename, args.title, args.content, args.category, args.type, size, file_hash, created, updated, 1 if args.archived else 0))

                # Update FTS index
                c.execute('''
                    INSERT INTO documents_fts (rowid, filename, title, content, category)
                    SELECT id, filename, title, content, category FROM documents WHERE filename = ?
                ''', (filename,))

                conn.commit()
                print(f"✅ Created document: {filename}")
                if args.category:
                    print(f"   Category: {args.category}")
                return 0
            except Exception as e:
                print(f"❌ Error creating document: {e}")
                return 1
            finally:
                conn.close()

        elif args.command == 'list':
            docs = list_documents(args.pattern, args.category, args.archived)

            if not docs:
                print("No documents found")
                return 0

            print(f"{'Category':<20} {'Filename':<40} {'Type':<10} {'Size':<10}")
            print("-" * 85)

            for filename, category, dtype, size, created in docs:
                size_str = f"{size / 1024:.1f}K" if size > 1024 else f"{size}B"
                cat_str = category or 'root'
                print(f"{cat_str:<20} {filename:<40} {dtype:<10} {size_str:<10}")

            print(f"\nTotal: {len(docs)} documents")

        elif args.command == 'search':
            results = search_documents(args.query, args.limit)

            if not results:
                print(f"No results for: {args.query}")
                return 0

            print(f"🔍 Search results for '{args.query}'\n")

            for i, (filename, category, dtype, snippet) in enumerate(results, 1):
                cat_str = category or 'root'
                print(f"{i}. {filename} ({cat_str})")
                print(f"   {snippet}")
                print()

        elif args.command == 'show':
            content = show_document(args.filename)

            if not content:
                print(f"❌ Document not found: {args.filename}")
                return 1

            print(content)

        elif args.command == 'stats':
            stats = get_stats()

            print("📊 Documentation Statistics\n")
            print(f"Categories: {', '.join(stats['categories'])}\n")

            print("Documents by Category:")
            current_cat = None
            for category, dtype, count, size in stats['active']:
                if category != current_cat:
                    if current_cat:
                        print()
                    cat_str = category or 'root'
                    print(f"{cat_str}/")
                    current_cat = category

                size_mb = (size or 0) / (1024 * 1024)
                print(f"  {dtype:<10} {count:>5} files  {size_mb:>6.2f} MB")

            total_mb = stats['total_size'] / (1024 * 1024)
            print(f"\nTotal: {stats['total_files']} files, {total_mb:.2f} MB")

        elif args.command == 'archive':
            count = archive_category(args.category, args.year)
            year_str = f" from {args.year}" if args.year else ""
            print(f"📦 Archived {count} documents from {args.category}{year_str}")

        elif args.command == 'update':
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            try:
                updates = []
                params = []

                if args.title:
                    updates.append('title = ?')
                    params.append(args.title)

                if args.content:
                    updates.append('content = ?')
                    params.append(args.content)
                    content_bytes = args.content.encode()
                    updates.append('size = ?')
                    params.append(len(content_bytes))
                    updates.append('hash = ?')
                    params.append(hashlib.sha256(content_bytes).hexdigest())

                if args.category is not None:
                    updates.append('category = ?')
                    params.append(args.category)

                if args.type:
                    updates.append('type = ?')
                    params.append(args.type)

                if not updates:
                    print("❌ No updates specified")
                    return 1

                updates.append('updated_at = ?')
                params.append(datetime.now().isoformat())
                params.append(args.filename)

                c.execute(f"UPDATE documents SET {', '.join(updates)} WHERE filename = ?", params)

                if c.rowcount == 0:
                    print(f"❌ Document not found: {args.filename}")
                    return 1

                c.execute('''
                    INSERT OR REPLACE INTO documents_fts (rowid, filename, title, content, category)
                    SELECT id, filename, title, content, category FROM documents WHERE filename = ?
                ''', (args.filename,))

                conn.commit()
                print(f"✅ Updated document: {args.filename}")
                return 0
            except Exception as e:
                print(f"❌ Error: {e}")
                return 1
            finally:
                conn.close()

        elif args.command == 'delete':
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            try:
                c.execute('DELETE FROM documents WHERE filename = ?', (args.filename,))

                if c.rowcount == 0:
                    print(f"❌ Document not found: {args.filename}")
                    return 1

                c.execute('DELETE FROM documents_fts WHERE filename = ?', (args.filename,))

                conn.commit()
                print(f"✅ Deleted document: {args.filename}")
                return 0
            except Exception as e:
                print(f"❌ Error: {e}")
                return 1
            finally:
                conn.close()

        elif args.command == 'delete-many':
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            try:
                # Build query to find matching documents
                query = 'SELECT filename, category FROM documents WHERE filename LIKE ?'
                params = [args.pattern]

                if args.category:
                    query += ' AND category = ?'
                    params.append(args.category)

                if args.type:
                    query += ' AND type = ?'
                    params.append(args.type)

                if args.archived_only:
                    query += ' AND archived = 1'

                c.execute(query, params)
                matching = c.fetchall()

                if not matching:
                    print(f"❌ No documents found matching pattern: {args.pattern}")
                    return 1

                print(f"Found {len(matching)} documents matching pattern: {args.pattern}")
                for filename, category in matching:
                    cat_str = category or 'root'
                    print(f"  - {filename} ({cat_str})")

                if not args.confirm:
                    response = input(f"\n⚠️  Delete {len(matching)} documents? [y/N]: ")
                    if response.lower() != 'y':
                        print("❌ Cancelled")
                        return 1

                # Delete from main table
                delete_query = 'DELETE FROM documents WHERE filename LIKE ?'
                delete_params = [args.pattern]

                if args.category:
                    delete_query += ' AND category = ?'
                    delete_params.append(args.category)

                if args.type:
                    delete_query += ' AND type = ?'
                    delete_params.append(args.type)

                if args.archived_only:
                    delete_query += ' AND archived = 1'

                c.execute(delete_query, delete_params)
                deleted_count = c.rowcount

                # Delete from FTS table
                for filename, _ in matching:
                    c.execute('DELETE FROM documents_fts WHERE filename = ?', (filename,))

                conn.commit()
                print(f"✅ Deleted {deleted_count} documents")
                return 0
            except Exception as e:
                print(f"❌ Error: {e}")
                return 1
            finally:
                conn.close()

        elif args.command == 'export':
            content = show_document(args.filename)

            if not content:
                print(f"❌ Document not found: {args.filename}")
                return 1

            Path(args.output).write_text(content)
            print(f"✅ Exported to: {args.output}")

        elif args.command == 'categories':
            stats = get_stats()
            print("📁 Categories:\n")
            for cat in stats['categories']:
                print(f"  - {cat}")

        return 0

    except KeyboardInterrupt:
        print("\n⚠️  Interrupted")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
