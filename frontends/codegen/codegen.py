#!/usr/bin/env python3
"""
CodeForge IDE Manager
Self-documenting script for managing the low-code React application builder
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
        description='CodeForge IDE - Low-Code React Application Builder',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Architecture:
  - 420 TSX components (legacy - being phased out)
  - 338 JSON definitions (target architecture)
  - 342 component registry entries
  - 19 JSON implementations complete

Migration Progress:
  - 153 duplicates identified (TSX + JSON)
  - 141 duplicate TSX files deleted
  - 62.3% JSON coverage achieved (optimal)
  - Framework layer (180 TSX) vs Application layer (256+ JSON)

Examples:
  # Development server
  %(prog)s dev

  # Build for production
  %(prog)s build

  # Run audit (migration status)
  %(prog)s audit

  # Type checking
  %(prog)s typecheck

  # Run tests
  %(prog)s test

  # Clean build artifacts
  %(prog)s clean
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # dev
    subparsers.add_parser('dev', help='Start development server')

    # build
    subparsers.add_parser('build', help='Build for production')

    # audit
    audit_parser = subparsers.add_parser('audit', help='Audit JSON migration status')
    audit_parser.add_argument('--json', action='store_true', help='Output as JSON')

    # typecheck
    subparsers.add_parser('typecheck', help='Run TypeScript type checking')

    # test
    test_parser = subparsers.add_parser('test', help='Run tests')
    test_parser.add_argument('--watch', action='store_true', help='Watch mode')
    test_parser.add_argument('--coverage', action='store_true', help='Generate coverage report')

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
            print("🚀 Starting CodeForge IDE development server...")
            return 0 if run_cmd('npm run dev', check=False) else 1

        elif args.command == 'build':
            print("🏗️  Building CodeForge IDE for production...")
            return 0 if run_cmd('npm run build') else 1

        elif args.command == 'audit':
            print("📊 Auditing JSON migration status...")
            cmd = 'npm run audit:json'
            if hasattr(args, 'json') and args.json:
                cmd += ' -- --json'
            return 0 if run_cmd(cmd) else 1

        elif args.command == 'typecheck':
            print("🔍 Running TypeScript type checking...")
            return 0 if run_cmd('npm run typecheck') else 1

        elif args.command == 'test':
            print("🧪 Running tests...")
            cmd = 'npm test'
            if hasattr(args, 'watch') and args.watch:
                cmd += ' -- --watch'
            elif hasattr(args, 'coverage') and args.coverage:
                cmd += ' -- --coverage'
            return 0 if run_cmd(cmd, check=False) else 1

        elif args.command == 'clean':
            print("🧹 Cleaning build artifacts...")
            run_cmd('rm -rf .next dist node_modules/.cache', check=False)
            print("✅ Clean complete")
            return 0

        elif args.command == 'status':
            print("📊 CodeForge IDE Status\n")
            print("Architecture:")
            run_cmd('echo "  TSX Components: $(find src/components -name \"*.tsx\" | wc -l)"')
            run_cmd('echo "  JSON Definitions: $(find src/config/pages -name \"*.json\" | wc -l)"')
            run_cmd('echo "  Registry Entries: $(cat json-components-registry.json | grep \'\"type\"\' | wc -l)"')
            print("\nMigration Progress:")
            run_cmd('npm run audit:json 2>&1 | grep -E "(Complete|Remaining|Coverage)" || echo "  Run: codegen.py audit"')
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
