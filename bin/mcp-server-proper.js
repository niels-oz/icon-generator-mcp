#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { MCPServer } = require('../dist/server');

/**
 * Proper MCP Server Implementation
 * Communicates via JSON-RPC over stdio
 */
async function main() {
  // Create the icon generator instance
  const iconGenerator = new MCPServer();
  
  // Create MCP server with proper protocol handling
  const server = new Server(
    {
      name: iconGenerator.name,
      version: iconGenerator.version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tools from icon generator
  const tools = iconGenerator.getTools();
  tools.forEach(tool => {
    server.setRequestHandler(`tools/call`, async (request) => {
      if (request.params.name === tool.name) {
        try {
          const result = await iconGenerator.handleToolCall(
            tool.name,
            request.params.arguments
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error.message}`
              }
            ],
            isError: true
          };
        }
      }
    });
  });

  // Handle tool listing
  server.setRequestHandler('tools/list', async () => {
    return {
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    };
  });

  // Create stdio transport
  const transport = new StdioServerTransport();
  
  // Connect server to transport
  await server.connect(transport);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
}

// Start the server
main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});