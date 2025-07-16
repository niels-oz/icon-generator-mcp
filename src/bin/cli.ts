#!/usr/bin/env node

import { MCPServer } from '../server';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Icon Generator MCP Server v0.1.0

Usage:
  icon-generator-mcp --server    Start the MCP server
  icon-generator-mcp --health    Check server health
  icon-generator-mcp --help      Show this help

For more information, visit: https://github.com/your-org/icon-generator-mcp
`);
    process.exit(0);
  }

  if (args.includes('--health')) {
    console.log('🔍 Checking server health...');
    
    try {
      const server = new MCPServer();
      const tools = server.getTools();
      console.log(`✅ Server healthy - ${tools.length} tools available`);
      
      // Check potrace availability
      const { ConversionService } = require('../services/converter');
      const converter = new ConversionService();
      const potracePath = converter.findPotraceBinary();
      console.log(`✅ Potrace found at: ${potracePath}`);
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Server health check failed:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }

  if (args.includes('--server')) {
    console.log('🚀 Starting Icon Generator MCP Server...');
    
    try {
      const server = new MCPServer();
      console.log(`📡 Server: ${server.name} v${server.version}`);
      console.log(`🔧 Tools available: ${server.getTools().length}`);
      console.log('✅ MCP Server ready for connections');
      
      // Keep the process alive
      process.on('SIGINT', () => {
        console.log('\n👋 Shutting down MCP server...');
        process.exit(0);
      });
      
      // Simple keep-alive loop
      setInterval(() => {
        // Server stays alive
      }, 1000);
      
    } catch (error) {
      console.error('❌ Failed to start server:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  } else {
    console.log('Use --help for usage information');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});