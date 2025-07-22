const { MCPServer } = require('../../dist/server');
const fs = require('fs');

async function testSingleOriginalPrompt() {
  console.log('🎨 Testing Single Original Prompt\n');
  
  const server = new MCPServer();
  
  // Original prompt that generated good quality
  const request = {
    prompt: 'Create a code review icon showing a document with code lines and a checkmark overlay. Use black outlines on white background, minimal details, clean geometric shapes.',
    output_name: 'og-test'
  };
  
  console.log('📋 Test Request:');
  console.log(`  Prompt: "${request.prompt}"`);
  console.log(`  Output name: ${request.output_name}`);
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
    
    if (response.success && response.output_path) {
      const svgContent = fs.readFileSync(response.output_path, 'utf8');
      console.log(`  SVG size: ${svgContent.length} characters`);
      console.log(`  SVG preview: ${svgContent.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('');
  console.log('🎉 Single Original Prompt Test Complete!');
}

testSingleOriginalPrompt().catch(console.error);