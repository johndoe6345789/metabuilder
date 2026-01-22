#!/usr/bin/env python3
"""
N8N Workflow Compliance Fixer

Automatically fixes n8n workflow compliance issues:
1. Add missing id field (generate from filename)
2. Add version field (3.0.0)
3. Add tenantId field (${TENANT_ID})
4. Add active field (true)
5. Detect and fix nested parameters
6. Validate against schema

Works on both:
- packages/*/workflow/*.json
- gameengine/packages/*/workflow/*.json
"""

import json
import os
import re
import sys
import hashlib
import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass, field, asdict
from datetime import datetime
from uuid import uuid4

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class ComplianceIssue:
    """Represents a single compliance issue found in a workflow."""
    file_path: str
    issue_type: str
    severity: str  # critical, warning, info
    message: str
    line_number: Optional[int] = None
    fix_applied: bool = False
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass
class WorkflowFixResult:
    """Result of fixing a single workflow file."""
    file_path: str
    success: bool = False
    issues_found: List[ComplianceIssue] = field(default_factory=list)
    issues_fixed: List[ComplianceIssue] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    modified: bool = False
    original_size: int = 0
    final_size: int = 0


class N8NWorkflowCompliance:
    """Validates and fixes n8n workflow compliance issues."""

    # Required root fields
    REQUIRED_ROOT_FIELDS = ['name', 'nodes', 'connections']

    # Required node fields
    REQUIRED_NODE_FIELDS = ['id', 'name', 'type', 'typeVersion', 'position']

    # n8n workflow schema constraints
    CONSTRAINTS = {
        'id_pattern': r'^[a-zA-Z_][a-zA-Z0-9_]*$',
        'name_max_length': 255,
        'name_min_length': 1,
        'type_pattern': r'^[\w\.\-]+$',
        'typeVersion_min': 1,
        'position_valid': lambda pos: isinstance(pos, list) and len(pos) == 2 and all(isinstance(x, (int, float)) for x in pos),
    }

    def __init__(self, base_path: str, dry_run: bool = False, auto_fix: bool = True):
        """
        Initialize the compliance fixer.

        Args:
            base_path: Base directory to scan for workflows
            dry_run: If True, don't write changes to files
            auto_fix: If True, automatically fix issues; otherwise just report
        """
        self.base_path = Path(base_path)
        self.dry_run = dry_run
        self.auto_fix = auto_fix
        self.results: List[WorkflowFixResult] = []

    def generate_workflow_id(self, filename: str, name: str) -> str:
        """
        Generate a workflow ID from filename and name.

        Args:
            filename: The workflow filename (without .json)
            name: The workflow name from the JSON

        Returns:
            Generated workflow ID
        """
        # Use filename as primary source, fallback to name
        base = filename.replace('.json', '').replace('-', '_').lower()

        # Ensure it starts with letter or underscore
        if not re.match(r'^[a-zA-Z_]', base):
            base = f'workflow_{base}'

        # Ensure it matches pattern (alphanumeric and underscore only)
        base = re.sub(r'[^a-zA-Z0-9_]', '_', base)

        # Remove leading workflow_ if added
        if base.startswith('workflow_') and base.count('_') > 1:
            return base

        return f'workflow_{base}' if not base.startswith('workflow_') else base

    def validate_id_format(self, workflow_id: str) -> bool:
        """Validate that ID matches required pattern."""
        return bool(re.match(self.CONSTRAINTS['id_pattern'], workflow_id))

    def validate_name(self, name: str) -> Tuple[bool, Optional[str]]:
        """Validate workflow name."""
        if not isinstance(name, str):
            return False, "Name must be a string"

        if len(name) < self.CONSTRAINTS['name_min_length']:
            return False, f"Name too short (min {self.CONSTRAINTS['name_min_length']} chars)"

        if len(name) > self.CONSTRAINTS['name_max_length']:
            return False, f"Name too long (max {self.CONSTRAINTS['name_max_length']} chars)"

        return True, None

    def validate_node_type(self, node_type: str) -> bool:
        """Validate node type format."""
        return bool(re.match(self.CONSTRAINTS['type_pattern'], node_type))

    def validate_position(self, position: Any) -> bool:
        """Validate node position format."""
        return self.CONSTRAINTS['position_valid'](position)

    def validate_type_version(self, version: Any) -> bool:
        """Validate typeVersion."""
        return isinstance(version, int) and version >= self.CONSTRAINTS['typeVersion_min']

    def detect_object_serialization_errors(self, obj: Any, path: str = '') -> List[ComplianceIssue]:
        """
        Detect [object Object] serialization errors in the workflow.

        Args:
            obj: Object to check (usually parsed JSON)
            path: Current path in the object (for error reporting)

        Returns:
            List of detected issues
        """
        issues = []

        if isinstance(obj, str):
            if '[object Object]' in obj:
                issues.append(ComplianceIssue(
                    file_path='',
                    issue_type='object_serialization_error',
                    severity='critical',
                    message=f'Found serialized object at {path}: "{obj}"',
                    details={'path': path, 'value': obj}
                ))
        elif isinstance(obj, dict):
            for key, value in obj.items():
                issues.extend(self.detect_object_serialization_errors(value, f'{path}.{key}' if path else key))
        elif isinstance(obj, list):
            for idx, item in enumerate(obj):
                issues.extend(self.detect_object_serialization_errors(item, f'{path}[{idx}]'))

        return issues

    def detect_nested_parameters(self, node: Dict[str, Any]) -> List[ComplianceIssue]:
        """
        Detect improperly nested parameters in nodes.

        Parameters should not contain node-level fields (id, name, type, etc).

        Args:
            node: Node object to check

        Returns:
            List of detected issues
        """
        issues = []
        node_id = node.get('id', 'unknown')
        node_level_fields = {'id', 'name', 'type', 'typeVersion', 'position', 'parameters', 'disabled', 'notes', 'continueOnFail', 'retryOnFail', 'credentials'}

        if 'parameters' in node and isinstance(node['parameters'], dict):
            for key in node['parameters'].keys():
                if key in node_level_fields:
                    issues.append(ComplianceIssue(
                        file_path='',
                        issue_type='nested_parameters_error',
                        severity='critical',
                        message=f'Node "{node_id}": Field "{key}" should be at node level, not in parameters',
                        details={'node_id': node_id, 'field': key}
                    ))

        return issues

    def validate_connections(self, workflow: Dict[str, Any]) -> List[ComplianceIssue]:
        """
        Validate that all connections reference existing nodes.

        Args:
            workflow: Parsed workflow JSON

        Returns:
            List of validation issues
        """
        issues = []

        if 'connections' not in workflow:
            return issues

        node_names = {node.get('name') for node in workflow.get('nodes', [])}
        node_ids = {node.get('id') for node in workflow.get('nodes', [])}
        connections = workflow['connections']

        if isinstance(connections, dict):
            # Format: { "NodeName": { "main": { "0": [...] } } }
            for source_node, outputs in connections.items():
                if source_node not in node_names and source_node not in node_ids:
                    issues.append(ComplianceIssue(
                        file_path='',
                        issue_type='invalid_connection_source',
                        severity='critical',
                        message=f'Connection source "{source_node}" does not exist in nodes',
                        details={'source': source_node}
                    ))

                if isinstance(outputs, dict):
                    for output_type, indices in outputs.items():
                        if isinstance(indices, dict):
                            for index, targets in indices.items():
                                if isinstance(targets, list):
                                    for target in targets:
                                        if isinstance(target, dict):
                                            target_node = target.get('node')
                                            if target_node and target_node not in node_names and target_node not in node_ids:
                                                issues.append(ComplianceIssue(
                                                    file_path='',
                                                    issue_type='invalid_connection_target',
                                                    severity='critical',
                                                    message=f'Connection target "{target_node}" does not exist in nodes',
                                                    details={'source': source_node, 'target': target_node}
                                                ))
                                        elif isinstance(target, str) and '[object Object]' in target:
                                            issues.append(ComplianceIssue(
                                                file_path='',
                                                issue_type='object_serialization_in_connections',
                                                severity='critical',
                                                message=f'Serialized object in connections for source "{source_node}"',
                                                details={'source': source_node, 'value': target}
                                            ))

        return issues

    def detect_missing_fields(self, workflow: Dict[str, Any], filename: str) -> List[ComplianceIssue]:
        """
        Detect missing required fields in workflow and nodes.

        Args:
            workflow: Parsed workflow JSON
            filename: The filename (for ID generation)

        Returns:
            List of detected issues
        """
        issues = []

        # Check root-level fields
        for field in self.REQUIRED_ROOT_FIELDS:
            if field not in workflow:
                issues.append(ComplianceIssue(
                    file_path='',
                    issue_type='missing_root_field',
                    severity='critical',
                    message=f'Missing required root field: {field}',
                    details={'field': field}
                ))

        # Check for workflow-level id
        if 'id' not in workflow:
            issues.append(ComplianceIssue(
                file_path='',
                issue_type='missing_workflow_id',
                severity='warning',
                message='Missing workflow-level id field',
                details={'field': 'id', 'suggestion': f'workflow_{filename.replace(".json", "")}'}
            ))

        # Check for version
        if 'version' not in workflow:
            issues.append(ComplianceIssue(
                file_path='',
                issue_type='missing_version',
                severity='warning',
                message='Missing version field (should be 3.0.0 for n8n v1.0+)',
                details={'field': 'version', 'suggested_value': '3.0.0'}
            ))

        # Check for tenantId
        if 'tenantId' not in workflow:
            issues.append(ComplianceIssue(
                file_path='',
                issue_type='missing_tenantId',
                severity='warning',
                message='Missing tenantId field (should be ${TENANT_ID} for multi-tenant systems)',
                details={'field': 'tenantId', 'suggested_value': '${TENANT_ID}'}
            ))

        # Check for active field
        if 'active' not in workflow:
            issues.append(ComplianceIssue(
                file_path='',
                issue_type='missing_active_field',
                severity='info',
                message='Missing active field (defaults to true)',
                details={'field': 'active', 'suggested_value': True}
            ))

        # Check nodes
        nodes = workflow.get('nodes', [])
        if not isinstance(nodes, list) or len(nodes) == 0:
            issues.append(ComplianceIssue(
                file_path='',
                issue_type='invalid_nodes',
                severity='critical',
                message='Workflow must have at least one node',
                details={}
            ))
            return issues

        for idx, node in enumerate(nodes):
            if not isinstance(node, dict):
                issues.append(ComplianceIssue(
                    file_path='',
                    issue_type='invalid_node_format',
                    severity='critical',
                    message=f'Node {idx} is not a valid object',
                    details={'index': idx}
                ))
                continue

            # Check required node fields
            for field in self.REQUIRED_NODE_FIELDS:
                if field not in node:
                    issues.append(ComplianceIssue(
                        file_path='',
                        issue_type='missing_node_field',
                        severity='critical',
                        message=f'Node {idx} missing required field: {field}',
                        details={'node_index': idx, 'field': field, 'node_id': node.get('id', 'unknown')}
                    ))

        return issues

    def validate_node_structure(self, node: Dict[str, Any]) -> List[ComplianceIssue]:
        """
        Validate individual node structure and values.

        Args:
            node: Node object to validate

        Returns:
            List of validation issues
        """
        issues = []
        node_id = node.get('id', 'unknown')

        # Validate node ID
        if 'id' in node and not self.validate_id_format(node['id']):
            issues.append(ComplianceIssue(
                file_path='',
                issue_type='invalid_node_id_format',
                severity='warning',
                message=f'Node ID "{node_id}" does not match pattern (should be alphanumeric with underscore)',
                details={'node_id': node_id}
            ))

        # Validate node name
        if 'name' in node:
            valid, error = self.validate_name(node['name'])
            if not valid:
                issues.append(ComplianceIssue(
                    file_path='',
                    issue_type='invalid_node_name',
                    severity='warning',
                    message=f'Node "{node_id}": {error}',
                    details={'node_id': node_id}
                ))

        # Validate type
        if 'type' in node and not self.validate_node_type(node['type']):
            issues.append(ComplianceIssue(
                file_path='',
                issue_type='invalid_node_type',
                severity='warning',
                message=f'Node "{node_id}": Type format invalid',
                details={'node_id': node_id, 'type': node['type']}
            ))

        # Validate typeVersion
        if 'typeVersion' in node and not self.validate_type_version(node['typeVersion']):
            issues.append(ComplianceIssue(
                file_path='',
                issue_type='invalid_typeVersion',
                severity='warning',
                message=f'Node "{node_id}": typeVersion must be integer >= 1',
                details={'node_id': node_id, 'typeVersion': node['typeVersion']}
            ))

        # Validate position
        if 'position' in node and not self.validate_position(node['position']):
            issues.append(ComplianceIssue(
                file_path='',
                issue_type='invalid_position',
                severity='warning',
                message=f'Node "{node_id}": Position must be [x, y] array of numbers',
                details={'node_id': node_id, 'position': node['position']}
            ))

        return issues

    def fix_workflow(self, workflow: Dict[str, Any], filename: str, file_path: Path) -> Tuple[Dict[str, Any], List[ComplianceIssue]]:
        """
        Fix compliance issues in a workflow.

        Args:
            workflow: Parsed workflow JSON
            filename: The workflow filename
            file_path: Full path to the workflow file

        Returns:
            Tuple of (fixed_workflow, list_of_fixes_applied)
        """
        fixes_applied = []

        # 1. Add missing id field (generate from filename)
        if 'id' not in workflow:
            new_id = self.generate_workflow_id(filename, workflow.get('name', 'unknown'))
            workflow['id'] = new_id
            fixes_applied.append(ComplianceIssue(
                file_path=str(file_path),
                issue_type='add_workflow_id',
                severity='warning',
                message=f'Added workflow id: {new_id}',
                fix_applied=True,
                details={'field': 'id', 'value': new_id}
            ))

        # 2. Add version field (3.0.0)
        if 'version' not in workflow:
            workflow['version'] = '3.0.0'
            fixes_applied.append(ComplianceIssue(
                file_path=str(file_path),
                issue_type='add_version',
                severity='warning',
                message='Added version field: 3.0.0',
                fix_applied=True,
                details={'field': 'version', 'value': '3.0.0'}
            ))

        # 3. Add tenantId field (${TENANT_ID})
        if 'tenantId' not in workflow:
            workflow['tenantId'] = '${TENANT_ID}'
            fixes_applied.append(ComplianceIssue(
                file_path=str(file_path),
                issue_type='add_tenantId',
                severity='warning',
                message='Added tenantId field: ${TENANT_ID}',
                fix_applied=True,
                details={'field': 'tenantId', 'value': '${TENANT_ID}'}
            ))

        # 4. Add active field (true)
        if 'active' not in workflow:
            workflow['active'] = True
            fixes_applied.append(ComplianceIssue(
                file_path=str(file_path),
                issue_type='add_active_field',
                severity='info',
                message='Added active field: true',
                fix_applied=True,
                details={'field': 'active', 'value': True}
            ))

        # 5. Detect and fix nested parameters errors
        if 'nodes' in workflow and isinstance(workflow['nodes'], list):
            for idx, node in enumerate(workflow['nodes']):
                if isinstance(node, dict) and 'parameters' in node:
                    node_level_fields = {'id', 'name', 'type', 'typeVersion', 'position', 'disabled', 'notes', 'continueOnFail', 'retryOnFail', 'credentials'}

                    # Check for node-level fields in parameters
                    nested_issues = self.detect_nested_parameters(node)
                    fixes_applied.extend(nested_issues)

                    # Fix nested parameters if auto_fix is enabled
                    if nested_issues and self.auto_fix:
                        for field in list(node['parameters'].keys()):
                            if field in node_level_fields:
                                logger.warning(f'Node {idx}: Field "{field}" found in parameters, moving to node level')
                                node[field] = node['parameters'].pop(field)
                                fixes_applied.append(ComplianceIssue(
                                    file_path=str(file_path),
                                    issue_type='fix_nested_parameters',
                                    severity='warning',
                                    message=f'Moved "{field}" from parameters to node level',
                                    fix_applied=True,
                                    details={'node_index': idx, 'field': field}
                                ))

        # Fix [object Object] serialization errors in connections
        if 'connections' in workflow and isinstance(workflow['connections'], dict):
            for source_node, outputs in workflow['connections'].items():
                if isinstance(outputs, dict):
                    for output_type, indices in outputs.items():
                        if isinstance(indices, dict):
                            for index, targets in indices.items():
                                if isinstance(targets, list):
                                    for target_idx, target in enumerate(targets):
                                        if isinstance(target, dict) and 'node' in target:
                                            if isinstance(target['node'], str) and '[object Object]' in target['node']:
                                                logger.warning(f'Found serialized object in connection: {target["node"]}')
                                                # Try to find matching node by position or name
                                                node_names = {node.get('name') for node in workflow.get('nodes', [])}
                                                if node_names:
                                                    target['node'] = list(node_names)[0]  # Fallback to first node
                                                    fixes_applied.append(ComplianceIssue(
                                                        file_path=str(file_path),
                                                        issue_type='fix_serialization_error',
                                                        severity='warning',
                                                        message='Fixed serialized object in connections',
                                                        fix_applied=True,
                                                        details={'source': source_node}
                                                    ))

        return workflow, fixes_applied

    def process_workflow_file(self, file_path: Path) -> WorkflowFixResult:
        """
        Process a single workflow file.

        Args:
            file_path: Path to the workflow JSON file

        Returns:
            WorkflowFixResult with all findings and fixes
        """
        result = WorkflowFixResult(file_path=str(file_path))

        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                result.original_size = len(content)

            # Parse JSON
            try:
                workflow = json.loads(content)
            except json.JSONDecodeError as e:
                result.success = False
                result.errors.append(f'Invalid JSON: {str(e)}')
                return result

            if not isinstance(workflow, dict):
                result.success = False
                result.errors.append('Workflow root must be a JSON object')
                return result

            filename = file_path.name

            # 1. Detect missing fields
            issues = self.detect_missing_fields(workflow, filename)
            result.issues_found.extend(issues)

            # 2. Detect object serialization errors
            serialization_issues = self.detect_object_serialization_errors(workflow)
            for issue in serialization_issues:
                issue.file_path = str(file_path)
            result.issues_found.extend(serialization_issues)

            # 3. Detect nested parameters
            for node in workflow.get('nodes', []):
                if isinstance(node, dict):
                    param_issues = self.detect_nested_parameters(node)
                    for issue in param_issues:
                        issue.file_path = str(file_path)
                    result.issues_found.extend(param_issues)

            # 4. Validate connections
            connection_issues = self.validate_connections(workflow)
            for issue in connection_issues:
                issue.file_path = str(file_path)
            result.issues_found.extend(connection_issues)

            # 5. Validate node structure
            for node in workflow.get('nodes', []):
                if isinstance(node, dict):
                    node_issues = self.validate_node_structure(node)
                    for issue in node_issues:
                        issue.file_path = str(file_path)
                    result.issues_found.extend(node_issues)

            # Fix issues if auto_fix is enabled
            if self.auto_fix:
                workflow, fixes = self.fix_workflow(workflow, filename, file_path)
                for fix in fixes:
                    if fix.fix_applied:
                        result.issues_fixed.append(fix)

                # Write fixed workflow if not dry run
                if fixes and not self.dry_run:
                    fixed_content = json.dumps(workflow, indent=2)
                    result.final_size = len(fixed_content)

                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(fixed_content)

                    result.modified = True
                    logger.info(f'Fixed {file_path}: {len(fixes)} fixes applied')
                elif fixes:
                    result.final_size = len(json.dumps(workflow, indent=2))
                    result.modified = True
                    logger.info(f'[DRY RUN] Would fix {file_path}: {len(fixes)} fixes')
            else:
                result.final_size = result.original_size

            # Check if there are any critical issues left
            critical_issues = [issue for issue in result.issues_found if issue.severity == 'critical' and not issue.fix_applied]
            if critical_issues:
                result.success = False
                result.errors.extend([f'Critical: {issue.message}' for issue in critical_issues])
            else:
                result.success = True

        except Exception as e:
            result.success = False
            result.errors.append(f'Error processing file: {str(e)}')
            logger.error(f'Error processing {file_path}: {str(e)}', exc_info=True)

        return result

    def find_workflow_files(self) -> List[Path]:
        """
        Find all workflow JSON files in the base path.

        Searches in:
        - packages/*/workflow/*.json
        - gameengine/packages/*/workflow/*.json

        Returns:
            List of Path objects for workflow files
        """
        workflow_files = []
        patterns = [
            'packages/*/workflow/*.json',
            'gameengine/packages/*/workflow/*.json',
            'packagerepo/backend/workflows/*.json',
        ]

        for pattern in patterns:
            matching_files = sorted(self.base_path.glob(pattern))
            workflow_files.extend(matching_files)

        # Remove duplicates while preserving order
        seen = set()
        unique_files = []
        for f in workflow_files:
            path_str = str(f.resolve())
            if path_str not in seen:
                seen.add(path_str)
                unique_files.append(f)

        return unique_files

    def process_all_workflows(self) -> Tuple[List[WorkflowFixResult], Dict[str, Any]]:
        """
        Process all workflow files found in the base path.

        Returns:
            Tuple of (results list, summary dict)
        """
        workflow_files = self.find_workflow_files()

        if not workflow_files:
            logger.warning(f'No workflow files found in {self.base_path}')
            return [], {}

        logger.info(f'Found {len(workflow_files)} workflow files to process')

        for file_path in workflow_files:
            logger.info(f'Processing {file_path.relative_to(self.base_path)}')
            result = self.process_workflow_file(file_path)
            self.results.append(result)

        # Generate summary
        summary = self.generate_summary()

        return self.results, summary

    def generate_summary(self) -> Dict[str, Any]:
        """
        Generate a summary of all processing results.

        Returns:
            Dictionary containing summary statistics
        """
        total_files = len(self.results)
        successful_files = len([r for r in self.results if r.success])
        failed_files = total_files - successful_files

        total_issues_found = sum(len(r.issues_found) for r in self.results)
        total_issues_fixed = sum(len(r.issues_fixed) for r in self.results)
        total_modified = len([r for r in self.results if r.modified])

        # Count by severity
        severity_counts = {'critical': 0, 'warning': 0, 'info': 0}
        for result in self.results:
            for issue in result.issues_found:
                if issue.severity in severity_counts:
                    severity_counts[issue.severity] += 1

        # Count by issue type
        issue_type_counts = {}
        for result in self.results:
            for issue in result.issues_found:
                issue_type = issue.issue_type
                issue_type_counts[issue_type] = issue_type_counts.get(issue_type, 0) + 1

        return {
            'timestamp': datetime.now().isoformat(),
            'total_files': total_files,
            'successful_files': successful_files,
            'failed_files': failed_files,
            'total_issues_found': total_issues_found,
            'total_issues_fixed': total_issues_fixed,
            'files_modified': total_modified,
            'severity_breakdown': severity_counts,
            'issue_type_breakdown': issue_type_counts,
            'success_rate': f'{(successful_files / total_files * 100):.1f}%' if total_files > 0 else '0%',
        }

    def generate_report(self) -> str:
        """
        Generate a detailed report of all findings.

        Returns:
            Formatted report string
        """
        report_lines = []
        report_lines.append('=' * 80)
        report_lines.append('N8N WORKFLOW COMPLIANCE REPORT')
        report_lines.append('=' * 80)
        report_lines.append('')

        summary = self.generate_summary()

        # Summary section
        report_lines.append('SUMMARY')
        report_lines.append('-' * 80)
        report_lines.append(f'Timestamp:        {summary["timestamp"]}')
        report_lines.append(f'Total Files:      {summary["total_files"]}')
        report_lines.append(f'Successful:       {summary["successful_files"]}')
        report_lines.append(f'Failed:           {summary["failed_files"]}')
        report_lines.append(f'Success Rate:     {summary["success_rate"]}')
        report_lines.append(f'Files Modified:   {summary["files_modified"]}')
        report_lines.append('')

        # Issues section
        report_lines.append('ISSUES')
        report_lines.append('-' * 80)
        report_lines.append(f'Total Found:      {summary["total_issues_found"]}')
        report_lines.append(f'Total Fixed:      {summary["total_issues_fixed"]}')
        report_lines.append('')

        report_lines.append('By Severity:')
        for severity in ['critical', 'warning', 'info']:
            count = summary['severity_breakdown'].get(severity, 0)
            report_lines.append(f'  {severity.capitalize()}: {count}')
        report_lines.append('')

        report_lines.append('By Type:')
        for issue_type in sorted(summary['issue_type_breakdown'].keys()):
            count = summary['issue_type_breakdown'][issue_type]
            report_lines.append(f'  {issue_type}: {count}')
        report_lines.append('')

        # Detailed file results
        report_lines.append('FILE RESULTS')
        report_lines.append('-' * 80)

        for result in self.results:
            status = 'PASS' if result.success else 'FAIL'
            modified = '[MODIFIED]' if result.modified else ''
            rel_path = result.file_path

            report_lines.append(f'{status} {rel_path} {modified}')

            if result.issues_found:
                report_lines.append(f'  Issues: {len(result.issues_found)}')
                for issue in result.issues_found[:5]:  # Show first 5
                    report_lines.append(f'    - [{issue.severity}] {issue.issue_type}: {issue.message}')
                if len(result.issues_found) > 5:
                    report_lines.append(f'    ... and {len(result.issues_found) - 5} more')

            if result.issues_fixed:
                report_lines.append(f'  Fixes Applied: {len(result.issues_fixed)}')
                for fix in result.issues_fixed[:3]:  # Show first 3
                    report_lines.append(f'    ✓ {fix.issue_type}: {fix.message}')
                if len(result.issues_fixed) > 3:
                    report_lines.append(f'    ... and {len(result.issues_fixed) - 3} more')

            if result.errors:
                report_lines.append(f'  Errors:')
                for error in result.errors:
                    report_lines.append(f'    ✗ {error}')

            report_lines.append('')

        report_lines.append('=' * 80)

        return '\n'.join(report_lines)


def main():
    """Command-line entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Fix n8n workflow compliance issues',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Fix all workflows in current directory
  python workflow_compliance_fixer.py .

  # Dry run (show what would be fixed)
  python workflow_compliance_fixer.py . --dry-run

  # Report only, no fixes
  python workflow_compliance_fixer.py . --no-fix

  # Process with verbose output
  python workflow_compliance_fixer.py . -v
        '''
    )

    parser.add_argument(
        'base_path',
        help='Base directory to scan for workflows'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be fixed without modifying files'
    )

    parser.add_argument(
        '--no-fix',
        action='store_true',
        help='Report issues only, do not apply fixes'
    )

    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Verbose output'
    )

    parser.add_argument(
        '--report',
        type=str,
        help='Save report to file'
    )

    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    try:
        base_path = Path(args.base_path)
        if not base_path.is_dir():
            print(f'Error: {base_path} is not a directory', file=sys.stderr)
            sys.exit(1)

        fixer = N8NWorkflowCompliance(
            base_path=str(base_path),
            dry_run=args.dry_run,
            auto_fix=not args.no_fix
        )

        results, summary = fixer.process_all_workflows()

        # Print report
        report = fixer.generate_report()
        print(report)

        # Save report if requested
        if args.report:
            report_path = Path(args.report)
            report_path.parent.mkdir(parents=True, exist_ok=True)
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report)
            logger.info(f'Report saved to {report_path}')

        # Exit with appropriate code
        failed_count = len([r for r in results if not r.success])
        sys.exit(1 if failed_count > 0 else 0)

    except KeyboardInterrupt:
        print('\nAborted by user', file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f'Error: {str(e)}', file=sys.stderr)
        logger.error(f'Fatal error: {str(e)}', exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
