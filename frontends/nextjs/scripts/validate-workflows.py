#!/usr/bin/env python3
"""
Validate GitHub Actions workflows without requiring act to be installed.
This script checks:
- YAML syntax
- Required fields (name, on, jobs)
- Job structure
- Step structure
- Common issues and best practices
"""

import yaml
import sys
from pathlib import Path
from typing import Dict, List, Any

def validate_yaml_syntax(file_path: Path) -> tuple[bool, str]:
    """Validate YAML syntax of a workflow file."""
    try:
        with open(file_path, 'r') as f:
            yaml.safe_load(f)
        return True, ""
    except yaml.YAMLError as e:
        return False, str(e)

def validate_workflow_structure(file_path: Path, content: Dict[str, Any]) -> List[str]:
    """Validate the structure of a GitHub Actions workflow."""
    issues = []
    
    # Check required top-level fields
    if 'name' not in content:
        issues.append("Missing 'name' field")
    
    # Note: 'on' is parsed as boolean True by YAML parser
    if 'on' not in content and True not in content:
        issues.append("Missing 'on' field (trigger events)")
    
    if 'jobs' not in content:
        issues.append("Missing 'jobs' field")
        return issues  # Can't continue without jobs
    
    # Validate jobs
    jobs = content.get('jobs', {})
    if not isinstance(jobs, dict):
        issues.append("'jobs' must be a dictionary")
        return issues
    
    if not jobs:
        issues.append("No jobs defined")
        return issues
    
    # Check each job
    for job_name, job_config in jobs.items():
        if not isinstance(job_config, dict):
            issues.append(f"Job '{job_name}' must be a dictionary")
            continue
        
        # Check for runs-on
        if 'runs-on' not in job_config:
            issues.append(f"Job '{job_name}' missing 'runs-on' field")
        
        # Check for steps
        if 'steps' not in job_config:
            issues.append(f"Job '{job_name}' missing 'steps' field")
            continue
        
        steps = job_config.get('steps', [])
        if not isinstance(steps, list):
            issues.append(f"Job '{job_name}' steps must be a list")
            continue
        
        if not steps:
            issues.append(f"Job '{job_name}' has no steps")
        
        # Validate each step
        for i, step in enumerate(steps):
            if not isinstance(step, dict):
                issues.append(f"Job '{job_name}' step {i+1} must be a dictionary")
                continue
            
            # Each step needs either 'uses' or 'run'
            if 'uses' not in step and 'run' not in step:
                step_name = step.get('name', f'step {i+1}')
                issues.append(f"Job '{job_name}' step '{step_name}' must have either 'uses' or 'run'")
    
    return issues

def check_common_issues(file_path: Path, content: Dict[str, Any]) -> List[str]:
    """Check for common issues and best practices."""
    warnings = []
    
    # Check for pinned action versions (security best practice)
    jobs = content.get('jobs', {})
    for job_name, job_config in jobs.items():
        steps = job_config.get('steps', [])
        for step in steps:
            if 'uses' in step:
                action = step['uses']
                # Check if it's using @main, @master, @latest, or version tag without hash
                if '@main' in action or '@master' in action or '@latest' in action:
                    warnings.append(
                        f"Job '{job_name}' uses unpinned action '{action}'. "
                        f"Consider pinning to a specific commit SHA for security."
                    )
    
    # Check for working directory consistency
    jobs = content.get('jobs', {})
    working_dirs = set()
    for job_name, job_config in jobs.items():
        defaults = job_config.get('defaults', {})
        run_config = defaults.get('run', {})
        if 'working-directory' in run_config:
            working_dirs.add(run_config['working-directory'])
    
    if len(working_dirs) > 1:
        warnings.append(
            f"Multiple working directories used: {', '.join(working_dirs)}. "
            f"Ensure this is intentional."
        )
    
    return warnings

def main():
    """Main validation function."""
    project_root = Path(__file__).parent.parent.parent.parent
    workflow_dir = project_root / '.github' / 'workflows'
    
    if not workflow_dir.exists():
        print(f"❌ Workflow directory not found: {workflow_dir}")
        sys.exit(1)
    
    print("🔍 GitHub Actions Workflow Validation")
    print("=" * 50)
    print()
    
    all_files = list(workflow_dir.rglob('*.yml'))
    if not all_files:
        print("❌ No workflow files found")
        sys.exit(1)
    
    print(f"Found {len(all_files)} workflow file(s)")
    print()
    
    total_issues = 0
    total_warnings = 0
    
    for yml_file in sorted(all_files):
        relative_path = yml_file.relative_to(project_root)
        print(f"📄 Validating {relative_path}")
        
        # Validate YAML syntax
        is_valid, error = validate_yaml_syntax(yml_file)
        if not is_valid:
            print(f"   ❌ YAML Syntax Error: {error}")
            total_issues += 1
            print()
            continue
        
        # Load content for structure validation
        with open(yml_file, 'r') as f:
            content = yaml.safe_load(f)
        
        # Validate structure
        issues = validate_workflow_structure(yml_file, content)
        if issues:
            print(f"   ❌ Found {len(issues)} structural issue(s):")
            for issue in issues:
                print(f"      - {issue}")
            total_issues += len(issues)
        else:
            print(f"   ✅ Structure valid")
        
        # Check for common issues
        warnings = check_common_issues(yml_file, content)
        if warnings:
            print(f"   ⚠️  Found {len(warnings)} warning(s):")
            for warning in warnings:
                print(f"      - {warning}")
            total_warnings += len(warnings)
        
        print()
    
    # Summary
    print("=" * 50)
    print("📊 Summary:")
    print(f"   Total files checked: {len(all_files)}")
    print(f"   Total issues: {total_issues}")
    print(f"   Total warnings: {total_warnings}")
    
    if total_issues > 0:
        print()
        print("❌ Workflow validation failed!")
        sys.exit(1)
    elif total_warnings > 0:
        print()
        print("⚠️  Workflow validation passed with warnings")
        sys.exit(0)
    else:
        print()
        print("✅ All workflows are valid!")
        sys.exit(0)

if __name__ == '__main__':
    main()
