"""Factory for TestAssertFalse plugin."""

from .test_assert_false import TestAssertFalse


def create():
    return TestAssertFalse()
