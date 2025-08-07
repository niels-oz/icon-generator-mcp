#!/bin/bash

# Code Review Icon Generation Regression Test Runner
# This script runs a regression test that validates:
# - Few-shot learning with code review icon examples
# - SVG quality and structure for code review icons
# - File output to test directory (not committed)
# - Processing time and step tracking

echo "🔍 Running Code Review Icon Generation Regression Test"
echo "====================================================="
echo ""
echo "This test validates:"
echo "• Few-shot learning with code review icon patterns"  
echo "• Code review icon generation using dual-documents and magnifying-code examples"
echo "• SVG quality and structure validation"
echo "• Output file management in test directory"
echo "• Processing performance metrics"
echo ""

# Ensure build is up to date
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo ""
echo "🧪 Running code review icon regression test..."
echo ""

# Run the code review regression test
npm run test:code-review

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 Code Review Icon Regression test completed successfully!"
  echo ""
  echo "📊 Test Coverage:"
  echo "✅ Few-shot learning with code review patterns"
  echo "✅ Code review icon generation (dual-documents & magnifying-code examples)"
  echo "✅ SVG structure and quality validation"
  echo "✅ Output file management (test/test-output/)"
  echo "✅ Processing time and step tracking"
  echo "✅ Code review icon pattern adherence validation"
  echo ""
  echo "📁 Generated test files are in test/test-output/ (excluded from git)"
else
  echo "❌ Code review icon regression test failed"
  exit 1
fi