#!/usr/bin/env python3
"""
Migrate txt and docs folders to SQLite3 databases
Imports all markdown/text files then deletes originals
"""

import sys
from pathlib import Path
import subprocess

def run_cmd(cmd, cwd=None):
    """Run command and return success"""
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False
    if result.stdout:
        print(result.stdout)
    return True

def migrate_txt():
    """Migrate txt folder to SQLite"""
    txt_dir = Path(__file__).parent / 'txt'
    print("📁 Migrating txt/ folder to SQLite...")
    print()

    # Initialize database
    if not run_cmd('python3 reports.py init', cwd=txt_dir):
        return False

    # Import active reports
    md_files = list(txt_dir.glob('*.md'))
    txt_files = list(txt_dir.glob('*.txt'))
    log_files = list(txt_dir.glob('*.log'))

    active_files = md_files + txt_files + log_files
    if active_files:
        print(f"📥 Importing {len(active_files)} active files...")
        for f in active_files:
            if run_cmd(f'python3 reports.py import "{f.name}"', cwd=txt_dir):
                print(f"  ✓ {f.name}")
                # Delete original after successful import
                f.unlink()

    # Import archived reports
    archive_dir = txt_dir / 'archive-2026'
    if archive_dir.exists():
        archived_files = list(archive_dir.glob('*.md')) + list(archive_dir.glob('*.txt')) + list(archive_dir.glob('*.log'))
        if archived_files:
            print(f"\n📦 Importing {len(archived_files)} archived files...")
            for f in archived_files:
                if run_cmd(f'python3 reports.py import "archive-2026/{f.name}" --archived', cwd=txt_dir):
                    print(f"  ✓ {f.name}")
                    f.unlink()

            # Remove empty archive directory
            try:
                archive_dir.rmdir()
                print(f"\n✅ Removed empty archive-2026/")
            except:
                pass

    # Show stats
    print("\n📊 Final txt/ database statistics:")
    run_cmd('python3 reports.py stats', cwd=txt_dir)

    print(f"\n✅ txt/ migration complete - all files imported to reports.db")
    return True

def migrate_docs():
    """Migrate docs folder to SQLite"""
    docs_dir = Path(__file__).parent / 'docs'
    print("\n📁 Migrating docs/ folder to SQLite...")
    print()

    # Initialize database
    if not run_cmd('python3 docs.py init', cwd=docs_dir):
        return False

    # Get all categories
    categories = [d for d in docs_dir.iterdir() if d.is_dir() and not d.name.startswith('.')]

    # Import root documents
    root_md = list(docs_dir.glob('*.md'))
    root_txt = list(docs_dir.glob('*.txt'))

    if root_md or root_txt:
        print(f"📥 Importing {len(root_md) + len(root_txt)} root documents...")
        for f in root_md + root_txt:
            if run_cmd(f'python3 docs.py import "{f.name}"', cwd=docs_dir):
                print(f"  ✓ {f.name}")
                f.unlink()

    # Import from each category
    for category in categories:
        cat_files = list(category.glob('*.md')) + list(category.glob('*.txt'))
        if cat_files:
            print(f"\n📥 Importing {len(cat_files)} documents from {category.name}/...")
            for f in cat_files:
                if run_cmd(f'python3 docs.py import "{category.name}/{f.name}" --category {category.name}', cwd=docs_dir):
                    print(f"  ✓ {f.name}")
                    f.unlink()

            # Try to remove category directory if empty
            try:
                if not list(category.iterdir()):
                    category.rmdir()
                    print(f"  ✅ Removed empty {category.name}/")
            except:
                pass

    # Show stats
    print("\n📊 Final docs/ database statistics:")
    run_cmd('python3 docs.py stats', cwd=docs_dir)

    print(f"\n✅ docs/ migration complete - all files imported to docs.db")
    return True

def main():
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║         MIGRATE TO SQLITE3 - DELETE MARKDOWN FILES             ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print()
    print("This script will:")
    print("  1. Import all txt/ files to reports.db (SQLite)")
    print("  2. Import all docs/ files to docs.db (SQLite)")
    print("  3. DELETE all original markdown/text files")
    print("  4. Remove empty directories")
    print()

    response = input("⚠️  Continue? This will DELETE all markdown files [y/N]: ")

    if response.lower() != 'y':
        print("❌ Cancelled")
        return 1

    print()

    # Migrate txt folder
    if not migrate_txt():
        print("❌ txt/ migration failed")
        return 1

    # Migrate docs folder
    if not migrate_docs():
        print("❌ docs/ migration failed")
        return 1

    print()
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║                 MIGRATION COMPLETE ✅                           ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print()
    print("SQLite databases created:")
    print("  - txt/reports.db")
    print("  - docs/docs.db")
    print()
    print("All markdown files deleted")
    print("Empty directories removed")
    print()
    print("Usage:")
    print("  cd txt && python3 reports.py search 'query'")
    print("  cd docs && python3 docs.py search 'query'")
    print()

    return 0

if __name__ == '__main__':
    sys.exit(main())
