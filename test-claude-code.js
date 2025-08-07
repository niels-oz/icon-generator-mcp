#!/usr/bin/env node

// Test script for the icon generator MCP server functionality
// Run directly without MCP protocol - tests core functionality

const { MCPServer } = require('./dist/server');

async function runTests() {
  console.log('🧪 Testing Icon Generator MCP Server in Claude Code\n');
  
  const server = new MCPServer();
  
  // Test 1: Basic text-only icon generation
  console.log('📝 Test 1: Basic text-only generation');
  try {
    const result1 = await server.handleToolCall('generate_icon', {
      prompt: 'Create a simple star icon with clean lines',
      output_name: 'test-star'
    });
    console.log('✅ Success:', result1.message);
    console.log('📁 Output:', result1.output_path);
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Style-based generation
  console.log('📝 Test 2: Black and white flat style');
  try {
    const result2 = await server.handleToolCall('generate_icon', {
      prompt: 'Create a user profile icon showing a person silhouette',
      style: 'black-white-flat',
      output_name: 'test-user-profile'
    });
    console.log('✅ Success:', result2.message);
    console.log('📁 Output:', result2.output_path);
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 3: List available tools
  console.log('📝 Test 3: Available tools');
  try {
    const tools = server.getTools();
    console.log('✅ Available tools:');
    tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  console.log('\n🎉 Testing complete! Check the generated SVG files.');
}

// Run the tests
runTests().catch(console.error);