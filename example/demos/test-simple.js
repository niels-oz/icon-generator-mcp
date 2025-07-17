const { MCPServer } = require('../../dist/server');
const path = require('path');

async function runSimpleTest() {
  console.log('🧪 Running simple icon generation test...\n');
  
  // Create server instance
  const server = new MCPServer();
  
  // Test PNG file path
  const testPngPath = path.join(__dirname, '../../test/fixtures/test.png');
  
  // Test request
  const request = {
    png_paths: [testPngPath],
    prompt: 'Change the color from blue to red',
    output_name: 'red-circle-icon'
  };
  
  console.log('📋 Test Request:');
  console.log(`  PNG file: ${testPngPath}`);
  console.log(`  Prompt: "${request.prompt}"`);
  console.log(`  Output name: ${request.output_name}`);
  console.log('');
  
  try {
    console.log('⚡ Calling generate_icon tool...');
    const response = await server.handleToolCall('generate_icon', request);
    
    console.log('📊 Response:');
    console.log(`  Success: ${response.success}`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Processing time: ${response.processing_time}ms`);
    
    if (response.output_path) {
      console.log(`  Output path: ${response.output_path}`);
    }
    
    if (response.error) {
      console.log(`  Error: ${response.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n✅ Test completed!');
}

runSimpleTest();