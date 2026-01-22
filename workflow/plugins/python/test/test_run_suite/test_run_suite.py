"""Workflow plugin: run a suite of test assertions and report results."""

from ...base import NodeExecutor


class TestRunSuite(NodeExecutor):
    """Run a suite of test assertions and aggregate results."""

    node_type = "test.run_suite"
    category = "test"
    description = "Run a suite of test assertions and report results"

    def execute(self, inputs, runtime=None):
        """Run a suite of test assertions and aggregate results.

        Inputs:
        - results: Array of test result objects (each with 'passed' field)
        - suite_name: Optional name for the test suite

        Outputs:
        - passed: Boolean indicating if all tests passed
        - total: Total number of tests
        - passed_count: Number of tests that passed
        - failed_count: Number of tests that failed
        - failures: Array of failed test details
        """
        results = inputs.get("results", [])
        suite_name = inputs.get("suite_name", "Test Suite")

        if not isinstance(results, list):
            return {
                "passed": False,
                "error": "results must be an array",
                "total": 0,
                "passed_count": 0,
                "failed_count": 0,
                "failures": []
            }

        total = len(results)
        passed_count = 0
        failed_count = 0
        failures = []

        for i, result in enumerate(results):
            if isinstance(result, dict) and result.get("passed") is True:
                passed_count += 1
            else:
                failed_count += 1
                failure_info = {
                    "test_index": i,
                    "error": result.get("error", "Unknown error") if isinstance(result, dict) else str(result)
                }
                if isinstance(result, dict):
                    failure_info.update({
                        "expected": result.get("expected"),
                        "actual": result.get("actual")
                    })
                failures.append(failure_info)

        all_passed = failed_count == 0 and total > 0

        summary = f"{suite_name}: {passed_count}/{total} tests passed"

        return {
            "passed": all_passed,
            "total": total,
            "passed_count": passed_count,
            "failed_count": failed_count,
            "failures": failures,
            "summary": summary
        }
