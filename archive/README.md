# Archive - Old MCP Server Versions

This folder contains archived versions of the MCP server implementations that were replaced by the proper implementation.

## Archived Files

### `mcp-server-simple.js`
- **Type**: Custom JSON-RPC implementation
- **Status**: Deprecated
- **Reason**: Did not use official MCP SDK, had custom protocol handling
- **Issues**: Suppressed console.log, less robust error handling

### `mcp-server.js` (original)
- **Type**: Interactive CLI interface
- **Status**: Deprecated  
- **Reason**: Not designed for MCP protocol, used for development/debugging only
- **Issues**: Console output incompatible with MCP, readline interface

## Current Implementation

The current MCP server is `bin/mcp-server.js` (renamed from `mcp-server-proper.js`) which:
- Uses official `@modelcontextprotocol/sdk`
- Implements proper MCP protocol with Server and StdioServerTransport
- Handles tools/call and tools/list correctly
- Has proper error handling and graceful shutdown
- Compatible with Claude Code MCP integration

## History

These files were archived on 2025-08-07 during cleanup to consolidate to a single, proper MCP server implementation.