#!/usr/bin/env node

const { MCPServer } = require('../dist/server');

// Suppress console output when running as MCP server
const originalConsoleLog = console.log;
console.log = () => {}; // Disable console.log for MCP mode

// Simple MCP server that handles JSON-RPC over stdio
async function main() {
  const iconGenerator = new MCPServer();
  const tools = iconGenerator.getTools();
  
  // Read from stdin
  let buffer = '';
  
  process.stdin.on('data', async (chunk) => {
    buffer += chunk.toString();
    
    // Process complete JSON messages
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const request = JSON.parse(line);
        let response;
        
        switch (request.method) {
          case 'initialize':
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                protocolVersion: '0.1.0',
                capabilities: {
                  tools: {
                    listChanged: false
                  }
                },
                serverInfo: {
                  name: iconGenerator.name,
                  version: iconGenerator.version
                }
              }
            };
            break;
            
          case 'tools/list':
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                tools: tools.map(tool => ({
                  name: tool.name,
                  description: tool.description,
                  inputSchema: tool.inputSchema
                }))
              }
            };
            break;
            
          case 'tools/call':
            try {
              const result = await iconGenerator.handleToolCall(
                request.params.name,
                request.params.arguments
              );
              
              response = {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify(result, null, 2)
                    }
                  ]
                }
              };
            } catch (error) {
              response = {
                jsonrpc: '2.0',
                id: request.id,
                error: {
                  code: -32603,
                  message: error.message
                }
              };
            }
            break;
            
          default:
            response = {
              jsonrpc: '2.0',
              id: request.id,
              error: {
                code: -32601,
                message: `Method not found: ${request.method}`
              }
            };
        }
        
        // Send response
        process.stdout.write(JSON.stringify(response) + '\n');
        
      } catch (error) {
        // Log parsing errors to stderr
        process.stderr.write(`Parse error: ${error.message}\n`);
      }
    }
  });
  
  // Handle shutdown
  process.on('SIGINT', () => {
    process.exit(0);
  });
}

// Start server
main().catch(error => {
  process.stderr.write(`Server error: ${error.message}\n`);
  process.exit(1);
});