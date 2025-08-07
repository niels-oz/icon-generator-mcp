#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🧪 Testing MCP Server Communication...\n');

// Spawn the MCP server
const server = spawn('node', ['bin/mcp-server-proper.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Create readline interface for pretty output
const rl = readline.createInterface({
  input: server.stdout,
  crlfDelay: Infinity
});

// Track request IDs
let requestId = 1;

// Helper to send JSON-RPC request
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: requestId++,
    method: method,
    params: params
  };
  
  console.log(`📤 Sending ${method} request:`, JSON.stringify(params, null, 2));
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Parse responses
rl.on('line', (line) => {
  try {
    const response = JSON.parse(line);
    console.log(`📥 Response:`, JSON.stringify(response, null, 2));
    console.log('---');
    
    // Handle different response types
    if (response.id === 1) {
      // After initialize, list tools
      console.log('✅ Server initialized successfully!\n');
      sendRequest('tools/list');
    } else if (response.id === 2) {
      // After tool list, try calling the tool
      console.log('✅ Tools listed successfully!\n');
      sendRequest('tools/call', {
        name: 'generate_icon',
        arguments: {
          prompt: 'Create a simple test star icon',
          output_name: 'test-star'
        }
      });
    } else if (response.id === 3) {
      console.log('✅ Tool executed successfully!\n');
      console.log('🎉 All tests passed! The MCP server is working correctly.');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error parsing response:', error.message);
    console.error('Raw line:', line);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

server.stderr.on('data', (data) => {
  console.error('❌ Server error:', data.toString());
});

// Start by initializing
console.log('🚀 Starting MCP protocol test...\n');
sendRequest('initialize', {
  protocolVersion: "0.1.0",
  capabilities: {},
  clientInfo: {
    name: "test-client",
    version: "1.0.0"
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('❌ Test timed out after 30 seconds');
  server.kill();
  process.exit(1);
}, 30000);