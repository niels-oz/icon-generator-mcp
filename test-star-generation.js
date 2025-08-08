#!/usr/bin/env node

const { MCPServer } = require('./dist/server');

async function testStarGeneration() {
  const server = new MCPServer();
  
  const request = {
    prompt: 'Create a star icon with clean lines and minimalist design',
    reference_paths: ['./example/test-outputs/user-profile-icon.svg'],
    style: 'black-white-flat'
  };
  
  try {
    console.log('Testing star icon generation...');
    const result = await server.handleToolCall('generate_icon', request);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testStarGeneration();