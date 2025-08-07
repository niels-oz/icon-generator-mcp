const { MCPServer } = require('../dist/server');
const path = require('path');

async function testOutputPath() {
  console.log('🎯 Testing output_path parameter...\n');
  
  const server = new MCPServer();
  const testPngPath = path.join(__dirname, '../test/fixtures/test.png');
  
  // Test 1: Using output_path parameter
  console.log('📋 Test 1: Using custom output_path');
  const request1 = {
    reference_paths: [testPngPath],
    prompt: 'Create a green circle icon',
    output_name: 'green-circle',
    output_path: '/tmp'  // Custom output directory
  };
  
  console.log(`  PNG file: ${testPngPath}`);
  console.log(`  Output path: ${request1.output_path}`);
  console.log(`  Output name: ${request1.output_name}`);
  console.log('');
  
  try {
    const response1 = await server.handleToolCall('generate_icon', request1);
    
    console.log('✅ Response:');
    console.log(`  Success: ${response1.success}`);
    console.log(`  Output path: ${response1.output_path}`);
    console.log(`  Message: ${response1.message}`);
    console.log('');
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }
  
  // Test 2: Without output_path (should use PNG directory)
  console.log('📋 Test 2: Without output_path (fallback to PNG directory)');
  const request2 = {
    reference_paths: [testPngPath],
    prompt: 'Create a blue square icon',
    output_name: 'blue-square'
  };
  
  console.log(`  PNG file: ${testPngPath}`);
  console.log(`  Output path: (not specified - should use PNG directory)`);
  console.log(`  Output name: ${request2.output_name}`);
  console.log('');
  
  try {
    const response2 = await server.handleToolCall('generate_icon', request2);
    
    console.log('✅ Response:');
    console.log(`  Success: ${response2.success}`);
    console.log(`  Output path: ${response2.output_path}`);
    console.log(`  Message: ${response2.message}`);
    console.log('');
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }
  
  console.log('🎉 Output path testing completed!');
}

testOutputPath();