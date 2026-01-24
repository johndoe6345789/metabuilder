"""
Performance benchmarking suite for email service

Phase 8: Email Client Implementation - Performance Testing

This package contains comprehensive performance benchmarks for the email service,
including:
- Email synchronization performance (100-10,000 messages)
- Message search operations (various mailbox sizes)
- API response time measurements
- Database query performance
- Memory profiling and GC behavior
- Load testing with concurrent users
- Performance regression detection

The benchmarks use pytest-benchmark framework for detailed metrics and
historical comparison.

QUICK START:

  # Install pytest-benchmark
  pip install pytest-benchmark

  # Run all benchmarks
  pytest tests/performance/ -v

  # Save baseline metrics
  pytest tests/performance/ --benchmark-save=baseline -v

  # Compare against baseline
  pytest tests/performance/ --benchmark-compare=baseline -v

  # Run specific benchmark group
  pytest tests/performance/ -v -k sync
  pytest tests/performance/ -v -k search
  pytest tests/performance/ -v -k api
  pytest tests/performance/ -v -k load

  # Detailed profiling
  pytest tests/performance/ -v --benchmark-verbose --benchmark-stats=all

PERFORMANCE BASELINES:

Email Sync (Phase 8):
  - 100 messages: ~350ms
  - 1,000 messages: ~2,100ms
  - 10,000 messages: ~24,000ms

Search (1000-message mailbox):
  - Subject search: ~180ms
  - Full-text search: ~420ms

API Operations:
  - List messages: ~80ms
  - Get message: ~45ms
  - Create message: ~120ms

Load Testing:
  - 10 users: < 5 seconds
  - 50 users: < 15 seconds
  - 100 users: < 30 seconds
"""

__all__ = ['benchmark_email_service']

# Markers for pytest
# These are defined in pytest.ini but documented here for reference
#
# Available markers:
#   @pytest.mark.benchmark(group='sync')       - Email sync benchmarks
#   @pytest.mark.benchmark(group='search')     - Search performance
#   @pytest.mark.benchmark(group='api')        - API response times
#   @pytest.mark.benchmark(group='database')   - Database operations
#   @pytest.mark.benchmark(group='memory')     - Memory profiling
#   @pytest.mark.benchmark(group='load')       - Load testing
#   @pytest.mark.benchmark(group='regression') - Regression detection
