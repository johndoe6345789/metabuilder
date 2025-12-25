# Documentation Quality Checker

A bash script that analyzes project documentation and provides a comprehensive quality score from 0-100%.

## Overview

The Documentation Quality Checker evaluates your project across 8 key documentation metrics:

1. **README Coverage** - Presence of README files in main and subdirectories
2. **Documentation Structure** - Organized /docs directory with subdirectories and key files
3. **Code Comments** - Inline comments in source files
4. **JSDoc Coverage** - JSDoc/TypeDoc annotations in TypeScript/JavaScript files
5. **Type Annotations** - TypeScript strict mode and type usage
6. **Examples/Guides** - Example code, demo files, and test coverage
7. **Architecture Documentation** - Design, architecture, and implementation docs
8. **Security Documentation** - Security policies, guidelines, and LICENSE files

## Features

- **Simple to use**: One-line command execution
- **Detailed metrics**: 8-point assessment framework
- **Actionable recommendations**: Specific suggestions for improvement
- **Verbose mode**: Optional detailed output with findings
- **Quality ratings**: Categorized results from CRITICAL to EXCELLENT
- **Color-coded output**: Clear visual formatting

## Installation

The script is located in `/scripts/doc-quality-checker.sh` and is already executable.

## Usage

### Basic Usage

```bash
./scripts/doc-quality-checker.sh
```

Analyzes the current directory.

### Analyze Specific Project

```bash
./scripts/doc-quality-checker.sh /path/to/project
```

### Verbose Output

```bash
./scripts/doc-quality-checker.sh /path/to/project true
```

Shows detailed findings for each metric.

## Output Example

```
╔════════════════════════════════════════════╗
║  Documentation Quality Assessment (0-100%) ║
╚════════════════════════════════════════════╝

Metrics:
  README Coverage                60%
  Documentation Structure        65%
  Code Comments                   0%
  JSDoc Coverage                100%
  Type Annotations               80%
  Examples/Guides                60%
  Architecture Docs              50%
  Security Docs                 100%

────────────────────────────────────────────
  OVERALL SCORE                  64%
────────────────────────────────────────────

Quality Rating: FAIR (60-74%)

Recommendations:
  - Increase inline code comments (5-10% density recommended)
```

## Quality Ratings

- **90-100%**: EXCELLENT - Comprehensive documentation
- **75-89%**: GOOD - Well-documented with minor gaps
- **60-74%**: FAIR - Moderate documentation coverage
- **45-59%**: NEEDS IMPROVEMENT - Significant documentation gaps
- **<45%**: CRITICAL - Minimal or missing documentation

## What It Checks

### README Coverage (Max 100%)
- Main README.md in project root (+40%)
- Documentation index in /docs (+30%)
- READMEs in multiple subdirectories (+30%)

### Documentation Structure (Max 100%)
- Organized /docs directory (+35%)
- Multiple documentation subdirectories (+30%)
- Key files: PRD.md, ARCHITECTURE.md, guides (+20%, +15%)

### Code Comments (Max 100%)
- Percentage of files with inline comments
- Aims for 5-10% comment density

### JSDoc Coverage (Max 100%)
- TypeScript/JavaScript files with JSDoc blocks
- Measures documentation of exported functions

### Type Annotations (Max 100%)
- tsconfig.json presence (+50%)
- TypeScript strict mode enabled (+30%)
- Sufficient TypeScript files (>10) (+20%)

### Examples/Guides (Max 100%)
- /examples directory (+40%)
- /docs/guides directory (+30%)
- Comprehensive test coverage (>10 tests) (+30%)

### Architecture Docs (Max 100%)
- ARCHITECTURE, DESIGN, or IMPLEMENTATION documentation
- Each found document adds 25%

### Security Docs (Max 100%)
- SECURITY.md file (+50%)
- LICENSE file (+25%)
- Security/authentication references in docs (+25%)

## Recommendations

The script provides specific, actionable recommendations based on which metrics score below 60-70%:

- **Low README**: Add comprehensive README files to key directories
- **Low Documentation Structure**: Organize docs with a /docs directory and subdirectories
- **Low Comments**: Aim for 5-10% comment density in code files
- **Low JSDoc**: Add JSDoc comments to exported functions and interfaces
- **Low Types**: Enable TypeScript strict mode and add type annotations
- **Low Examples**: Create an examples/ directory with demo code
- **Low Architecture**: Write documentation about system design and decisions
- **Low Security**: Add SECURITY.md and document best practices

## Integration

This script can be integrated into your CI/CD pipeline to:
- Track documentation quality over time
- Fail builds if documentation score drops below threshold
- Generate documentation reports
- Enforce documentation standards

### Example CI Integration

```yaml
- name: Check Documentation Quality
  run: |
    score=$(./scripts/doc-quality-checker.sh . | grep "OVERALL SCORE" | awk '{print $NF}' | tr -d '%')
    if [ $score -lt 50 ]; then
      echo "Documentation quality too low: $score%"
      exit 1
    fi
```

## Requirements

- bash 4.0+
- find, grep, xargs (standard Unix utilities)
- wc for line counting

## Performance

The script performs limited scans to avoid lengthy analysis:
- README check: Top 2 levels of directory structure
- Code analysis: First 50-80 files of each type
- Documentation scan: /docs directory only

Total execution time: typically < 5 seconds for most projects

## Notes

- The script uses sampling for large projects to maintain performance
- It provides a quick health check, not an exhaustive audit
- Results can vary based on project structure and file organization
- Best used as part of ongoing documentation practices, not as a substitute for actual writing

## Author

GitHub Copilot - MetaBuilder Project

## License

Same as the MetaBuilder project (see LICENSE file)
