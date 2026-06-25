"""Factory for BranchCondition plugin."""

from .utils_branch_condition import BranchCondition


def create():
    return BranchCondition()
