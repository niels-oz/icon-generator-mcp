const { MCPServer } = require('../dist/server');

async function testPromptOnly() {
  console.log('🎯 Testing prompt-only icon generation...\n');
  
  const server = new MCPServer();
  
  // Test 1: Empty png_paths array
  console.log('📋 Test 1: Empty png_paths array');
  const request1 = {
    png_paths: [],
    prompt: `The Confirmed Commit

This icon focuses on the "completion" and "confirmation" aspect of a commit. It is very popular in modern UIs like VS Code.

    Description: Draw a simple, medium-sized circle in the center of the icon. Inside this circle, place a bold, clean checkmark (✓). The checkmark's lines should be thick so they are clearly visible.

    Concept: The changes are confirmed and saved. The circle represents the commit as a self-contained unit.`
  };
  
  console.log(`  PNG paths: ${JSON.stringify(request1.png_paths)}`);
  console.log(`  Prompt: ${request1.prompt}`);
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
  
  // Test 2: Missing png_paths property
  console.log('📋 Test 2: Missing png_paths property');
  const request2 = {
    prompt: `The Simple Branch

This icon abstracts the Git logo, focusing on the creation of a commit on a branch.

    Description: Draw a primary vertical line. About halfway up, have a second, shorter line branch off at a 45-degree angle. At the very end of this shorter branch, place a single, solid, filled circle.

    Concept: This is a commit (the dot) being made on a new or existing branch. It’s instantly recognizable to anyone familiar with Git.`
  };
  
  console.log(`  PNG paths: (not provided)`);
  console.log(`  Prompt: ${request2.prompt}`);
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
  
  // Test 3: With custom output name
  console.log('📋 Test 3: With custom output name');
  const request3 = {
    png_paths: [],
    prompt: 'Create a green triangle icon',
    output_name: 'custom-triangle'
  };
  
  console.log(`  PNG paths: ${JSON.stringify(request3.png_paths)}`);
  console.log(`  Prompt: ${request3.prompt}`);
  console.log(`  Output name: ${request3.output_name}`);
  console.log('');
  
  try {
    const response3 = await server.handleToolCall('generate_icon', request3);
    
    console.log('✅ Response:');
    console.log(`  Success: ${response3.success}`);
    console.log(`  Output path: ${response3.output_path}`);
    console.log(`  Message: ${response3.message}`);
    console.log('');
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }
  
  console.log('🎉 Prompt-only testing completed!');
}

testPromptOnly();