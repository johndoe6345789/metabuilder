#!/bin/bash
# Test runner guide for Snippet Pastebin E2E tests
# This file provides quick commands to run different test scenarios

echo "================================"
echo "Snippet Pastebin E2E Test Guide"
echo "================================"
echo ""

# Function to display help
show_help() {
  echo "Available commands:"
  echo ""
  echo "Run all tests:"
  echo "  npm run test:e2e"
  echo ""
  echo "Run specific test suite:"
  echo "  npm run test:e2e visual-regression"
  echo "  npm run test:e2e functionality"
  echo "  npm run test:e2e components"
  echo "  npm run test:e2e mobile-responsive"
  echo "  npm run test:e2e css-styling"
  echo ""
  echo "Run with headed browser (see what tests do):"
  echo "  npx playwright test --headed"
  echo ""
  echo "Run in debug mode:"
  echo "  npx playwright test --debug"
  echo ""
  echo "Update visual snapshots:"
  echo "  npx playwright test --update-snapshots"
  echo ""
  echo "Run only desktop tests:"
  echo "  npx playwright test --project=chromium-desktop"
  echo ""
  echo "Run only mobile tests:"
  echo "  npx playwright test --project=chromium-mobile"
  echo ""
  echo "Run specific test by name:"
  echo "  npx playwright test -g 'test name pattern'"
  echo ""
  echo "Generate HTML report:"
  echo "  npx playwright test && npx playwright show-report"
  echo ""
  echo "Run with trace recording (for debugging):"
  echo "  npx playwright test --trace on"
  echo ""
}

# Display help by default
if [ $# -eq 0 ]; then
  show_help
else
  case "$1" in
    all)
      npm run test:e2e
      ;;
    visual)
      npm run test:e2e visual-regression
      ;;
    functionality)
      npm run test:e2e functionality
      ;;
    components)
      npm run test:e2e components
      ;;
    mobile)
      npm run test:e2e mobile-responsive
      ;;
    css)
      npm run test:e2e css-styling
      ;;
    headed)
      npx playwright test --headed
      ;;
    debug)
      npx playwright test --debug
      ;;
    *)
      echo "Unknown command: $1"
      show_help
      ;;
  esac
fi
