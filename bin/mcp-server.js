#!/usr/bin/env node

const { MCPServer } = require('../dist/server');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

/**
 * MCP Server Entry Point
 * This script starts the Icon Generator MCP Server for use with Claude Code.
 */

async function startMCPServer() {
  console.log('🚀 Starting Icon Generator MCP Server...');
  
  try {
    const server = new MCPServer();
    
    // Log server info
    console.log(`📋 Server: ${server.name} v${server.version}`);
    console.log(`🛠️  Tools: ${server.getTools().length} available`);
    console.log('✅ Server ready for MCP connections');
    
    // Basic health check
    const tools = server.getTools();
    if (tools.length === 0) {
      throw new Error('No tools available');
    }
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down MCP Server...');
      process.exit(0);
    });
    
    // Wait for input/keep alive
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.on('line', async (input) => {
      try {
        if (input.trim() === 'quit' || input.trim() === 'exit') {
          console.log('👋 Goodbye!');
          process.exit(0);
        }
        
        if (input.trim() === 'tools') {
          console.log('🛠️  Available tools:');
          tools.forEach(tool => {
            console.log(`  - ${tool.name}: ${tool.description}`);
          });
          return;
        }
        
        if (input.trim() === 'help') {
          console.log('💡 Available commands:');
          console.log('  - tools: List available tools');
          console.log('  - help: Show this help message');
          console.log('  - quit/exit: Shutdown server');
          return;
        }
        
        console.log('❓ Unknown command. Type "help" for available commands.');
        
      } catch (error) {
        console.error('❌ Error:', error.message);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start MCP Server:', error.message);
    process.exit(1);
  }
}

// Start the server
startMCPServer().catch(console.error);