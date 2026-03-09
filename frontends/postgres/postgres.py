#!/usr/bin/env python3
"""
PostgreSQL Admin Dashboard Manager
Self-documenting script for PostgreSQL administration interface
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
        description='PostgreSQL Admin Dashboard',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Features:
  - Database management UI
  - Query editor with syntax highlighting
  - Schema visualization
  - Performance monitoring
  - User and role management
  - Backup and restore tools

Tech Stack:
  - Next.js 14+
  - React 18/19
  - Material UI (migrate to FakeMUI planned)
  - PostgreSQL client

Examples:
  # Development server
  %(prog)s dev

  # Build for production
  %(prog)s build

  # Type checking
  %(prog)s typecheck

  # Run tests
  %(prog)s test

  # Clean artifacts
  %(prog)s clean

  # Database health check
  %(prog)s health
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # dev
    subparsers.add_parser('dev', help='Start development server')

    # build
    subparsers.add_parser('build', help='Build for production')

    # typecheck
    subparsers.add_parser('typecheck', help='TypeScript type checking')

    # test
    test_parser = subparsers.add_parser('test', help='Run tests')
    test_parser.add_argument('--watch', action='store_true', help='Watch mode')

    # clean
    subparsers.add_parser('clean', help='Clean build artifacts')

    # health
    subparsers.add_parser('health', help='Check database health')

    # status
    subparsers.add_parser('status', help='Show project status')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    try:
        if args.command == 'dev':
            print("🚀 Starting PostgreSQL Admin Dashboard...")
            return 0 if run_cmd('npm run dev', check=False) else 1

        elif args.command == 'build':
            print("🏗️  Building for production...")
            return 0 if run_cmd('npm run build') else 1

        elif args.command == 'typecheck':
            print("🔍 Running TypeScript type checking...")
            return 0 if run_cmd('npm run typecheck') else 1

        elif args.command == 'test':
            print("🧪 Running tests...")
            cmd = 'npm test'
            if hasattr(args, 'watch') and args.watch:
                cmd += ' -- --watch'
            return 0 if run_cmd(cmd, check=False) else 1

        elif args.command == 'clean':
            print("🧹 Cleaning build artifacts...")
            run_cmd('rm -rf .next dist node_modules/.cache', check=False)
            print("✅ Clean complete")
            return 0

        elif args.command == 'health':
            print("🏥 Checking database health...")
            # Check if PostgreSQL is accessible
            run_cmd('psql --version || echo "❌ psql not found"', check=False)
            run_cmd('pg_isready -h localhost || echo "⚠️  PostgreSQL not running"', check=False)
            return 0

        elif args.command == 'status':
            print("📊 PostgreSQL Admin Dashboard Status\n")
            run_cmd('npm list react next typescript 2>/dev/null | grep -E "(react|next|typescript)" || echo "Dependencies not installed"')
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
