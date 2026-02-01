"""Factory for TestAssertTrue plugin."""

from .test_assert_true import TestAssertTrue


def create():
    return TestAssertTrue()
