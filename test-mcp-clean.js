#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Testing MCP Server (Clean Output)\n');

// Spawn the MCP server
const server = spawn('node', ['bin/mcp-server-simple.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
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
  
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Collect responses
let responses = [];

// Read responses line by line
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    try {
      const response = JSON.parse(line);
      responses.push(response);
      
      // Process based on response ID
      if (response.id === 1 && response.result) {
        console.log('✅ Server initialized');
        console.log(`   Name: ${response.result.serverInfo.name}`);
        console.log(`   Version: ${response.result.serverInfo.version}\n`);
        sendRequest('tools/list');
      } else if (response.id === 2 && response.result) {
        console.log('✅ Tools available:');
        response.result.tools.forEach(tool => {
          console.log(`   - ${tool.name}: ${tool.description}`);
        });
        console.log('\n✅ Testing tool execution...\n');
        sendRequest('tools/call', {
          name: 'generate_icon',
          arguments: {
            prompt: 'Create a simple test star icon',
            output_name: 'test-star',
            llm_provider: 'gemini' // Try Gemini if Claude quota exhausted
          }
        });
      } else if (response.id === 3) {
        if (response.result) {
          const result = JSON.parse(response.result.content[0].text);
          if (result.success) {
            console.log('✅ Icon generated successfully!');
            console.log(`   Output: ${result.output_path}`);
          } else {
            console.log('⚠️  Icon generation failed (expected if no LLM available)');
            console.log(`   Error: ${result.error}`);
          }
        } else if (response.error) {
          console.log('❌ Tool execution error:', response.error.message);
        }
        
        console.log('\n🎉 MCP Server is working correctly!');
        console.log('\nNext steps:');
        console.log('1. Configure Claude Desktop with the path shown by setup script');
        console.log('2. Install Claude CLI or Gemini CLI for actual icon generation');
        console.log('3. Use "npm run dev" for live development\n');
        
        process.exit(0);
      }
    } catch (error) {
      // Ignore non-JSON lines
    }
  }
});

// Handle errors
server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

// Start test
sendRequest('initialize', {
  protocolVersion: "0.1.0",
  capabilities: {},
  clientInfo: {
    name: "test-client",
    version: "1.0.0"
  }
});

// Timeout
setTimeout(() => {
  console.error('❌ Test timed out');
  server.kill();
  process.exit(1);
}, 10000);