#!/usr/bin/env python3
"""
Main build script for DBAL
Builds both TypeScript and C++ implementations
"""

import subprocess
import sys
from pathlib import Path
import argparse


def build_typescript(root_dir: Path) -> bool:
    """Build TypeScript implementation"""
    print("\n=== Building TypeScript Implementation ===")
    ts_dir = root_dir / 'ts'
    
    try:
        subprocess.run(['npm', 'install'], cwd=ts_dir, check=True)
        subprocess.run(['npm', 'run', 'build'], cwd=ts_dir, check=True)
        print("✓ TypeScript build complete")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ TypeScript build failed: {e}", file=sys.stderr)
        return False


def build_cpp(root_dir: Path, build_type: str = 'Release') -> bool:
    """Build C++ implementation"""
    print("\n=== Building C++ Implementation ===")
    cpp_dir = root_dir / 'cpp'
    build_dir = cpp_dir / 'build'
    
    try:
        build_dir.mkdir(exist_ok=True)
        
        subprocess.run([
            'cmake',
            '..',
            f'-DCMAKE_BUILD_TYPE={build_type}'
        ], cwd=build_dir, check=True)
        
        subprocess.run([
            'cmake',
            '--build',
            '.',
            '--parallel'
        ], cwd=build_dir, check=True)
        
        print("✓ C++ build complete")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ C++ build failed: {e}", file=sys.stderr)
        return False


def codegen(root_dir: Path) -> bool:
    """Run code generation"""
    print("\n=== Running Code Generation ===")
    codegen_script = root_dir / 'tools' / 'codegen' / 'gen_types.py'
    
    try:
        subprocess.run(['python3', str(codegen_script)], check=True)
        print("✓ Code generation complete")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Code generation failed: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description='Build DBAL implementations')
    parser.add_argument('--skip-ts', action='store_true', help='Skip TypeScript build')
    parser.add_argument('--skip-cpp', action='store_true', help='Skip C++ build')
    parser.add_argument('--skip-codegen', action='store_true', help='Skip code generation')
    parser.add_argument('--build-type', default='Release', choices=['Debug', 'Release'],
                        help='C++ build type')
    args = parser.parse_args()
    
    root_dir = Path(__file__).parent.parent
    
    print("DBAL Build System")
    print("=" * 60)
    
    success = True
    
    if not args.skip_codegen:
        success = codegen(root_dir) and success
    
    if not args.skip_ts:
        success = build_typescript(root_dir) and success
    
    if not args.skip_cpp:
        success = build_cpp(root_dir, args.build_type) and success
    
    if success:
        print("\n✓ Build complete!")
        return 0
    else:
        print("\n✗ Build failed", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
