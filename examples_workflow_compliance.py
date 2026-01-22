#!/usr/bin/env python3
"""
Workflow Compliance Fixer - Practical Examples

This file contains ready-to-use examples for common scenarios.
"""

from workflow_compliance_fixer import N8NWorkflowCompliance
from pathlib import Path
import json


def example_1_basic_dry_run():
    """Example 1: Dry run to see what would be fixed"""
    print("=" * 80)
    print("EXAMPLE 1: Dry Run (Report Only)")
    print("=" * 80)

    fixer = N8NWorkflowCompliance(
        base_path='/Users/rmac/Documents/metabuilder',
        dry_run=True,
        auto_fix=False
    )

    results, summary = fixer.process_all_workflows()
    report = fixer.generate_report()
    print(report)


def example_2_fix_all_workflows():
    """Example 2: Fix all workflows"""
    print("=" * 80)
    print("EXAMPLE 2: Fix All Workflows")
    print("=" * 80)

    fixer = N8NWorkflowCompliance(
        base_path='/Users/rmac/Documents/metabuilder',
        dry_run=False,
        auto_fix=True
    )

    results, summary = fixer.process_all_workflows()
    report = fixer.generate_report()
    print(report)

    # Print summary
    print("\nSUMMARY:")
    print(f"Total Files: {summary['total_files']}")
    print(f"Success Rate: {summary['success_rate']}")
    print(f"Issues Fixed: {summary['total_issues_fixed']}")
    print(f"Files Modified: {summary['files_modified']}")


def example_3_process_specific_directory():
    """Example 3: Process only gameengine workflows"""
    print("=" * 80)
    print("EXAMPLE 3: Process Specific Directory")
    print("=" * 80)

    fixer = N8NWorkflowCompliance(
        base_path='/Users/rmac/Documents/metabuilder/gameengine',
        dry_run=True,
        auto_fix=False
    )

    results, summary = fixer.process_all_workflows()

    print(f"\nFound {len(results)} gameengine workflows:")
    for result in results:
        status = "✓" if result.success else "✗"
        print(f"{status} {result.file_path}")
        if result.issues_found:
            print(f"   Issues: {len(result.issues_found)}")


def example_4_detailed_issue_analysis():
    """Example 4: Detailed analysis of issues found"""
    print("=" * 80)
    print("EXAMPLE 4: Detailed Issue Analysis")
    print("=" * 80)

    fixer = N8NWorkflowCompliance(
        base_path='/Users/rmac/Documents/metabuilder',
        dry_run=True,
        auto_fix=False
    )

    results, summary = fixer.process_all_workflows()

    # Collect all issues by type
    issues_by_type = {}

    for result in results:
        for issue in result.issues_found:
            issue_type = issue.issue_type
            if issue_type not in issues_by_type:
                issues_by_type[issue_type] = []
            issues_by_type[issue_type].append({
                'file': result.file_path,
                'severity': issue.severity,
                'message': issue.message
            })

    # Print grouped by type
    print("\nISSUES BY TYPE:")
    for issue_type in sorted(issues_by_type.keys()):
        issues = issues_by_type[issue_type]
        print(f"\n{issue_type}: {len(issues)} occurrences")

        for issue in issues[:3]:  # Show first 3
            print(f"  - {issue['file']}")
            print(f"    [{issue['severity']}] {issue['message']}")

        if len(issues) > 3:
            print(f"  ... and {len(issues) - 3} more")


def example_5_python_api_usage():
    """Example 5: Using the fixer as a Python library"""
    print("=" * 80)
    print("EXAMPLE 5: Python API Usage")
    print("=" * 80)

    # Initialize fixer
    fixer = N8NWorkflowCompliance(
        base_path='/Users/rmac/Documents/metabuilder',
        dry_run=True,
        auto_fix=False
    )

    # Find all workflow files
    workflow_files = fixer.find_workflow_files()
    print(f"Found {len(workflow_files)} workflow files")

    # Process each file individually
    for file_path in workflow_files[:3]:  # Show first 3
        print(f"\nProcessing: {file_path.name}")

        result = fixer.process_workflow_file(file_path)

        if result.success:
            print(f"  ✓ Compliant")
        else:
            print(f"  ✗ {len(result.errors)} critical errors")

        if result.issues_found:
            print(f"  Issues found: {len(result.issues_found)}")
            for issue in result.issues_found[:2]:
                print(f"    - [{issue.severity}] {issue.issue_type}")


def example_6_single_file_validation():
    """Example 6: Validate and fix a single workflow file"""
    print("=" * 80)
    print("EXAMPLE 6: Single File Validation and Fix")
    print("=" * 80)

    fixer = N8NWorkflowCompliance(
        base_path='/Users/rmac/Documents/metabuilder',
        dry_run=False,
        auto_fix=True
    )

    # Example: Fix the auth_login workflow
    file_path = Path('/Users/rmac/Documents/metabuilder/packagerepo/backend/workflows/auth_login.json')

    if file_path.exists():
        result = fixer.process_workflow_file(file_path)

        print(f"File: {file_path.name}")
        print(f"Status: {'✓ PASS' if result.success else '✗ FAIL'}")
        print(f"Issues Found: {len(result.issues_found)}")
        print(f"Issues Fixed: {len(result.issues_fixed)}")
        print(f"Modified: {result.modified}")

        if result.issues_found:
            print("\nIssues Found:")
            for issue in result.issues_found:
                print(f"  [{issue.severity}] {issue.issue_type}")
                print(f"      {issue.message}")

        if result.issues_fixed:
            print("\nFixes Applied:")
            for fix in result.issues_fixed:
                print(f"  ✓ {fix.issue_type}")
                print(f"      {fix.message}")

        if result.errors:
            print("\nErrors:")
            for error in result.errors:
                print(f"  ✗ {error}")
    else:
        print(f"File not found: {file_path}")


def example_7_compare_before_after():
    """Example 7: Compare workflow before and after fixes"""
    print("=" * 80)
    print("EXAMPLE 7: Before/After Comparison")
    print("=" * 80)

    # Load original
    file_path = Path('/Users/rmac/Documents/metabuilder/packagerepo/backend/workflows/auth_login.json')

    if file_path.exists():
        with open(file_path, 'r') as f:
            original = json.load(f)

        print("BEFORE:")
        print(f"  Has 'id' field: {'id' in original}")
        print(f"  Has 'version' field: {'version' in original}")
        print(f"  Has 'tenantId' field: {'tenantId' in original}")
        print(f"  Has 'active' field: {'active' in original}")

        # Create fixer (won't actually modify in this example)
        fixer = N8NWorkflowCompliance(
            base_path='/Users/rmac/Documents/metabuilder',
            dry_run=True,
            auto_fix=False
        )

        # Check what would be fixed
        fixed, fixes = fixer.fix_workflow(original.copy(), file_path.name, file_path)

        print("\nAFTER (would be):")
        print(f"  Has 'id' field: {'id' in fixed}")
        if 'id' in fixed:
            print(f"    Value: {fixed['id']}")

        print(f"  Has 'version' field: {'version' in fixed}")
        if 'version' in fixed:
            print(f"    Value: {fixed['version']}")

        print(f"  Has 'tenantId' field: {'tenantId' in fixed}")
        if 'tenantId' in fixed:
            print(f"    Value: {fixed['tenantId']}")

        print(f"  Has 'active' field: {'active' in fixed}")
        if 'active' in fixed:
            print(f"    Value: {fixed['active']}")

        print(f"\nFixes that would be applied: {len(fixes)}")
        for fix in fixes:
            print(f"  - {fix.issue_type}: {fix.message}")
    else:
        print(f"File not found: {file_path}")


def example_8_error_handling():
    """Example 8: Error handling with malformed files"""
    print("=" * 80)
    print("EXAMPLE 8: Error Handling")
    print("=" * 80)

    import tempfile

    # Create a temporary malformed JSON file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        f.write('{ "name": "Bad JSON", "nodes": [')  # Missing closing bracket
        temp_file = f.name

    try:
        fixer = N8NWorkflowCompliance(
            base_path='/Users/rmac/Documents/metabuilder',
            dry_run=True,
            auto_fix=False
        )

        result = fixer.process_workflow_file(Path(temp_file))

        print(f"File: {temp_file}")
        print(f"Status: {'✓ PASS' if result.success else '✗ FAIL'}")

        if result.errors:
            print("\nErrors caught:")
            for error in result.errors:
                print(f"  - {error}")

    finally:
        # Cleanup
        import os
        os.unlink(temp_file)


def example_9_batch_processing_with_stats():
    """Example 9: Batch processing with detailed statistics"""
    print("=" * 80)
    print("EXAMPLE 9: Batch Processing with Statistics")
    print("=" * 80)

    fixer = N8NWorkflowCompliance(
        base_path='/Users/rmac/Documents/metabuilder',
        dry_run=True,
        auto_fix=False
    )

    results, summary = fixer.process_all_workflows()

    # Detailed statistics
    print("\nDETAILED STATISTICS:")
    print("-" * 80)

    # By severity
    print("\nIssues by Severity:")
    for severity in ['critical', 'warning', 'info']:
        count = summary['severity_breakdown'].get(severity, 0)
        percentage = (count / summary['total_issues_found'] * 100) if summary['total_issues_found'] > 0 else 0
        print(f"  {severity.capitalize()}: {count} ({percentage:.1f}%)")

    # By issue type (top 5)
    print("\nTop 5 Issue Types:")
    sorted_types = sorted(
        summary['issue_type_breakdown'].items(),
        key=lambda x: x[1],
        reverse=True
    )
    for issue_type, count in sorted_types[:5]:
        print(f"  {issue_type}: {count}")

    # Files with most issues
    print("\nFiles with Most Issues:")
    sorted_files = sorted(
        [(r.file_path, len(r.issues_found)) for r in results],
        key=lambda x: x[1],
        reverse=True
    )
    for file_path, count in sorted_files[:5]:
        rel_path = Path(file_path).name
        print(f"  {rel_path}: {count} issues")


def example_10_saving_report():
    """Example 10: Save detailed report to file"""
    print("=" * 80)
    print("EXAMPLE 10: Saving Report to File")
    print("=" * 80)

    fixer = N8NWorkflowCompliance(
        base_path='/Users/rmac/Documents/metabuilder',
        dry_run=True,
        auto_fix=False
    )

    results, summary = fixer.process_all_workflows()
    report = fixer.generate_report()

    # Save to file
    report_path = Path('/tmp/workflow_compliance_report.txt')
    with open(report_path, 'w') as f:
        f.write(report)

    print(f"Report saved to: {report_path}")
    print(f"Report size: {len(report)} characters")
    print(f"\nFirst 500 characters:")
    print(report[:500])


if __name__ == '__main__':
    import sys

    examples = {
        '1': ('Dry Run', example_1_basic_dry_run),
        '2': ('Fix All Workflows', example_2_fix_all_workflows),
        '3': ('Process Specific Directory', example_3_process_specific_directory),
        '4': ('Detailed Issue Analysis', example_4_detailed_issue_analysis),
        '5': ('Python API Usage', example_5_python_api_usage),
        '6': ('Single File Validation', example_6_single_file_validation),
        '7': ('Before/After Comparison', example_7_compare_before_after),
        '8': ('Error Handling', example_8_error_handling),
        '9': ('Batch Processing with Stats', example_9_batch_processing_with_stats),
        '10': ('Saving Report', example_10_saving_report),
    }

    print("\nWorkflow Compliance Fixer - Examples\n")
    print("Available examples:")
    for key, (name, _) in examples.items():
        print(f"  {key}. {name}")

    if len(sys.argv) > 1:
        example_num = sys.argv[1]
        if example_num in examples:
            name, func = examples[example_num]
            print(f"\nRunning Example {example_num}: {name}\n")
            func()
        else:
            print(f"Invalid example number: {example_num}")
            sys.exit(1)
    else:
        print("\nUsage: python examples_workflow_compliance.py <example_number>")
        print("Example: python examples_workflow_compliance.py 1")
        sys.exit(1)
