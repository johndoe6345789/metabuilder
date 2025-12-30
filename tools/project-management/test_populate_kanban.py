#!/usr/bin/env python3
"""
Unit tests for populate-kanban.py

Run with: python3 -m pytest test_populate_kanban.py -v
Or: python3 test_populate_kanban.py
"""

import sys
import unittest
from pathlib import Path
from textwrap import dedent
import tempfile
import shutil

# Import the module we're testing
sys.path.insert(0, str(Path(__file__).parent))
import importlib.util
spec = importlib.util.spec_from_file_location("populate_kanban", Path(__file__).parent / "populate-kanban.py")
populate_kanban = importlib.util.module_from_spec(spec)
spec.loader.exec_module(populate_kanban)
TodoParser = populate_kanban.TodoParser
TodoItem = populate_kanban.TodoItem
GitHubIssueCreator = populate_kanban.GitHubIssueCreator


class TestTodoParser(unittest.TestCase):
    """Test TodoParser class"""
    
    def setUp(self):
        """Create a temporary directory for test files"""
        self.test_dir = Path(tempfile.mkdtemp())
        self.todo_dir = self.test_dir / "docs" / "todo"
        self.todo_dir.mkdir(parents=True, exist_ok=True)
        
        # Create README with priority mappings
        readme_content = dedent("""
            # MetaBuilder TODO List
            
            ## Quick Reference
            
            | File | Area | Priority |
            |------|------|----------|
            | [test-high.md](test-high.md) | Testing | High |
            | [test-critical.md](test-critical.md) | Critical tasks | Critical |
            | [test-medium.md](test-medium.md) | Medium priority | Medium |
        """)
        (self.todo_dir / "README.md").write_text(readme_content)
    
    def tearDown(self):
        """Clean up temporary directory"""
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_parse_simple_todo(self):
        """Test parsing a simple TODO item"""
        test_file = self.todo_dir / "test.md"
        content = dedent("""
            # Test TODO File
            
            ## Section One
            
            - [ ] This is a simple TODO item
            - [x] This is done, should be skipped
            - [ ] This is another TODO
        """)
        test_file.write_text(content)
        
        parser = TodoParser(self.todo_dir)
        items = parser._parse_file(test_file)
        
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0].title, "This is a simple TODO item")
        self.assertEqual(items[0].section, "Section One")
        self.assertEqual(items[1].title, "This is another TODO")
    
    def test_skip_empty_todos(self):
        """Test that empty TODO items are skipped"""
        test_file = self.todo_dir / "test.md"
        content = dedent("""
            # Test
            
            - [ ] 
            - [ ] a
            - [ ] Valid TODO item
        """)
        test_file.write_text(content)
        
        parser = TodoParser(self.todo_dir)
        items = parser._parse_file(test_file)
        
        # Should skip empty and very short items
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].title, "Valid TODO item")
    
    def test_parse_with_context(self):
        """Test parsing TODO items with context"""
        test_file = self.todo_dir / "test.md"
        content = dedent("""
            # Test
            
            ## Authentication
            
            - [x] Implement login
            - [x] Add password hashing
            - [ ] Add two-factor authentication
        """)
        test_file.write_text(content)
        
        parser = TodoParser(self.todo_dir)
        items = parser._parse_file(test_file)
        
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].title, "Add two-factor authentication")
        self.assertEqual(items[0].section, "Authentication")
        # Check that context includes previous items
        self.assertIn("[x]", items[0].body)
    
    def test_categorize_file_by_name(self):
        """Test file categorization based on filename"""
        parser = TodoParser(self.todo_dir)
        
        # Test DBAL file
        dbal_file = self.todo_dir / "4-DBAL-TODO.md"
        dbal_file.write_text("# DBAL\n- [ ] Test\n")
        labels = parser._categorize_file(dbal_file)
        self.assertIn("dbal", labels)
        
        # Test security file
        security_file = self.todo_dir / "10-SECURITY-TODO.md"
        security_file.write_text("# Security\n- [ ] Test\n")
        labels = parser._categorize_file(security_file)
        self.assertIn("security", labels)
        
        # Test frontend file
        frontend_file = self.todo_dir / "5-FRONTEND-TODO.md"
        frontend_file.write_text("# Frontend\n- [ ] Test\n")
        labels = parser._categorize_file(frontend_file)
        self.assertIn("frontend", labels)
    
    def test_categorize_file_by_directory(self):
        """Test file categorization based on directory"""
        parser = TodoParser(self.todo_dir)
        
        # Test core directory
        core_dir = self.todo_dir / "core"
        core_dir.mkdir(exist_ok=True)
        core_file = core_dir / "test.md"
        core_file.write_text("# Test\n- [ ] Item\n")
        labels = parser._categorize_file(core_file)
        self.assertIn("core", labels)
        
        # Test infrastructure directory
        infra_dir = self.todo_dir / "infrastructure"
        infra_dir.mkdir(exist_ok=True)
        infra_file = infra_dir / "test.md"
        infra_file.write_text("# Test\n- [ ] Item\n")
        labels = parser._categorize_file(infra_file)
        self.assertIn("infrastructure", labels)
    
    def test_get_priority_from_readme(self):
        """Test priority assignment from README"""
        parser = TodoParser(self.todo_dir)
        
        high_file = self.todo_dir / "test-high.md"
        priority = parser._get_priority(high_file)
        self.assertEqual(priority, "🟠 High")
        
        critical_file = self.todo_dir / "test-critical.md"
        priority = parser._get_priority(critical_file)
        self.assertEqual(priority, "🔴 Critical")
        
        medium_file = self.todo_dir / "test-medium.md"
        priority = parser._get_priority(medium_file)
        self.assertEqual(priority, "🟡 Medium")
    
    def test_get_priority_default(self):
        """Test default priority assignment"""
        parser = TodoParser(self.todo_dir)
        
        # Security should be critical by default
        security_file = self.todo_dir / "security-tasks.md"
        priority = parser._get_priority(security_file)
        self.assertEqual(priority, "🔴 Critical")
        
        # Future features should be low
        future_file = self.todo_dir / "future-features.md"
        priority = parser._get_priority(future_file)
        self.assertEqual(priority, "🟢 Low")
        
        # Unknown should be medium
        unknown_file = self.todo_dir / "random-tasks.md"
        priority = parser._get_priority(unknown_file)
        self.assertEqual(priority, "🟡 Medium")
    
    def test_parse_all_excludes_special_files(self):
        """Test that special files are excluded from parsing"""
        # Create some TODO files
        (self.todo_dir / "1-TODO.md").write_text("# Test\n- [ ] Item 1\n")
        (self.todo_dir / "README.md").write_text("# README\n- [ ] Should skip\n")
        (self.todo_dir / "TODO_STATUS.md").write_text("# Status\n- [ ] Should skip\n")
        (self.todo_dir / "TODO_SCAN_REPORT.md").write_text("# Scan\n- [ ] Should skip\n")
        (self.todo_dir / "REFACTOR_PLAN.md").write_text("# Refactor\n- [ ] Should skip\n")
        
        parser = TodoParser(self.todo_dir)
        items = parser.parse_all()
        
        # Should only parse 1-TODO.md
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].title, "Item 1")
    
    def test_title_truncation(self):
        """Test that long titles are truncated"""
        test_file = self.todo_dir / "test.md"
        long_title = "A" * 150
        content = f"# Test\n- [ ] {long_title}\n"
        test_file.write_text(content)
        
        parser = TodoParser(self.todo_dir)
        items = parser._parse_file(test_file)
        
        self.assertEqual(len(items), 1)
        self.assertEqual(len(items[0].title), 103)  # 100 + "..."
        self.assertTrue(items[0].title.endswith("..."))
    
    def test_section_tracking(self):
        """Test that section headers are tracked correctly"""
        test_file = self.todo_dir / "test.md"
        content = dedent("""
            # Main Title
            
            ## Section A
            - [ ] Item in A
            
            ## Section B
            - [ ] Item in B
            
            ### Subsection B.1
            - [ ] Item in B.1
        """)
        test_file.write_text(content)
        
        parser = TodoParser(self.todo_dir)
        items = parser._parse_file(test_file)
        
        self.assertEqual(len(items), 3)
        self.assertEqual(items[0].section, "Section A")
        self.assertEqual(items[1].section, "Section B")
        self.assertEqual(items[2].section, "Subsection B.1")
    
    def test_line_number_tracking(self):
        """Test that line numbers are tracked correctly"""
        test_file = self.todo_dir / "test.md"
        # Note: dedent() adds a leading newline, so lines are 1-indexed from the first actual line
        content = "# Test\n\n- [ ] Item on line 3\n\n- [ ] Item on line 5\n"
        test_file.write_text(content)
        
        parser = TodoParser(self.todo_dir)
        items = parser._parse_file(test_file)
        
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0].line_number, 3)
        self.assertEqual(items[1].line_number, 5)


class TestTodoItem(unittest.TestCase):
    """Test TodoItem dataclass"""
    
    def test_todo_item_creation(self):
        """Test creating a TodoItem"""
        item = TodoItem(
            title="Test Task",
            body="This is a test body",
            file="test.md",
            section="Test Section",
            labels=["test", "demo"],
            priority="🟡 Medium",
            line_number=42
        )
        
        self.assertEqual(item.title, "Test Task")
        self.assertEqual(item.body, "This is a test body")
        self.assertEqual(item.file, "test.md")
        self.assertEqual(item.section, "Test Section")
        self.assertEqual(item.labels, ["test", "demo"])
        self.assertEqual(item.priority, "🟡 Medium")
        self.assertEqual(item.line_number, 42)


class TestGitHubIssueCreator(unittest.TestCase):
    """Test GitHubIssueCreator class"""
    
    def test_issue_creator_initialization(self):
        """Test creating a GitHubIssueCreator"""
        creator = GitHubIssueCreator("owner/repo", project_id=5)
        
        self.assertEqual(creator.repo, "owner/repo")
        self.assertEqual(creator.project_id, 5)
    
    def test_issue_creator_without_project(self):
        """Test creating a GitHubIssueCreator without project"""
        creator = GitHubIssueCreator("owner/repo")
        
        self.assertEqual(creator.repo, "owner/repo")
        self.assertIsNone(creator.project_id)
    
    def test_create_issue_dry_run(self):
        """Test dry run mode doesn't create actual issues"""
        creator = GitHubIssueCreator("owner/repo")
        item = TodoItem(
            title="Test",
            body="Body",
            file="test.md",
            section="Section",
            labels=["test"],
            priority="🟡 Medium",
            line_number=1
        )
        
        result = creator.create_issue(item, dry_run=True)
        self.assertIsNone(result)


def run_tests():
    """Run all tests"""
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(run_tests())
