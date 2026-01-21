#!/bin/bash

##
# Badge Generation Script
# Generates SVG quality badge with current score and trend
##

set -e

# Configuration
REPORT_FILE=".quality/report.json"
BADGE_FILE=".quality/badge.svg"
HISTORY_FILE=".quality/history.json"

# Helper function to determine badge color
get_badge_color() {
  local score=$1

  if (( $(echo "$score >= 90" | bc -l) )); then
    echo "#4CAF50"  # Green
  elif (( $(echo "$score >= 80" | bc -l) )); then
    echo "#8BC34A"  # Light Green
  elif (( $(echo "$score >= 70" | bc -l) )); then
    echo "#FFC107"  # Yellow
  elif (( $(echo "$score >= 60" | bc -l) )); then
    echo "#FF9800"  # Orange
  else
    echo "#F44336"  # Red
  fi
}

# Helper function to darken color (simple approximation for SVG)
darken_color() {
  # For SVG gradient, we just return a slightly darker variant
  # by returning the same color (gradients handled by opacity)
  echo "$1"
}

# Helper function to get trend indicator
get_trend_indicator() {
  local current=$1
  local previous=$2

  if [ -z "$previous" ] || [ "$previous" = "null" ]; then
    echo "→"  # No previous data
  elif (( $(echo "$current > $previous" | bc -l) )); then
    echo "↑"  # Improving
  elif (( $(echo "$current < $previous" | bc -l) )); then
    echo "↓"  # Declining
  else
    echo "→"  # Stable
  fi
}

# Initialize .quality directory if it doesn't exist
mkdir -p .quality

# Default values
SCORE=0
GRADE="N/A"
TREND="→"
COLOR="#999999"

# Extract score from JSON report if it exists
if [ -f "$REPORT_FILE" ]; then
  SCORE=$(jq '.overall.score' "$REPORT_FILE" 2>/dev/null || echo "0")
  GRADE=$(jq -r '.overall.grade' "$REPORT_FILE" 2>/dev/null || echo "N/A")

  # Get previous score for trend calculation
  if [ -f "$HISTORY_FILE" ]; then
    PREVIOUS_SCORE=$(jq '.[-2].overall.score // .[-1].overall.score' "$HISTORY_FILE" 2>/dev/null || echo "")
    TREND=$(get_trend_indicator "$SCORE" "$PREVIOUS_SCORE")
  fi

  COLOR=$(get_badge_color "$SCORE")
fi

# Round score to 1 decimal place
SCORE_ROUNDED=$(printf "%.1f" "$SCORE")

# Create SVG badge
cat > "$BADGE_FILE" << EOF
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="160" height="28">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:$COLOR;stop-opacity:1" />
      <stop offset="100%" style="stop-color:$(darken_color "$COLOR");stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="160" height="28" rx="4" fill="#f0f0f0"/>

  <!-- Left side (label) -->
  <rect width="80" height="28" rx="4" fill="#555"/>

  <!-- Right side (score) -->
  <rect x="80" width="80" height="28" rx="4" fill="url(#gradient)"/>

  <!-- Left text -->
  <text x="14" y="19" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="start">
    Quality
  </text>

  <!-- Right text -->
  <text x="146" y="19" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="end">
    ${SCORE_ROUNDED}% ${TREND}
  </text>

  <!-- Grade indicator -->
  <text x="120" y="7" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle">
    ${GRADE}
  </text>
</svg>
EOF

echo "Badge generated: $BADGE_FILE"
echo "Score: ${SCORE_ROUNDED}% Grade: $GRADE Trend: $TREND"
