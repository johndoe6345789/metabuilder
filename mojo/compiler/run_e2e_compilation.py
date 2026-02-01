#!/usr/bin/env python3
"""
End-to-End Mojo Compilation Test Runner for snake.mojo

This script executes the comprehensive E2E compilation test and:
1. Runs the test through all 5 compiler phases
2. Captures detailed metrics from each phase
3. Generates a comprehensive report
4. Saves metrics to a file
5. Prints final status with ✅ COMPLETE or ❌ FAILED

Usage:
    python3 run_e2e_compilation.py
    python3 run_e2e_compilation.py --output report.txt
"""

import subprocess
import sys
import os
import json
import time
from datetime import datetime
from pathlib import Path


class E2ECompilationRunner:
    """Runner for end-to-end Mojo compilation tests."""

    def __init__(self, compiler_dir=None):
        """Initialize the runner."""
        if compiler_dir is None:
            compiler_dir = Path(__file__).parent
        self.compiler_dir = Path(compiler_dir)
        self.test_file = self.compiler_dir / "tests" / "test_snake_e2e_comprehensive.mojo"
        self.timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

    def run_mojo_test(self, test_file):
        """Run Mojo test file using pixi."""
        try:
            print(f"Executing: {test_file}")
            print("-" * 80)

            # Try to run with pixi (Mojo environment)
            result = subprocess.run(
                ["pixi", "run", "mojo", str(test_file)],
                cwd=str(self.compiler_dir),
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
            )

            return result.returncode, result.stdout, result.stderr

        except subprocess.TimeoutExpired:
            return -1, "", "Compilation test timed out (>5 minutes)"
        except FileNotFoundError:
            print("Warning: pixi not found, trying direct mojo execution")
            try:
                result = subprocess.run(
                    ["mojo", str(test_file)],
                    cwd=str(self.compiler_dir),
                    capture_output=True,
                    text=True,
                    timeout=300,
                )
                return result.returncode, result.stdout, result.stderr
            except FileNotFoundError:
                return -1, "", "Neither pixi nor mojo found in PATH"

    def parse_metrics_from_output(self, stdout):
        """Parse metrics from test output."""
        metrics = {
            "phases": [],
            "total_duration_ms": 0,
            "final_status": "UNKNOWN",
            "phases_passed": 0,
            "phases_failed": 0,
        }

        lines = stdout.split("\n")

        for i, line in enumerate(lines):
            # Parse phase status
            if "PHASE" in line and ("✅ PASS" in line or "❌ FAIL" in line):
                if "✅ PASS" in line:
                    metrics["phases_passed"] += 1
                else:
                    metrics["phases_failed"] += 1

            # Parse metrics
            if "Duration:" in line and "ms" in line:
                try:
                    duration_str = line.split("Duration:")[-1].split("ms")[0].strip()
                    metrics["total_duration_ms"] = float(duration_str)
                except:
                    pass

            if "Final Status:" in line:
                metrics["final_status"] = line.split("Final Status:")[-1].strip()

            # Parse detailed metrics
            if "  - " in line:
                try:
                    key, value = line.split(":", 1)
                    key = key.strip().replace("  - ", "")
                    value = value.strip()
                    if key not in metrics:
                        metrics[key] = value
                except:
                    pass

        return metrics

    def generate_markdown_report(self, stdout, stderr, returncode, metrics):
        """Generate a Markdown report."""
        status = "✅ COMPLETE" if returncode == 0 else "❌ FAILED"

        report = f"""# Mojo Compiler E2E Compilation Report

**Date**: {datetime.now().isoformat()}

**Test**: `snake.mojo` End-to-End Compilation

## Summary

- **Overall Status**: {status}
- **Total Duration**: {metrics.get('total_duration_ms', 'N/A')} ms
- **Phases Passed**: {metrics.get('phases_passed', 0)}/5
- **Phases Failed**: {metrics.get('phases_failed', 0)}/5

## Phase Breakdown

"""

        # Extract phase-by-phase results
        for line in stdout.split("\n"):
            if "Phase" in line and ("✅" in line or "❌" in line):
                report += f"- {line.strip()}\n"

        report += f"""

## Detailed Metrics

```
{stdout}
```

"""

        if stderr:
            report += f"""## Errors

```
{stderr}
```

"""

        return report

    def save_report(self, report_content, output_file=None):
        """Save report to file."""
        if output_file is None:
            output_file = (
                self.compiler_dir / f"E2E_COMPILATION_REPORT_{self.timestamp}.md"
            )

        with open(output_file, "w") as f:
            f.write(report_content)

        return output_file

    def run(self, output_file=None):
        """Run the end-to-end compilation test."""
        print("=" * 80)
        print("MOJO COMPILER - END-TO-END COMPILATION TEST")
        print("=" * 80)
        print("")
        print(f"Test File: {self.test_file}")
        print(f"Working Directory: {self.compiler_dir}")
        print("")

        if not self.test_file.exists():
            print(f"❌ ERROR: Test file not found: {self.test_file}")
            return False

        # Run the test
        start_time = time.time()
        returncode, stdout, stderr = self.run_mojo_test(self.test_file)
        elapsed_time = time.time() - start_time

        print("")
        print("=" * 80)
        print("TEST OUTPUT")
        print("=" * 80)
        print(stdout)

        if stderr:
            print("")
            print("=" * 80)
            print("STDERR")
            print("=" * 80)
            print(stderr)

        # Parse metrics
        metrics = self.parse_metrics_from_output(stdout)
        metrics["elapsed_time_seconds"] = elapsed_time
        metrics["return_code"] = returncode

        # Generate report
        report = self.generate_markdown_report(stdout, stderr, returncode, metrics)

        # Save report
        report_path = self.save_report(report, output_file)
        print("")
        print("=" * 80)
        print(f"Report saved to: {report_path}")
        print("=" * 80)

        # Print final status
        print("")
        if returncode == 0:
            print("✅ END-TO-END COMPILATION: SUCCESS")
            print(f"   All phases completed successfully in {elapsed_time:.2f}s")
        else:
            print("❌ END-TO-END COMPILATION: FAILED")
            print(f"   Return code: {returncode}")

        print("")

        return returncode == 0


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Run Mojo E2E compilation test")
    parser.add_argument(
        "--output",
        "-o",
        help="Output file for report",
        default=None,
    )
    parser.add_argument(
        "--dir",
        "-d",
        help="Compiler directory",
        default=None,
    )

    args = parser.parse_args()

    runner = E2ECompilationRunner(args.dir)
    success = runner.run(args.output)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
