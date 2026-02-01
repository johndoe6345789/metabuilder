"""Factory for TestAssertExists plugin."""

from .test_assert_exists import TestAssertExists


def create():
    return TestAssertExists()
