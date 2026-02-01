"""
Performance testing configuration and fixtures

Provides specialized fixtures for performance benchmarking:
- Benchmark data generators
- Performance metric collection
- Baseline management
- Regression detection utilities
"""

import pytest
import os
import sys
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

# Ensure module imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))


# ============================================================================
# PYTEST CONFIGURATION
# ============================================================================

def pytest_configure(config):
    """Configure pytest for performance testing"""
    # Register custom markers
    config.addinivalue_line(
        "markers", "benchmark(group='...'): mark test as performance benchmark"
    )


# ============================================================================
# BASELINE MANAGEMENT
# ============================================================================

class PerformanceBaseline:
    """
    Manages performance baseline metrics for regression detection

    Baselines are stored in JSON format for easy comparison:
    {
        "timestamp": "2026-01-24T...",
        "metrics": {
            "sync_100": {
                "min": 0.3,
                "max": 0.6,
                "mean": 0.35,
                "stddev": 0.05
            },
            ...
        }
    }
    """

    def __init__(self, baseline_file: str = '.benchmarks/baseline.json'):
        self.baseline_file = Path(baseline_file)
        self.baseline_file.parent.mkdir(parents=True, exist_ok=True)
        self._baseline: Dict[str, Any] = self._load_baseline()

    def _load_baseline(self) -> Dict[str, Any]:
        """Load baseline metrics from file"""
        if self.baseline_file.exists():
            try:
                with open(self.baseline_file, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return self._create_default_baseline()
        return self._create_default_baseline()

    def _create_default_baseline(self) -> Dict[str, Any]:
        """Create default baseline with Phase 8 metrics"""
        return {
            "timestamp": datetime.now().isoformat(),
            "version": "1.0",
            "phase": "8_performance_benchmarking",
            "metrics": {
                # Email Sync Baselines (Phase 8)
                "test_sync_100_messages": {
                    "target_ms": 500,
                    "baseline_ms": 350,
                    "tolerance_percent": 20
                },
                "test_sync_1000_messages": {
                    "target_ms": 3000,
                    "baseline_ms": 2100,
                    "tolerance_percent": 20
                },
                "test_sync_10000_messages": {
                    "target_ms": 30000,
                    "baseline_ms": 24000,
                    "tolerance_percent": 20
                },
                "test_sync_incremental_10_messages": {
                    "target_ms": 200,
                    "baseline_ms": 150,
                    "tolerance_percent": 20
                },
                "test_batch_message_fetch": {
                    "target_ms": 1000,
                    "baseline_ms": 850,
                    "tolerance_percent": 20
                },
                # Search Baselines (Phase 8)
                "test_subject_search_small_mailbox": {
                    "target_ms": 50,
                    "baseline_ms": 35,
                    "tolerance_percent": 30
                },
                "test_fulltext_search_medium_mailbox": {
                    "target_ms": 500,
                    "baseline_ms": 420,
                    "tolerance_percent": 20
                },
                "test_search_large_mailbox": {
                    "target_ms": 3000,
                    "baseline_ms": 2500,
                    "tolerance_percent": 25
                },
                "test_complex_multi_field_search": {
                    "target_ms": 500,
                    "baseline_ms": 420,
                    "tolerance_percent": 20
                },
                "test_date_range_filter_search": {
                    "target_ms": 200,
                    "baseline_ms": 150,
                    "tolerance_percent": 20
                },
                # API Baselines (Phase 8)
                "test_list_messages_pagination": {
                    "target_ms": 100,
                    "baseline_ms": 80,
                    "tolerance_percent": 25
                },
                "test_get_message_details": {
                    "target_ms": 100,
                    "baseline_ms": 45,
                    "tolerance_percent": 30
                },
                "test_compose_message": {
                    "target_ms": 100,
                    "baseline_ms": 120,
                    "tolerance_percent": 25
                },
                "test_update_message_flags": {
                    "target_ms": 100,
                    "baseline_ms": 75,
                    "tolerance_percent": 25
                },
                "test_delete_message": {
                    "target_ms": 100,
                    "baseline_ms": 60,
                    "tolerance_percent": 30
                },
                "test_get_folder_hierarchy": {
                    "target_ms": 50,
                    "baseline_ms": 40,
                    "tolerance_percent": 30
                },
                # Database Baselines (Phase 8)
                "test_single_message_insertion": {
                    "target_ms": 50,
                    "baseline_ms": 35,
                    "tolerance_percent": 30
                },
                "test_batch_message_insertion": {
                    "target_ms": 500,
                    "baseline_ms": 380,
                    "tolerance_percent": 25
                },
                "test_message_update_flags": {
                    "target_ms": 50,
                    "baseline_ms": 35,
                    "tolerance_percent": 30
                },
                "test_folder_query_with_counts": {
                    "target_ms": 100,
                    "baseline_ms": 80,
                    "tolerance_percent": 25
                },
                "test_complex_filtering_query": {
                    "target_ms": 200,
                    "baseline_ms": 150,
                    "tolerance_percent": 25
                },
                # Memory Baselines (Phase 8)
                "test_baseline_memory_usage": {
                    "target_mb": 100,
                    "baseline_mb": 85,
                    "tolerance_percent": 15
                },
                "test_memory_growth_during_sync": {
                    "target_mb": 500,
                    "baseline_mb": 450,
                    "tolerance_percent": 20
                },
                "test_memory_cleanup_after_sync": {
                    "target_mb": 10,
                    "baseline_mb": 40,
                    "tolerance_percent": 25
                },
                # Load Testing Baselines (Phase 8)
                "test_concurrent_10_users": {
                    "target_ms": 5000,
                    "baseline_ms": 3500,
                    "tolerance_percent": 25
                },
                "test_concurrent_50_users": {
                    "target_ms": 15000,
                    "baseline_ms": 10000,
                    "tolerance_percent": 30
                },
                "test_concurrent_100_users": {
                    "target_ms": 30000,
                    "baseline_ms": 20000,
                    "tolerance_percent": 40
                }
            }
        }

    def save(self):
        """Save baseline metrics to file"""
        with open(self.baseline_file, 'w') as f:
            json.dump(self._baseline, f, indent=2)

    def get_metric(self, test_name: str) -> Dict[str, Any]:
        """Get baseline metric for test"""
        return self._baseline.get('metrics', {}).get(test_name, {})

    def check_regression(self, test_name: str, actual_ms: float) -> bool:
        """
        Check if actual time exceeds acceptable regression threshold

        Returns:
            True if within acceptable range, False if regression detected
        """
        metric = self.get_metric(test_name)
        if not metric:
            return True  # No baseline, pass by default

        baseline_ms = metric.get('baseline_ms') or metric.get('baseline_mb', 0)
        tolerance_percent = metric.get('tolerance_percent', 20)

        if baseline_ms == 0:
            return True

        tolerance_ms = baseline_ms * (tolerance_percent / 100)
        max_allowed = baseline_ms + tolerance_ms

        return actual_ms <= max_allowed


@pytest.fixture(scope="session")
def performance_baseline() -> PerformanceBaseline:
    """
    Fixture providing performance baseline manager

    Usage:
        def test_something(benchmark, performance_baseline):
            result = benchmark(operation)
            is_ok = performance_baseline.check_regression('test_name', result * 1000)
            assert is_ok, f"Performance regression detected"
    """
    return PerformanceBaseline()


# ============================================================================
# PERFORMANCE REPORTING
# ============================================================================

class PerformanceReport:
    """Collects and formats performance test results"""

    def __init__(self):
        self.results: List[Dict[str, Any]] = []
        self.start_time = time.time()

    def add_result(
        self,
        test_name: str,
        duration_ms: float,
        category: str = "general",
        status: str = "pass"
    ):
        """Record benchmark result"""
        self.results.append({
            'test_name': test_name,
            'duration_ms': duration_ms,
            'category': category,
            'status': status,
            'timestamp': datetime.now().isoformat()
        })

    def generate_summary(self) -> str:
        """Generate performance report summary"""
        if not self.results:
            return "No results to report"

        # Group results by category
        by_category: Dict[str, List[Dict]] = {}
        for result in self.results:
            cat = result['category']
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(result)

        report = """
╔════════════════════════════════════════════════════════════════════════════╗
║           EMAIL SERVICE PERFORMANCE BENCHMARK SUMMARY - PHASE 8            ║
╚════════════════════════════════════════════════════════════════════════════╝

Generated: {}
Total Tests: {}
Elapsed Time: {:.2f}s

RESULTS BY CATEGORY:
─────────────────────────────────────────────────────────────────────────────
""".format(datetime.now().isoformat(), len(self.results), time.time() - self.start_time)

        for category in sorted(by_category.keys()):
            results = by_category[category]
            passed = sum(1 for r in results if r['status'] == 'pass')
            failed = len(results) - passed

            report += f"\n{category.upper()} ({passed}/{len(results)} passed)\n"

            for result in sorted(results, key=lambda r: r['duration_ms']):
                status_icon = "✓" if result['status'] == 'pass' else "✗"
                report += f"  {status_icon} {result['test_name']}: {result['duration_ms']:.2f}ms\n"

        report += "\n" + "=" * 80 + "\n"
        return report


@pytest.fixture(scope="session")
def performance_report() -> PerformanceReport:
    """Fixture providing performance report collector"""
    return PerformanceReport()


# ============================================================================
# UTILITY FIXTURES
# ============================================================================

@pytest.fixture
def measure_time():
    """
    Context manager for measuring operation time

    Usage:
        with measure_time() as timer:
            operation()
        elapsed_ms = timer.elapsed_ms
    """
    class Timer:
        def __init__(self):
            self.start = None
            self.end = None

        def __enter__(self):
            self.start = time.time()
            return self

        def __exit__(self, *args):
            self.end = time.time()

        @property
        def elapsed_s(self) -> float:
            return self.end - self.start if self.end else 0

        @property
        def elapsed_ms(self) -> float:
            return self.elapsed_s * 1000

    return Timer()


@pytest.fixture
def performance_config() -> Dict[str, Any]:
    """
    Configuration for performance tests

    Returns:
        Dict with performance test configuration
    """
    return {
        'message_count': {
            'small': 100,
            'medium': 1000,
            'large': 10000
        },
        'concurrent_users': [10, 50, 100],
        'timeout_ms': 60000,
        'memory_threshold_mb': 500,
        'regression_tolerance_percent': 20
    }


# ============================================================================
# PYTEST HOOKS
# ============================================================================

def pytest_runtest_setup(item):
    """Setup for each test"""
    # Auto-add benchmark marker for performance tests
    if 'benchmark' in item.module.__name__:
        item.add_marker(pytest.mark.benchmark)


def pytest_collection_modifyitems(config, items):
    """Modify collected items"""
    for item in items:
        # Add timeout to all performance tests
        if 'benchmark' in item.keywords:
            item.add_marker(pytest.mark.timeout(300))  # 5 minute timeout


# ============================================================================
# MARKERS
# ============================================================================

pytest_plugins = []

# Benchmark groups (used in @pytest.mark.benchmark(group='...'))
BENCHMARK_GROUPS = [
    'sync',       # Email synchronization
    'search',     # Message search
    'api',        # API response times
    'database',   # Database queries
    'memory',     # Memory profiling
    'load',       # Load testing
    'regression'  # Regression detection
]
