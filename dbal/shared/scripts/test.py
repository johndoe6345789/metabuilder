#!/usr/bin/env python3
"""
Test runner for DBAL
Runs unit tests, integration tests, and conformance tests
"""

import subprocess
import sys
from pathlib import Path
import argparse


def test_typescript(root_dir: Path, test_type: str = 'all') -> bool:
    """Run TypeScript tests"""
    print(f"\n=== Running TypeScript {test_type} Tests ===")
    ts_dir = root_dir / 'ts'
    
    test_commands = {
        'unit': ['npm', 'run', 'test:unit'],
        'integration': ['npm', 'run', 'test:integration'],
        'all': ['npm', 'test']
    }
    
    try:
        subprocess.run(test_commands[test_type], cwd=ts_dir, check=True)
        print(f"✓ TypeScript {test_type} tests passed")
        return True
    except subprocess.CalledProcessError:
        print(f"✗ TypeScript {test_type} tests failed", file=sys.stderr)
        return False


def test_cpp(root_dir: Path, test_type: str = 'all') -> bool:
    """Run C++ tests"""
    print(f"\n=== Running C++ {test_type} Tests ===")
    build_dir = root_dir / 'cpp' / 'build'
    
    if not build_dir.exists():
        print("✗ C++ build directory not found. Run build.py first.", file=sys.stderr)
        return False
    
    test_executables = {
        'unit': ['./unit_tests'],
        'integration': ['./integration_tests'],
        'all': ['ctest', '--output-on-failure']
    }
    
    try:
        subprocess.run(test_executables[test_type], cwd=build_dir, check=True)
        print(f"✓ C++ {test_type} tests passed")
        return True
    except subprocess.CalledProcessError:
        print(f"✗ C++ {test_type} tests failed", file=sys.stderr)
        return False


def test_conformance(root_dir: Path) -> bool:
    """Run conformance tests"""
    print("\n=== Running Conformance Tests ===")
    conformance_script = root_dir / 'tools' / 'conformance' / 'run_all.py'
    
    try:
        subprocess.run(['python3', str(conformance_script)], check=True)
        print("✓ Conformance tests passed")
        return True
    except subprocess.CalledProcessError:
        print("✗ Conformance tests failed", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description='Run DBAL tests')
    parser.add_argument('--type', default='all', choices=['unit', 'integration', 'conformance', 'all'],
                        help='Type of tests to run')
    parser.add_argument('--lang', default='all', choices=['ts', 'cpp', 'all'],
                        help='Language implementation to test')
    args = parser.parse_args()
    
    root_dir = Path(__file__).parent.parent
    
    print("DBAL Test Runner")
    print("=" * 60)
    
    success = True
    
    if args.type == 'conformance' or args.type == 'all':
        success = test_conformance(root_dir) and success
    else:
        if args.lang in ['ts', 'all']:
            success = test_typescript(root_dir, args.type) and success
        
        if args.lang in ['cpp', 'all']:
            success = test_cpp(root_dir, args.type) and success
    
    if success:
        print("\n✓ All tests passed!")
        return 0
    else:
        print("\n✗ Some tests failed", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
