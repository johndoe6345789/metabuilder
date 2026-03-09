#!/usr/bin/env python3
"""
Pastebin Manager
Self-documenting script for code snippet sharing application
"""

import argparse
import subprocess
import sys
from pathlib import Path

def run_cmd(cmd, check=True):
    """Run shell command"""
    result = subprocess.run(cmd, shell=True, check=check)
    return result.returncode == 0

def main():
    parser = argparse.ArgumentParser(
        description='Pastebin - Code Snippet Sharing Application',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Tech Stack:
  - Next.js 14+ (React 18/19)
  - TypeScript 5.9+
  - Tailwind CSS 4.x
  - Redux Toolkit 2.5
  - Playwright E2E tests

Features:
  - Code snippet sharing with syntax highlighting
  - Multi-user collaboration
  - Version control for snippets
  - Public/private snippet visibility
  - Rate limiting and security

Examples:
  # Development server
  %(prog)s dev

  # Build for production
  %(prog)s build

  # Run tests
  %(prog)s test

  # Run E2E tests
  %(prog)s test:e2e

  # Type checking
  %(prog)s typecheck

  # Clean artifacts
  %(prog)s clean
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # dev
    subparsers.add_parser('dev', help='Start development server')

    # build
    subparsers.add_parser('build', help='Build for production')

    # test
    test_parser = subparsers.add_parser('test', help='Run unit tests')
    test_parser.add_argument('--watch', action='store_true', help='Watch mode')
    test_parser.add_argument('--coverage', action='store_true', help='Generate coverage')

    # test:e2e
    e2e_parser = subparsers.add_parser('test:e2e', help='Run E2E tests')
    e2e_parser.add_argument('--ui', action='store_true', help='Interactive UI mode')
    e2e_parser.add_argument('--headed', action='store_true', help='Headed mode (show browser)')

    # typecheck
    subparsers.add_parser('typecheck', help='Run TypeScript type checking')

    # lint
    lint_parser = subparsers.add_parser('lint', help='Run ESLint')
    lint_parser.add_argument('--fix', action='store_true', help='Auto-fix issues')

    # clean
    subparsers.add_parser('clean', help='Clean build artifacts')

    # status
    subparsers.add_parser('status', help='Show project status')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    cwd = Path(__file__).parent

    try:
        if args.command == 'dev':
            print("🚀 Starting Pastebin development server...")
            return 0 if run_cmd('npm run dev', check=False) else 1

        elif args.command == 'build':
            print("🏗️  Building Pastebin for production...")
            return 0 if run_cmd('npm run build') else 1

        elif args.command == 'test':
            print("🧪 Running unit tests...")
            cmd = 'npm test'
            if hasattr(args, 'watch') and args.watch:
                cmd += ' -- --watch'
            elif hasattr(args, 'coverage') and args.coverage:
                cmd += ' -- --coverage'
            return 0 if run_cmd(cmd, check=False) else 1

        elif args.command == 'test:e2e':
            print("🧪 Running E2E tests...")
            cmd = 'npx playwright test'
            if hasattr(args, 'ui') and args.ui:
                cmd += ' --ui'
            elif hasattr(args, 'headed') and args.headed:
                cmd += ' --headed'
            return 0 if run_cmd(cmd, check=False) else 1

        elif args.command == 'typecheck':
            print("🔍 Running TypeScript type checking...")
            return 0 if run_cmd('npm run typecheck') else 1

        elif args.command == 'lint':
            print("🔍 Running ESLint...")
            cmd = 'npm run lint'
            if hasattr(args, 'fix') and args.fix:
                cmd += ' -- --fix'
            return 0 if run_cmd(cmd, check=False) else 1

        elif args.command == 'clean':
            print("🧹 Cleaning build artifacts...")
            run_cmd('rm -rf .next dist node_modules/.cache playwright-report test-results', check=False)
            print("✅ Clean complete")
            return 0

        elif args.command == 'status':
            print("📊 Pastebin Status\n")
            run_cmd('echo "Node: $(node -v)"')
            run_cmd('echo "npm: $(npm -v)"')
            run_cmd('echo "TypeScript: $(npx tsc --version)"')
            run_cmd('git branch --show-current 2>/dev/null && git log -1 --oneline || echo "Not a git repo"')
            return 0

        return 0

    except KeyboardInterrupt:
        print("\n⚠️  Interrupted")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
