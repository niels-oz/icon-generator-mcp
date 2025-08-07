#!/bin/bash

# Sophisticated Few-Shot Learning Regression Test Runner
# This script runs the comprehensive regression test that validates:
# - Few-shot learning pattern adherence
# - SVG quality and structure
# - File output to test directory (not committed)
# - Processing time and step tracking

echo "🧠 Running Few-Shot Learning Regression Test"
echo "============================================"
echo ""
echo "This test validates:"
echo "• Few-shot learning pattern recognition"  
echo "• Complex monstera plant icon generation"
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
echo "🧪 Running regression test..."
echo ""

# Run the sophisticated regression test
npm run test:regression

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 Regression test completed successfully!"
  echo ""
  echo "📊 Test Coverage:"
  echo "✅ Few-shot learning pattern adherence"
  echo "✅ Complex AI icon generation (monstera plant)"
  echo "✅ SVG structure and quality validation"
  echo "✅ Output file management (test/test-output/)"
  echo "✅ Processing time and step tracking"
  echo "✅ Phase-based generation pipeline validation"
  echo ""
  echo "📁 Generated test files are in test/test-output/ (excluded from git)"
else
  echo "❌ Regression test failed"
  exit 1
fi