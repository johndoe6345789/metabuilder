#!/usr/bin/env python3
"""
MetaBuilder Project Summary Generator
Self-documenting argparse script to generate project summaries
"""

import argparse
import subprocess
import json
from pathlib import Path
from datetime import datetime

def run_cmd(cmd, capture=True):
    """Run shell command and optionally capture output"""
    if capture:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.stdout.strip()
    else:
        subprocess.run(cmd, shell=True)
        return None

def count_files(pattern):
    """Count files matching glob pattern"""
    try:
        result = run_cmd(f"find . -type f -name '{pattern}' | wc -l")
        return int(result)
    except:
        return 0

def get_git_stats():
    """Get Git repository statistics"""
    return {
        'branch': run_cmd('git branch --show-current'),
        'commits': run_cmd('git rev-list --count HEAD'),
        'contributors': run_cmd('git shortlog -sn --all | wc -l'),
        'last_commit': run_cmd('git log -1 --format="%h - %s (%ar)"'),
    }

def get_code_stats():
    """Get code statistics by language"""
    stats = {}
    languages = {
        'TypeScript': '*.ts',
        'JavaScript': '*.js',
        'Python': '*.py',
        'C++': '*.cpp',
        'QML': '*.qml',
        'SCSS': '*.scss',
        'JSON': '*.json',
        'YAML': '*.yaml',
    }

    for lang, pattern in languages.items():
        count = count_files(pattern)
        if count > 0:
            stats[lang] = count

    return stats

def get_docker_status():
    """Get Docker container status"""
    try:
        containers = run_cmd("docker ps --format '{{.Names}}: {{.Status}}'")
        return containers.split('\n') if containers else []
    except:
        return []

def get_npm_packages():
    """Get npm workspace packages"""
    try:
        result = run_cmd('npm ls --json --depth=0')
        data = json.loads(result)
        return list(data.get('dependencies', {}).keys())
    except:
        return []

def get_subproject_info():
    """Get information about subprojects"""
    subprojects = {
        'dbal': 'Database Abstraction Layer',
        'workflow': 'DAG Workflow Engine',
        'workflowui': 'Workflow UI (Next.js)',
        'fakemui': 'Material Design 3 Components',
        'codegen': 'CodeForge IDE',
        'pastebin': 'Code Snippet Sharing',
        'postgres': 'PostgreSQL Admin Dashboard',
        'gameengine': 'SDL3/bgfx Game Engine',
        'mojo': 'Mojo Compiler Implementation',
    }

    info = {}
    for name, description in subprojects.items():
        path = Path(name)
        if path.exists():
            ts_files = count_files(f'{name}/*.ts')
            py_files = count_files(f'{name}/*.py')
            info[name] = {
                'description': description,
                'typescript': ts_files,
                'python': py_files,
            }

    return info

def generate_summary_markdown():
    """Generate full project summary in markdown"""
    git = get_git_stats()
    code = get_code_stats()
    docker = get_docker_status()
    packages = get_npm_packages()
    subprojects = get_subproject_info()

    output = [
        f"# MetaBuilder Project Summary",
        f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "## Git Repository",
        f"- **Branch**: {git['branch']}",
        f"- **Commits**: {git['commits']}",
        f"- **Contributors**: {git['contributors']}",
        f"- **Last Commit**: {git['last_commit']}",
        "",
        "## Code Statistics",
    ]

    for lang, count in sorted(code.items(), key=lambda x: x[1], reverse=True):
        output.append(f"- **{lang}**: {count:,} files")

    output.extend([
        "",
        "## Subprojects",
    ])

    for name, info in sorted(subprojects.items()):
        output.append(f"### {name}")
        output.append(f"**Description**: {info['description']}")
        if info['typescript'] > 0:
            output.append(f"- TypeScript files: {info['typescript']}")
        if info['python'] > 0:
            output.append(f"- Python files: {info['python']}")
        output.append("")

    if docker:
        output.extend([
            "## Docker Containers",
        ])
        for container in docker:
            output.append(f"- {container}")
        output.append("")

    if packages:
        output.extend([
            "## NPM Dependencies",
            f"**Total**: {len(packages)} packages",
            "",
        ])
        for pkg in sorted(packages[:20]):  # Top 20
            output.append(f"- {pkg}")
        if len(packages) > 20:
            output.append(f"- ... and {len(packages) - 20} more")
        output.append("")

    output.extend([
        "## Quick Commands",
        "```bash",
        "# Start everything",
        "./metabuilder.py quick-start",
        "",
        "# C++ development",
        "./metabuilder.py dev start --build --shell",
        "",
        "# Run tests",
        "./metabuilder.py test run comprehensive",
        "",
        "# Check status",
        "./metabuilder.py status",
        "```",
    ])

    return '\n'.join(output)

def generate_summary_json():
    """Generate project summary in JSON format"""
    return json.dumps({
        'timestamp': datetime.now().isoformat(),
        'git': get_git_stats(),
        'code': get_code_stats(),
        'docker': get_docker_status(),
        'subprojects': get_subproject_info(),
    }, indent=2)

def generate_summary_compact():
    """Generate compact one-line summary"""
    git = get_git_stats()
    code = get_code_stats()
    total_files = sum(code.values())

    return f"MetaBuilder [{git['branch']}] {git['commits']} commits, {total_files:,} files across {len(code)} languages"

def main():
    parser = argparse.ArgumentParser(
        description='MetaBuilder Project Summary Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate markdown summary
  %(prog)s --format markdown

  # Generate JSON summary
  %(prog)s --format json

  # Generate compact summary
  %(prog)s --format compact

  # Save to file
  %(prog)s --format markdown --output summary.md

  # Show git stats only
  %(prog)s --git

  # Show code stats only
  %(prog)s --code

  # Show Docker status
  %(prog)s --docker
        """
    )

    parser.add_argument(
        '--format',
        choices=['markdown', 'json', 'compact'],
        default='markdown',
        help='Output format (default: markdown)'
    )

    parser.add_argument(
        '--output', '-o',
        type=str,
        help='Output file (default: stdout)'
    )

    parser.add_argument(
        '--git',
        action='store_true',
        help='Show only Git statistics'
    )

    parser.add_argument(
        '--code',
        action='store_true',
        help='Show only code statistics'
    )

    parser.add_argument(
        '--docker',
        action='store_true',
        help='Show only Docker status'
    )

    args = parser.parse_args()

    # Handle specific stats requests
    if args.git:
        git = get_git_stats()
        output = '\n'.join([f"{k}: {v}" for k, v in git.items()])
    elif args.code:
        code = get_code_stats()
        output = '\n'.join([f"{k}: {v}" for k, v in sorted(code.items(), key=lambda x: x[1], reverse=True)])
    elif args.docker:
        docker = get_docker_status()
        output = '\n'.join(docker) if docker else "No Docker containers running"
    else:
        # Generate full summary
        if args.format == 'markdown':
            output = generate_summary_markdown()
        elif args.format == 'json':
            output = generate_summary_json()
        else:  # compact
            output = generate_summary_compact()

    # Write output
    if args.output:
        Path(args.output).write_text(output)
        print(f"✅ Summary written to {args.output}")
    else:
        print(output)

if __name__ == '__main__':
    main()
