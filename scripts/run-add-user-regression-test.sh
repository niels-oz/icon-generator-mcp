#!/bin/bash

# Add User Icon Generation Regression Test Runner
# This script runs a regression test that validates:
# - Few-shot learning with existing black-white-flat icon examples
# - SVG quality and structure for add user icons
# - File output to test directory (not committed)
# - Processing time and step tracking

echo "👤 Running Add User Icon Generation Regression Test"
echo "=================================================="
echo ""
echo "This test validates:"
echo "• Few-shot learning with black-white-flat icon patterns"  
echo "• Add user icon generation using existing style examples"
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
echo "🧪 Running add user icon generation test..."
echo ""

# Create test output directory if it doesn't exist
mkdir -p test/test-output

# Run the add user icon generation regression test
npm run test:add-user

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 Add User Icon Regression test completed successfully!"
  echo ""
  echo "📊 Test Coverage:"
  echo "✅ Few-shot learning with black-white-flat patterns"
  echo "✅ Add user icon generation using existing style examples"
  echo "✅ SVG structure and quality validation"
  echo "✅ Output file management (test/test-output/)"
  echo "✅ Processing time and step tracking"
  echo "✅ Black-white-flat style pattern adherence validation"
  echo ""
  echo "📁 Generated test files are in test/test-output/ (excluded from git)"
else
  echo "❌ Add user icon regression test failed"
  exit 1
fi