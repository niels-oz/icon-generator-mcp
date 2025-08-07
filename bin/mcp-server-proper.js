#!/usr/bin/env node

// Since the MCP SDK is an ES module, we need to use dynamic import
async function main() {
  try {
    // Dynamic import for ES modules
    const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
    
    // Import our server (CommonJS)
    const { MCPServer } = require('../dist/server');
    
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

    // Get tools from icon generator
    const tools = iconGenerator.getTools();
    
    // Register tool call handler
    server.setRequestHandler('tools/call', async (request) => {
      const toolName = request.params.name;
      const toolArgs = request.params.arguments;
      
      // Find the requested tool
      const tool = tools.find(t => t.name === toolName);
      if (!tool) {
        throw new Error(`Unknown tool: ${toolName}`);
      }
      
      try {
        // Execute the tool
        const result = await iconGenerator.handleToolCall(toolName, toolArgs);
        
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
    
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Start the server
main();