#!/usr/bin/env python3
"""
Check for new TODO items added since last check.

This script compares the current TODO items with a baseline and reports new items.
Useful for detecting when new TODOs are added that should become GitHub issues.

Usage:
    python3 check-new-todos.py [--baseline FILE] [--save-baseline]
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Set, List

# Import TodoParser from populate-kanban.py
import importlib.util
script_dir = Path(__file__).parent
spec = importlib.util.spec_from_file_location("populate_kanban", script_dir / "populate-kanban.py")
populate_kanban = importlib.util.module_from_spec(spec)
spec.loader.exec_module(populate_kanban)
TodoParser = populate_kanban.TodoParser


def get_todo_signatures(items: List) -> Set[str]:
    """Generate unique signatures for TODO items."""
    signatures = set()
    for item in items:
        # Create signature from file, line number, and truncated title
        sig = f"{item.file}:{item.line_number}:{item.title[:50]}"
        signatures.add(sig)
    return signatures


def main():
    parser = argparse.ArgumentParser(
        description='Check for new TODO items',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        '--baseline',
        type=Path,
        default=Path('todos-baseline.json'),
        help='Path to baseline file (default: todos-baseline.json)'
    )
    
    parser.add_argument(
        '--save-baseline',
        action='store_true',
        help='Save current TODOs as new baseline'
    )
    
    parser.add_argument(
        '--todo-dir',
        type=Path,
        help='Path to docs/todo directory (default: auto-detect)'
    )
    
    args = parser.parse_args()
    
    # Auto-detect todo directory if not specified
    if args.todo_dir is None:
        repo_root = script_dir.parent.parent
        args.todo_dir = repo_root / 'docs' / 'todo'
    
    if not args.todo_dir.exists():
        print(f"ERROR: TODO directory not found: {args.todo_dir}")
        sys.exit(1)
    
    # Parse current TODOs
    print(f"Parsing TODO files from: {args.todo_dir}")
    parser_obj = TodoParser(args.todo_dir)
    current_items = parser_obj.parse_all()
    current_signatures = get_todo_signatures(current_items)
    
    print(f"Found {len(current_items)} TODO items")
    
    # Save baseline if requested
    if args.save_baseline:
        baseline_data = {
            'count': len(current_items),
            'signatures': list(current_signatures)
        }
        with open(args.baseline, 'w', encoding='utf-8') as f:
            json.dump(baseline_data, f, indent=2)
        print(f"\n✓ Saved baseline to: {args.baseline}")
        return
    
    # Load baseline for comparison
    if not args.baseline.exists():
        print(f"\nℹ️ No baseline file found at: {args.baseline}")
        print("Run with --save-baseline to create initial baseline")
        sys.exit(0)
    
    with open(args.baseline, 'r', encoding='utf-8') as f:
        baseline_data = json.load(f)
    
    baseline_signatures = set(baseline_data['signatures'])
    baseline_count = baseline_data['count']
    
    # Find new items
    new_signatures = current_signatures - baseline_signatures
    removed_signatures = baseline_signatures - current_signatures
    
    print(f"\n{'='*60}")
    print(f"TODO Items Comparison")
    print(f"{'='*60}")
    print(f"Baseline count: {baseline_count}")
    print(f"Current count:  {len(current_items)}")
    print(f"Net change:     {len(current_items) - baseline_count:+d}")
    print(f"\nNew items:      {len(new_signatures)}")
    print(f"Removed items:  {len(removed_signatures)}")
    
    # Show new items
    if new_signatures:
        print(f"\n{'='*60}")
        print(f"New TODO Items ({len(new_signatures)})")
        print(f"{'='*60}")
        
        # Find full details of new items
        new_items = [
            item for item in current_items
            if f"{item.file}:{item.line_number}:{item.title[:50]}" in new_signatures
        ]
        
        for i, item in enumerate(new_items[:20], 1):  # Show first 20
            print(f"\n{i}. {item.title[:80]}")
            print(f"   File: {item.file}:{item.line_number}")
            print(f"   Section: {item.section}")
            print(f"   Priority: {item.priority}")
            print(f"   Labels: {', '.join(item.labels)}")
        
        if len(new_items) > 20:
            print(f"\n... and {len(new_items) - 20} more")
        
        print(f"\n{'='*60}")
        print(f"💡 Tip: Create issues for these new items:")
        print(f"   python3 tools/project-management/populate-kanban.py --create --limit {len(new_items)}")
        print(f"{'='*60}")
    
    # Show removed items
    if removed_signatures:
        print(f"\n{'='*60}")
        print(f"Removed TODO Items ({len(removed_signatures)})")
        print(f"{'='*60}")
        
        for i, sig in enumerate(list(removed_signatures)[:10], 1):
            print(f"{i}. {sig}")
        
        if len(removed_signatures) > 10:
            print(f"... and {len(removed_signatures) - 10} more")
    
    # Exit with status code based on changes
    if new_signatures:
        sys.exit(1)  # New items found
    else:
        print("\n✓ No new TODO items since baseline")
        sys.exit(0)


if __name__ == '__main__':
    main()
