#!/usr/bin/env python3
"""
Populate GitHub Project Kanban from TODO files.

This script:
1. Parses all TODO markdown files in docs/todo/
2. Extracts unchecked TODO items
3. Generates GitHub issues with appropriate labels and metadata
4. Can output to JSON or directly create issues via GitHub CLI

Usage:
    python3 populate-kanban.py --dry-run          # Preview issues
    python3 populate-kanban.py --output issues.json  # Export to JSON
    python3 populate-kanban.py --create           # Create issues (requires gh auth)
    python3 populate-kanban.py --project-id 2     # Add to specific project
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict


@dataclass
class TodoItem:
    """Represents a single TODO item."""
    title: str
    body: str
    file: str
    section: str
    labels: List[str]
    priority: str
    line_number: int
    

class TodoParser:
    """Parse TODO markdown files and extract items."""
    
    # Map TODO files to label categories
    LABEL_MAP = {
        'core': ['core', 'workflow'],
        'infrastructure': ['infrastructure'],
        'features': ['feature'],
        'improvements': ['enhancement'],
    }
    
    # Priority mapping based on README
    PRIORITY_MAP = {
        'critical': '🔴 Critical',
        'high': '🟠 High',
        'medium': '🟡 Medium',
        'low': '🟢 Low',
    }
    
    def __init__(self, todo_dir: Path):
        self.todo_dir = todo_dir
        self.readme_priorities = self._parse_readme_priorities()
        
    def _parse_readme_priorities(self) -> Dict[str, str]:
        """Parse priority information from README.md."""
        priorities = {}
        readme_path = self.todo_dir / 'README.md'
        
        if not readme_path.exists():
            return priorities
            
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Extract priority from the Quick Reference table
        pattern = r'\|\s*\[([^\]]+)\]\([^\)]+\)\s*\|[^|]*\|\s*(Critical|High|Medium|Low)\s*\|'
        matches = re.findall(pattern, content, re.MULTILINE)
        
        for filename, priority in matches:
            priorities[filename] = priority.lower()
            
        return priorities
    
    def _categorize_file(self, filepath: Path) -> List[str]:
        """Determine labels based on file location and name."""
        labels = []
        
        # Get category from directory structure
        relative = filepath.relative_to(self.todo_dir)
        parts = relative.parts
        
        if len(parts) > 1:
            category = parts[0]  # e.g., 'core', 'infrastructure', etc.
            if category in self.LABEL_MAP:
                labels.extend(self.LABEL_MAP[category])
        
        # Add specific labels based on filename
        filename = filepath.stem.lower()
        
        if 'dbal' in filename:
            labels.append('dbal')
        if 'frontend' in filename:
            labels.append('frontend')
        if 'backend' in filename:
            labels.append('backend')
        if 'test' in filename:
            labels.append('testing')
        if 'security' in filename:
            labels.append('security')
        if 'database' in filename or 'db' in filename:
            labels.append('database')
        if 'deploy' in filename:
            labels.append('deployment')
        if 'doc' in filename:
            labels.append('documentation')
        if 'package' in filename:
            labels.append('packages')
        if 'lua' in filename:
            labels.append('lua')
        if 'multi-tenant' in filename:
            labels.append('multi-tenant')
        if 'ui' in filename or 'declarative' in filename:
            labels.append('ui')
        if 'accessibility' in filename or 'a11y' in filename:
            labels.append('accessibility')
        if 'performance' in filename:
            labels.append('performance')
        if 'copilot' in filename:
            labels.append('copilot')
        if 'sdlc' in filename:
            labels.append('sdlc')
            
        return list(set(labels))  # Remove duplicates
    
    def _get_priority(self, filepath: Path) -> str:
        """Get priority level for a TODO file."""
        filename = filepath.name
        
        # Check if priority is defined in README
        if filename in self.readme_priorities:
            priority = self.readme_priorities[filename]
            return self.PRIORITY_MAP.get(priority, '🟡 Medium')
            
        # Default priorities based on patterns
        if 'critical' in filename.lower() or 'security' in filename.lower():
            return '🔴 Critical'
        elif any(x in filename.lower() for x in ['build', 'dbal', 'frontend', 'database', 'sdlc']):
            return '🟠 High'
        elif 'future' in filename.lower() or 'copilot' in filename.lower():
            return '🟢 Low'
        else:
            return '🟡 Medium'
    
    def _parse_file(self, filepath: Path) -> List[TodoItem]:
        """Parse a single TODO markdown file."""
        items = []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        current_section = "General"
        labels = self._categorize_file(filepath)
        priority = self._get_priority(filepath)
        
        for i, line in enumerate(lines, start=1):
            # Track section headers
            if line.startswith('#'):
                # Extract section name
                section_match = re.match(r'^#+\s+(.+)$', line.strip())
                if section_match:
                    current_section = section_match.group(1)
                continue
            
            # Look for unchecked TODO items
            todo_match = re.match(r'^(\s*)- \[ \]\s+(.+)$', line)
            if todo_match:
                indent, content = todo_match.groups()
                
                # Skip if it's empty or just a placeholder
                if not content.strip() or len(content.strip()) < 5:
                    continue
                
                # Build context body
                context_lines = []
                
                # Look back for context (list items, sub-items)
                for j in range(max(0, i-5), i):
                    prev_line = lines[j].strip()
                    if prev_line and not prev_line.startswith('#'):
                        if prev_line.startswith('- ['):
                            # Include related checked items for context
                            context_lines.append(prev_line)
                        elif prev_line.startswith('>'):
                            # Include blockquotes (often have important notes)
                            context_lines.append(prev_line)
                
                # Build body with file reference and section
                body_parts = [
                    f"**File:** `{filepath.relative_to(self.todo_dir.parent.parent)}`",
                    f"**Section:** {current_section}",
                    f"**Line:** {i}",
                    "",
                ]
                
                if context_lines:
                    body_parts.append("**Context:**")
                    body_parts.extend(context_lines)
                    body_parts.append("")
                
                body_parts.append(f"**Task:** {content}")
                
                item = TodoItem(
                    title=content[:100] + ('...' if len(content) > 100 else ''),
                    body='\n'.join(body_parts),
                    file=str(filepath.relative_to(self.todo_dir.parent.parent)),
                    section=current_section,
                    labels=labels,
                    priority=priority,
                    line_number=i
                )
                
                items.append(item)
        
        return items
    
    def parse_all(self) -> List[TodoItem]:
        """Parse all TODO files in the directory."""
        all_items = []
        
        # Get all .md files except README, STATUS, and SCAN reports
        todo_files_set = set()
        for pattern in ['**/*TODO*.md', '**/[0-9]*.md']:
            todo_files_set.update(self.todo_dir.glob(pattern))
        
        # Filter out special files
        exclude_patterns = ['README', 'STATUS', 'SCAN', 'REFACTOR']
        todo_files = [
            f for f in todo_files_set 
            if not any(pattern in f.name.upper() for pattern in exclude_patterns)
        ]
        
        print(f"Found {len(todo_files)} TODO files to parse")
        
        for filepath in sorted(todo_files):
            print(f"  Parsing {filepath.relative_to(self.todo_dir.parent.parent)}...")
            items = self._parse_file(filepath)
            all_items.extend(items)
            print(f"    Found {len(items)} items")
        
        return all_items


class GitHubIssueCreator:
    """Create GitHub issues from TODO items."""
    
    def __init__(self, repo: str, project_id: Optional[int] = None):
        self.repo = repo
        self.project_id = project_id
        
    def _check_gh_auth(self) -> bool:
        """Check if GitHub CLI is authenticated."""
        try:
            result = subprocess.run(
                ['gh', 'auth', 'status'],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except FileNotFoundError:
            print("ERROR: GitHub CLI (gh) not found. Please install it first.")
            return False
    
    def create_issue(self, item: TodoItem, dry_run: bool = False) -> Optional[str]:
        """Create a single GitHub issue."""
        
        if dry_run:
            print(f"\n[DRY RUN] Would create issue:")
            print(f"  Title: {item.title}")
            print(f"  Labels: {', '.join(item.labels + [item.priority])}")
            print(f"  Body preview: {item.body[:100]}...")
            return None
        
        # Build gh issue create command
        cmd = [
            'gh', 'issue', 'create',
            '--repo', self.repo,
            '--title', item.title,
            '--body', item.body,
        ]
        
        # Add labels
        all_labels = item.labels + [item.priority]
        for label in all_labels:
            cmd.extend(['--label', label])
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            issue_url = result.stdout.strip()
            print(f"  ✓ Created: {issue_url}")
            
            # Add to project if specified
            if self.project_id and issue_url:
                self._add_to_project(issue_url)
            
            return issue_url
            
        except subprocess.CalledProcessError as e:
            print(f"  ✗ Failed to create issue: {e.stderr}")
            return None
    
    def _add_to_project(self, issue_url: str):
        """Add an issue to a GitHub project."""
        try:
            subprocess.run(
                [
                    'gh', 'project', 'item-add', str(self.project_id),
                    '--owner', self.repo.split('/')[0],
                    '--url', issue_url
                ],
                capture_output=True,
                text=True,
                check=True
            )
            print(f"    ✓ Added to project {self.project_id}")
        except subprocess.CalledProcessError as e:
            print(f"    ✗ Failed to add to project: {e.stderr}")
    
    def create_all(self, items: List[TodoItem], dry_run: bool = False, 
                   batch_size: int = 10) -> List[str]:
        """Create issues for all TODO items."""
        
        if not dry_run and not self._check_gh_auth():
            print("ERROR: GitHub CLI is not authenticated. Run 'gh auth login' first.")
            return []
        
        print(f"\nCreating {len(items)} issues...")
        
        if dry_run:
            print("\n[DRY RUN MODE - No issues will be created]")
        
        created_urls = []
        
        for i, item in enumerate(items, start=1):
            print(f"\n[{i}/{len(items)}] {item.title[:60]}...")
            
            url = self.create_issue(item, dry_run=dry_run)
            if url:
                created_urls.append(url)
            
            # Pause after batch to avoid rate limiting
            if not dry_run and i % batch_size == 0 and i < len(items):
                print(f"\n  Pausing after {batch_size} issues (rate limiting)...")
                import time
                time.sleep(2)
        
        return created_urls


def main():
    parser = argparse.ArgumentParser(
        description='Populate GitHub Project Kanban from TODO files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview issues without creating them'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        help='Export issues to JSON file instead of creating them'
    )
    
    parser.add_argument(
        '--create',
        action='store_true',
        help='Create issues on GitHub (requires gh auth)'
    )
    
    parser.add_argument(
        '--project-id',
        type=int,
        default=2,
        help='GitHub project ID to add issues to (default: 2)'
    )
    
    parser.add_argument(
        '--repo',
        type=str,
        default='johndoe6345789/metabuilder',
        help='GitHub repository (default: johndoe6345789/metabuilder)'
    )
    
    parser.add_argument(
        '--todo-dir',
        type=Path,
        help='Path to docs/todo directory (default: auto-detect)'
    )
    
    parser.add_argument(
        '--limit',
        type=int,
        help='Limit number of issues to create (for testing)'
    )
    
    args = parser.parse_args()
    
    # Auto-detect todo directory if not specified
    if args.todo_dir is None:
        script_dir = Path(__file__).parent
        repo_root = script_dir.parent.parent
        args.todo_dir = repo_root / 'docs' / 'todo'
    
    if not args.todo_dir.exists():
        print(f"ERROR: TODO directory not found: {args.todo_dir}")
        sys.exit(1)
    
    print(f"Parsing TODO files from: {args.todo_dir}")
    
    # Parse TODO files
    parser_obj = TodoParser(args.todo_dir)
    items = parser_obj.parse_all()
    
    if args.limit:
        items = items[:args.limit]
        print(f"\nLimited to first {args.limit} items")
    
    print(f"\n{'='*60}")
    print(f"Total TODO items found: {len(items)}")
    print(f"{'='*60}")
    
    # Output summary by priority
    priority_counts = {}
    for item in items:
        priority_counts[item.priority] = priority_counts.get(item.priority, 0) + 1
    
    print("\nBreakdown by priority:")
    for priority in ['🔴 Critical', '🟠 High', '🟡 Medium', '🟢 Low']:
        count = priority_counts.get(priority, 0)
        if count > 0:
            print(f"  {priority}: {count}")
    
    # Output summary by label
    label_counts = {}
    for item in items:
        for label in item.labels:
            label_counts[label] = label_counts.get(label, 0) + 1
    
    print("\nBreakdown by label:")
    for label, count in sorted(label_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"  {label}: {count}")
    
    # Export to JSON if requested
    if args.output:
        output_path = Path(args.output)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump([asdict(item) for item in items], f, indent=2)
        print(f"\n✓ Exported {len(items)} items to {output_path}")
        return
    
    # Create issues if requested
    if args.create or args.dry_run:
        creator = GitHubIssueCreator(args.repo, args.project_id)
        created = creator.create_all(items, dry_run=args.dry_run)
        
        if not args.dry_run:
            print(f"\n{'='*60}")
            print(f"Successfully created {len(created)} issues")
            print(f"{'='*60}")
    else:
        print("\nTo create issues, run with --create or --dry-run")
        print("Example: python3 populate-kanban.py --dry-run")


if __name__ == '__main__':
    main()
