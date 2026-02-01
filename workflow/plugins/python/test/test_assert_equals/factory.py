"""Factory for TestAssertEquals plugin."""

from .test_assert_equals import TestAssertEquals


def create():
    return TestAssertEquals()
