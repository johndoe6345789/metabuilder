#!/usr/bin/env python3
"""
Multi-Backend Test Matrix for DBAL Daemon
Tests all supported database backends with the same integration test suite
"""

import subprocess
import sys
import time
import json
from pathlib import Path
from typing import Dict, List, Tuple

# Backend configurations
BACKENDS = {
    'sqlite': {
        'adapter': 'sqlite',
        'database_url': ':memory:',
        'setup_required': False,
    },
    'sqlite_file': {
        'adapter': 'sqlite',
        'database_url': '/tmp/metabuilder_test.db',
        'setup_required': False,
    },
    'postgres': {
        'adapter': 'postgres',
        'database_url': 'postgresql://metabuilder:metabuilder@postgres:5432/metabuilder',
        'setup_required': True,
        'wait_for_healthy': True,
    },
    'mysql': {
        'adapter': 'mysql',
        'database_url': 'mysql://metabuilder:metabuilder@mysql:3306/metabuilder',
        'setup_required': True,
        'wait_for_healthy': True,
    },
    'mongodb': {
        'adapter': 'mongodb',
        'database_url': 'mongodb://metabuilder:metabuilder@mongodb:27017/metabuilder?authSource=admin',
        'setup_required': True,
        'wait_for_healthy': True,
    },
    'prisma_postgres': {
        'adapter': 'prisma',
        'database_url': 'postgresql://metabuilder:metabuilder@postgres:5432/metabuilder_prisma',
        'setup_required': True,
        'wait_for_healthy': True,
        'prisma_schema_gen': True,
    },
    'supabase_rest': {
        'adapter': 'supabase',
        'database_url': 'https://your-project.supabase.co',
        'setup_required': True,
        'wait_for_healthy': False,
        'supabase_mode': 'rest',
        'supabase_key': 'YOUR_SUPABASE_ANON_KEY',  # Set via env var
    },
    'supabase_postgres': {
        'adapter': 'supabase',
        'database_url': 'postgresql://postgres:postgres@db.your-project.supabase.co:5432/postgres',
        'setup_required': True,
        'wait_for_healthy': False,
        'supabase_mode': 'postgres',
    },
    'cockroachdb': {
        'adapter': 'postgres',  # PostgreSQL-compatible
        'database_url': 'postgresql://root@cockroachdb:26257/metabuilder?sslmode=disable',
        'setup_required': True,
        'wait_for_healthy': True,
    },
    'redis': {
        'adapter': 'redis',
        'database_url': 'redis://redis:6379/0',
        'setup_required': True,
        'wait_for_healthy': True,
    },
    'cassandra': {
        'adapter': 'cassandra',
        'database_url': 'cassandra://cassandra:9042/metabuilder',
        'setup_required': True,
        'wait_for_healthy': True,
    },
    'mariadb': {
        'adapter': 'mysql',  # MySQL-compatible
        'database_url': 'mysql://metabuilder:metabuilder@mariadb:3306/metabuilder',
        'setup_required': True,
        'wait_for_healthy': True,
    },
    'surrealdb': {
        'adapter': 'surrealdb',
        'database_url': 'ws://surrealdb:8000/rpc',
        'setup_required': True,
        'wait_for_healthy': True,
    },
    'elasticsearch': {
        'adapter': 'elasticsearch',
        'database_url': 'http://elasticsearch:9200?index=dbal_test&refresh=true',
        'setup_required': True,
        'wait_for_healthy': True,
    },
}


def run_command(cmd: str, capture=True) -> Tuple[int, str, str]:
    """Run a shell command and return exit code, stdout, stderr"""
    result = subprocess.run(
        cmd,
        shell=True,
        capture_output=capture,
        text=True
    )
    return result.returncode, result.stdout, result.stderr


def wait_for_backend(backend_name: str, timeout: int = 30) -> bool:
    """Wait for a backend to become healthy"""
    backend = BACKENDS[backend_name]

    if not backend.get('wait_for_healthy'):
        return True

    print(f"  ⏳ Waiting for {backend_name} to be healthy...")

    for i in range(timeout):
        # Check via docker-compose health check
        exitcode, stdout, _ = run_command(
            f"docker-compose ps {backend_name.split('_')[0]} | grep 'healthy'",
            capture=True
        )

        if exitcode == 0:
            print(f"  ✓ {backend_name} is healthy")
            return True

        time.sleep(1)

    print(f"  ✗ {backend_name} health check timeout")
    return False


def stop_daemon() -> None:
    """Stop any running DBAL daemon"""
    run_command("docker-compose exec -T dev pkill -9 dbal_daemon || true", capture=False)
    time.sleep(2)


def start_daemon(backend_name: str, port: int = 8080) -> bool:
    """Start DBAL daemon with specified backend configuration"""
    backend = BACKENDS[backend_name]

    print(f"\n🚀 Starting daemon with {backend_name} backend...")

    # Generate Prisma schema if needed
    if backend.get('prisma_schema_gen'):
        print("  📋 Generating Prisma schema from YAML...")
        exitcode, _, stderr = run_command(
            "docker-compose exec -T dev bash -c 'cd /workspace/dbal/development && npm run codegen:prisma'",
            capture=True
        )

        if exitcode != 0:
            print(f"  ✗ Prisma schema generation failed: {stderr}")
            return False

        print("  ✓ Prisma schema generated")

    # Create config file with backend settings
    config = {
        'adapter': backend['adapter'],
        'database_url': backend['database_url'],
        'mode': 'production',
    }

    # Add Supabase-specific config
    if 'supabase_mode' in backend:
        config['supabase_mode'] = backend['supabase_mode']

        if backend['supabase_mode'] == 'rest':
            # Use Supabase REST API
            import os
            supabase_key = os.getenv('SUPABASE_KEY', backend.get('supabase_key', ''))
            if supabase_key:
                config['supabase_key'] = supabase_key
            else:
                print("  ⚠️  Warning: SUPABASE_KEY not set, using placeholder")

    config_json = json.dumps(config)

    # Write config to container
    run_command(
        f"docker-compose exec -T dev bash -c 'echo \\'{config_json}\\' > /tmp/test_config.json'",
        capture=True
    )

    # Start daemon with test config
    cmd = (
        f"docker-compose exec -d dev bash -c "
        f"'cd /workspace/dbal/production/build-config/build && "
        f"nohup ./dbal_daemon --config /tmp/test_config.json --daemon --port {port} --bind 0.0.0.0 "
        f"> /tmp/daemon_{backend_name}.log 2>&1 &'"
    )

    exitcode, _, stderr = run_command(cmd, capture=True)

    if exitcode != 0:
        print(f"  ✗ Failed to start daemon: {stderr}")
        return False

    # Wait for daemon to be ready
    print("  ⏳ Waiting for daemon to be ready...")
    for i in range(10):
        exitcode, _, _ = run_command(
            "docker-compose exec -T dev curl -s http://localhost:8080/health",
            capture=True
        )

        if exitcode == 0:
            print(f"  ✓ Daemon is ready on port {port}")
            return True

        time.sleep(1)

    print("  ✗ Daemon failed to start (health check timeout)")
    return False


def run_tests(backend_name: str) -> Tuple[bool, int, int, int]:
    """Run integration tests and return (success, passed, failed, total)"""
    print(f"\n🧪 Running tests for {backend_name}...")

    cmd = (
        "docker-compose exec -T dev bash -c "
        "'cd /workspace/dbal/production && pytest tests/integration/test_api_endpoints.py -v --tb=short'"
    )

    exitcode, stdout, stderr = run_command(cmd, capture=True)

    # Parse test results from pytest output
    passed = 0
    failed = 0
    total = 0

    for line in (stdout + stderr).split('\n'):
        if 'passed' in line.lower():
            parts = line.split()
            for i, part in enumerate(parts):
                if 'passed' in part.lower() and i > 0:
                    try:
                        passed = int(parts[i-1])
                    except:
                        pass

        if 'failed' in line.lower():
            parts = line.split()
            for i, part in enumerate(parts):
                if 'failed' in part.lower() and i > 0:
                    try:
                        failed = int(parts[i-1])
                    except:
                        pass

    total = passed + failed
    success = exitcode == 0 and failed == 0

    return success, passed, failed, total


def run_backend_test(backend_name: str) -> Dict:
    """Run full test cycle for a backend"""
    result = {
        'backend': backend_name,
        'success': False,
        'passed': 0,
        'failed': 0,
        'total': 0,
        'error': None,
    }

    try:
        # Wait for backend to be healthy
        if not wait_for_backend(backend_name):
            result['error'] = 'Backend health check failed'
            return result

        # Stop any existing daemon
        stop_daemon()

        # Start daemon with this backend
        if not start_daemon(backend_name):
            result['error'] = 'Failed to start daemon'
            return result

        # Run tests
        success, passed, failed, total = run_tests(backend_name)

        result['success'] = success
        result['passed'] = passed
        result['failed'] = failed
        result['total'] = total

        # Get daemon logs on failure
        if not success:
            _, logs, _ = run_command(
                f"docker-compose exec -T dev tail -50 /tmp/daemon_{backend_name}.log",
                capture=True
            )
            result['logs'] = logs

        return result

    except Exception as e:
        result['error'] = str(e)
        return result

    finally:
        # Always stop daemon after tests
        stop_daemon()


def print_summary(results: List[Dict]) -> None:
    """Print test matrix summary"""
    print("\n" + "=" * 80)
    print("DBAL MULTI-BACKEND TEST MATRIX SUMMARY")
    print("=" * 80)

    total_success = 0
    total_failed = 0

    for result in results:
        backend = result['backend']
        success = result['success']
        passed = result['passed']
        failed = result['failed']
        total = result['total']
        error = result.get('error')

        status = "✅ PASS" if success else "❌ FAIL"

        if success:
            total_success += 1
        else:
            total_failed += 1

        print(f"\n{backend:<20} {status}")

        if error:
            print(f"  Error: {error}")
        elif total > 0:
            print(f"  Tests: {passed}/{total} passed")
            if failed > 0:
                print(f"  Failed: {failed}")

    print("\n" + "-" * 80)
    print(f"Total: {total_success}/{len(results)} backends passing")
    print("=" * 80)


def main():
    """Run multi-backend test matrix"""
    import argparse

    parser = argparse.ArgumentParser(
        description='Run DBAL integration tests across all database backends'
    )
    parser.add_argument(
        '--backend',
        choices=list(BACKENDS.keys()) + ['all'],
        default='all',
        help='Backend to test (default: all)'
    )
    parser.add_argument(
        '--stop-on-fail',
        action='store_true',
        help='Stop testing on first failure'
    )

    args = parser.parse_args()

    # Determine which backends to test
    if args.backend == 'all':
        backends_to_test = list(BACKENDS.keys())
    else:
        backends_to_test = [args.backend]

    print("🎯 DBAL Multi-Backend Test Matrix")
    print(f"Testing: {', '.join(backends_to_test)}\n")

    results = []

    for backend_name in backends_to_test:
        print(f"\n{'=' * 80}")
        print(f"Testing Backend: {backend_name}")
        print(f"{'=' * 80}")

        result = run_backend_test(backend_name)
        results.append(result)

        if not result['success'] and args.stop_on_fail:
            print("\n⚠️  Stopping on failure (--stop-on-fail)")
            break

    # Print summary
    print_summary(results)

    # Exit with failure if any backend failed
    if any(not r['success'] for r in results):
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
