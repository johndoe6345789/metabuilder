"""Factory for TestRunSuite plugin."""

from .test_run_suite import TestRunSuite


def create():
    return TestRunSuite()
