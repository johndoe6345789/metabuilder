#!/bin/bash

##############################################################################
# Documentation Quality Checker
# Analyzes project documentation and provides a quality score (0-100%)
# 
# Metrics evaluated:
# - README files coverage
# - Documentation structure
# - Code comments coverage
# - JSDoc/TypeDoc annotations
# - Type annotations
# - Example files
# - Architecture documentation
# - Security documentation
##############################################################################

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Scoring weights
declare -A WEIGHTS=(
    [readme_coverage]=15
    [docs_structure]=15
    [comments_coverage]=15
    [jsdoc_coverage]=15
    [type_annotations]=10
    [examples]=10
    [architecture_docs]=10
    [security_docs]=10
)

PROJECT_ROOT="${1:-.}"
VERBOSE="${2:-false}"

# Initialize metrics
declare -A METRICS

##############################################################################
# Utility Functions
##############################################################################

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

print_metric() {
    local name=$1
    local score=$2
    local max=$3
    local percentage=0
    
    if (( max > 0 )); then
        percentage=$((score * 100 / max))
    fi
    
    if (( percentage >= 80 )); then
        color=$GREEN
    elif (( percentage >= 60 )); then
        color=$YELLOW
    else
        color=$RED
    fi
    
    printf "  %-30s %3d/%3d (${color}%3d%%${NC})\n" "$name:" "$score" "$max" "$percentage"
}

##############################################################################
# README Coverage Check
##############################################################################

check_readme_coverage() {
    local score=0
    local max=100
    
    log_info "Checking README coverage..."
    
    local readme_count=0
    local total_dirs=0
    
    # Count directories with README files (sample scan)
    while IFS= read -r dir; do
        if [[ -d "$dir" ]]; then
            ((total_dirs++))
            if [[ -f "$dir/README.md" || -f "$dir/README.txt" || -f "$dir/README" ]]; then
                ((readme_count++))
            fi
        fi
    done < <(find "$PROJECT_ROOT" -maxdepth 2 -type d 2>/dev/null)
    
    # Check main README
    if [[ -f "$PROJECT_ROOT/README.md" ]]; then
        ((score += 30))
    fi
    
    if [[ -f "$PROJECT_ROOT/docs/README.md" || -f "$PROJECT_ROOT/docs/INDEX.md" ]]; then
        ((score += 20))
    fi
    
    # Score based on readme ratio
    if (( total_dirs > 1 )); then
        local ratio=$((readme_count * 100 / total_dirs))
        if (( ratio > 30 )); then
            ((score += 30))
        elif (( ratio > 15 )); then
            ((score += 15))
        else
            ((score += 5))
        fi
    fi
    
    [[ $VERBOSE == "true" ]] && echo "    README files found: $readme_count/$total_dirs directories"
    
    METRICS[readme_coverage]=$((score > max ? max : score))
}

##############################################################################
# Documentation Structure Check
##############################################################################

check_docs_structure() {
    local score=0
    local max=100
    
    log_info "Checking documentation structure..."
    
    # Check for organized docs directory
    if [[ -d "$PROJECT_ROOT/docs" ]]; then
        ((score += 30))
        
        # Count subdirectories
        local subdirs=0
        while IFS= read -r -d '' dir; do
            [[ -d "$dir" ]] && ((subdirs++))
        done < <(find "$PROJECT_ROOT/docs" -maxdepth 1 -type d -print0 2>/dev/null)
        
        if (( subdirs >= 3 )); then
            ((score += 20))
        elif (( subdirs >= 1 )); then
            ((score += 10))
        fi
        
        [[ $VERBOSE == "true" ]] && echo "    Documentation subdirectories: $subdirs"
    fi
    
    # Check for key documentation files
    local found_docs=0
    if [[ -f "$PROJECT_ROOT/docs/architecture" || -f "$PROJECT_ROOT/docs/architecture.md" || -d "$PROJECT_ROOT/docs/architecture" ]]; then
        ((found_docs++))
    fi
    if [[ -f "$PROJECT_ROOT/docs/guide.md" || -d "$PROJECT_ROOT/docs/guides" ]]; then
        ((found_docs++))
    fi
    if [[ -f "$PROJECT_ROOT/docs/index.md" || -f "$PROJECT_ROOT/docs/INDEX.md" ]]; then
        ((found_docs++))
    fi
    if [[ -f "$PROJECT_ROOT/PRD.md" || -f "$PROJECT_ROOT/docs/PRD.md" ]]; then
        ((found_docs++))
    fi
    
    ((score += found_docs * 10))
    
    METRICS[docs_structure]=$((score > max ? max : score))
}

##############################################################################
# Comments Coverage Check
##############################################################################

check_comments_coverage() {
    local score=0
    local max=100
    
    log_info "Checking code comments coverage..."
    
    local total_files=0
    local commented_files=0
    local total_lines=0
    local comment_lines=0
    
    # Sample scan of TypeScript/JavaScript files
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            ((total_files++))
            
            local file_lines=0
            file_lines=$(wc -l < "$file" 2>/dev/null || echo 0)
            ((total_lines += file_lines))
            
            # Count comment lines
            local file_comments=0
            file_comments=$(grep -c '^\s*//' "$file" 2>/dev/null || true)
            file_comments=$((file_comments + $(grep -c '^\s*\*' "$file" 2>/dev/null || true)))
            
            if (( file_comments > 0 )); then
                ((commented_files++))
                ((comment_lines += file_comments))
            fi
        fi
    done < <(find "$PROJECT_ROOT" \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/build/*" 2>/dev/null | head -80)
    
    if (( total_files > 0 )); then
        local file_ratio=$((commented_files * 100 / total_files))
        score=$((file_ratio * 70 / 100))
    fi
    
    if (( total_lines > 0 )); then
        local comment_ratio=$((comment_lines * 100 / total_lines))
        score=$((score + comment_ratio * 30 / 100))
    fi
    
    [[ $VERBOSE == "true" ]] && echo "    Commented files: $commented_files/$total_files"
    [[ $VERBOSE == "true" ]] && echo "    Comment density: $(( comment_lines * 100 / (total_lines + 1) ))%"
    
    METRICS[comments_coverage]=$((score > max ? max : score))
}

##############################################################################
# JSDoc/TypeDoc Coverage Check
##############################################################################

check_jsdoc_coverage() {
    local score=0
    local max=100
    
    log_info "Checking JSDoc/TypeDoc coverage..."
    
    local jsdoc_blocks=0
    local files_scanned=0
    
    # Count JSDoc blocks in files
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            ((files_scanned++))
            local blocks=$(grep -c '^\s*/\*\*' "$file" 2>/dev/null || true)
            ((jsdoc_blocks += blocks))
        fi
    done < <(find "$PROJECT_ROOT" \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/build/*" 2>/dev/null | head -50)
    
    if (( files_scanned > 0 )); then
        score=$((jsdoc_blocks * 100 / files_scanned))
        # Cap at 100%
        (( score > max )) && score=$max
    fi
    
    [[ $VERBOSE == "true" ]] && echo "    JSDoc blocks: $jsdoc_blocks in $files_scanned files"
    
    METRICS[jsdoc_coverage]=$score
}

##############################################################################
# Type Annotations Check
##############################################################################

check_type_annotations() {
    local score=0
    local max=100
    
    log_info "Checking type annotations..."
    
    local well_typed=0
    local total_files=0
    
    # Check TypeScript files for type annotations
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            ((total_files++))
            
            # Look for type annotations
            local annotations=$(grep -c ':\s*[A-Z][a-zA-Z]*\|:\s*{' "$file" 2>/dev/null || true)
            
            if (( annotations > 3 )); then
                ((well_typed++))
            fi
        fi
    done < <(find "$PROJECT_ROOT" \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/build/*" 2>/dev/null | head -50)
    
    if (( total_files > 0 )); then
        score=$((well_typed * 100 / total_files))
    fi
    
    [[ $VERBOSE == "true" ]] && echo "    Well-typed files: $well_typed/$total_files"
    
    METRICS[type_annotations]=$score
}

##############################################################################
# Examples Check
##############################################################################

check_examples() {
    local score=0
    local max=100
    
    log_info "Checking example files..."
    
    # Look for example files
    local examples=$(find "$PROJECT_ROOT" \( -name "*example*" -o -name "*demo*" -o -name "*sample*" \) -type f 2>/dev/null | grep -v node_modules | wc -l)
    
    if (( examples > 0 )); then
        ((score += 40))
    fi
    
    # Check for example/guide directories
    if [[ -d "$PROJECT_ROOT/docs/guides" || -d "$PROJECT_ROOT/examples" ]]; then
        ((score += 30))
    fi
    
    # Check for test files
    local tests=$(find "$PROJECT_ROOT" \( -name "*.spec.*" -o -name "*.test.*" \) -type f 2>/dev/null | grep -v node_modules | wc -l)
    if (( tests > 5 )); then
        ((score += 30))
    fi
    
    [[ $VERBOSE == "true" ]] && echo "    Example files: $examples, Tests: $tests"
    
    METRICS[examples]=$((score > max ? max : score))
}

##############################################################################
# Architecture Documentation Check
##############################################################################

check_architecture_docs() {
    local score=0
    local max=100
    
    log_info "Checking architecture documentation..."
    
    local found_arch=0
    
    # Check for architecture documentation
    for pattern in "ARCHITECTURE" "architecture" "DESIGN" "design" "implementation" "IMPLEMENTATION"; do
        if [[ -f "$PROJECT_ROOT/docs/${pattern}.md" || -d "$PROJECT_ROOT/docs/$pattern" || -f "$PROJECT_ROOT/$pattern.md" ]]; then
            ((found_arch++))
            ((score += 25))
        fi
    done
    
    # Check for design docs
    local design_files=$(find "$PROJECT_ROOT/docs" \( -iname "*design*" -o -iname "*architecture*" -o -iname "*implementation*" \) 2>/dev/null | wc -l)
    if (( design_files > 0 )); then
        ((score += 25))
    fi
    
    [[ $VERBOSE == "true" ]] && echo "    Architecture docs found: $found_arch"
    
    METRICS[architecture_docs]=$((score > max ? max : score))
}

##############################################################################
# Security Documentation Check
##############################################################################

check_security_docs() {
    local score=0
    local max=100
    
    log_info "Checking security documentation..."
    
    # Check for security documentation
    if [[ -f "$PROJECT_ROOT/docs/SECURITY.md" || -f "$PROJECT_ROOT/SECURITY.md" || -f "$PROJECT_ROOT/security.md" ]]; then
        ((score += 40))
    fi
    
    # Check for security mentions in docs
    local security_refs=$(grep -r "security\|authentication\|authorization\|encryption" "$PROJECT_ROOT/docs" 2>/dev/null | wc -l)
    if (( security_refs > 0 )); then
        ((score += 30))
    fi
    
    # Check for LICENSE
    if [[ -f "$PROJECT_ROOT/LICENSE" || -f "$PROJECT_ROOT/LICENSE.md" ]]; then
        ((score += 30))
    fi
    
    [[ $VERBOSE == "true" ]] && echo "    Security references: $security_refs"
    
    METRICS[security_docs]=$((score > max ? max : score))
}

##############################################################################
# Calculate Overall Score
##############################################################################

calculate_score() {
    local total_score=0
    local total_weight=0
    
    log_info "Calculating overall score..."
    
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Documentation Quality Metrics${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    
    for metric in "${!WEIGHTS[@]}"; do
        local metric_score=${METRICS[$metric]:-0}
        local weight=${WEIGHTS[$metric]}
        local contribution=$((metric_score * weight / 100))
        
        total_score=$((total_score + contribution))
        total_weight=$((total_weight + weight))
        
        # Format metric name nicely
        local display_name=$(echo "$metric" | sed 's/_/ /g')
        print_metric "$display_name" "$metric_score" "100"
    done
    
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    
    if (( total_weight > 0 )); then
        total_score=$((total_score / total_weight))
    fi
    
    printf "  %-30s %3d%%\n" "Overall Quality Score:" "$total_score"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    
    echo "$total_score"
}

##############################################################################
# Get Quality Rating
##############################################################################

get_quality_rating() {
    local score=$1
    
    if (( score >= 90 )); then
        echo "EXCELLENT ⭐⭐⭐⭐⭐"
    elif (( score >= 75 )); then
        echo "GOOD ⭐⭐⭐⭐"
    elif (( score >= 60 )); then
        echo "FAIR ⭐⭐⭐"
    elif (( score >= 45 )); then
        echo "NEEDS IMPROVEMENT ⭐⭐"
    else
        echo "CRITICAL ⭐"
    fi
}

##############################################################################
# Recommendations
##############################################################################

print_recommendations() {
    local score=$1
    
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Recommendations${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    
    if (( ${METRICS[readme_coverage]:-0} < 60 )); then
        log_warning "Add README files to key directories"
    fi
    
    if (( ${METRICS[docs_structure]:-0} < 60 )); then
        log_warning "Organize documentation in docs/ directory with subdirectories"
    fi
    
    if (( ${METRICS[comments_coverage]:-0} < 60 )); then
        log_warning "Increase inline code comments (aim for 5-10% comment density)"
    fi
    
    if (( ${METRICS[jsdoc_coverage]:-0} < 60 )); then
        log_warning "Add JSDoc comments to exported functions and interfaces"
    fi
    
    if (( ${METRICS[type_annotations]:-0} < 70 )); then
        log_warning "Improve type annotations - avoid implicit 'any' types"
    fi
    
    if (( ${METRICS[examples]:-0} < 50 )); then
        log_warning "Create example files and demo code for key features"
    fi
    
    if (( ${METRICS[architecture_docs]:-0} < 50 )); then
        log_warning "Document system architecture, design decisions, and diagrams"
    fi
    
    if (( ${METRICS[security_docs]:-0} < 50 )); then
        log_warning "Create security documentation, best practices, and policies"
    fi
    
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
}

##############################################################################
# Main Execution
##############################################################################

main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   Documentation Quality Checker            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_info "Analyzing project: $PROJECT_ROOT"
    echo ""
    
    # Run all checks
    check_readme_coverage
    check_docs_structure
    check_comments_coverage
    check_jsdoc_coverage
    check_type_annotations
    check_examples
    check_architecture_docs
    check_security_docs
    
    echo ""
    
    # Calculate and display score
    local final_score
    final_score=$(calculate_score)
    
    echo ""
    echo -e "Quality Rating: $(get_quality_rating $final_score)"
    echo ""
    
    # Print recommendations
    print_recommendations $final_score
    
    echo ""
    echo -e "${BLUE}Usage:${NC} doc-quality-checker.sh [path] [verbose]"
    echo -e "  path:    Project root directory (default: current directory)"
    echo -e "  verbose: Set to 'true' for detailed output"
    echo ""
}

# Run main function
main
