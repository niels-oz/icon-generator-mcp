const { MCPServer } = require('../../dist/server');

async function testCodeReviewRegression() {
  console.log('🧪 Testing Code Review Black & White Regression\n');
  
  const server = new MCPServer();
  
  const request = {
    prompt: 'Create a code review icon with black and white outlines, simple flat design'
  };
  
  console.log('📋 Test Request:');
  console.log(`  Prompt: "${request.prompt}"`);
  console.log('  Expected: Auto-generates variations due to style keywords');
  console.log('');
  
  try {
    const startTime = Date.now();
    const response = await server.handleToolCall('generate_icon', request);
    const endTime = Date.now();
    
    console.log('📊 Response:');
    console.log(`  Success: ${response.success}`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Output path: ${response.output_path}`);
    console.log(`  Processing time: ${endTime - startTime}ms`);
    console.log('');
    
    // Check if variations were generated
    const isVariations = response.message && response.message.includes('variations');
    console.log('🎨 Analysis:');
    console.log(`  Auto-variations detected: ${isVariations}`);
    
    if (isVariations) {
      const outputPaths = response.output_path ? response.output_path.split(', ') : [];
      console.log(`  Number of variations: ${outputPaths.length}`);
      outputPaths.forEach((path, index) => {
        console.log(`    ${index + 1}. ${path}`);
      });
    }
    
    console.log('');
    console.log(response.success ? '✅ Regression test PASSED' : '❌ Regression test FAILED');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCodeReviewRegression().catch(console.error);