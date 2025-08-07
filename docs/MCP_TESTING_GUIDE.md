# MCP Server Testing Guide

This guide explains how to test the Icon Generator as an actual MCP server during development.

## Understanding MCP Servers

MCP (Model Context Protocol) servers communicate with AI assistants like Claude Desktop using JSON-RPC 2.0 over stdio. They:
- Don't output to console directly
- Communicate only via structured JSON messages
- Register tools that the AI can call
- Handle requests and return responses

## Testing Approaches

### 1. Local Development Testing (Recommended)

#### Step 1: Build and Link Locally
```bash
# Build the TypeScript code
npm run build

# Create a global symlink (instead of publishing)
npm link

# Verify the link
which icon-generator-mcp
```

#### Step 2: Configure Claude Desktop
1. Find your Claude Desktop config:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add your local server:
```json
{
  "mcpServers": {
    "icon-generator-local": {
      "command": "node",
      "args": [
        "/Users/user/Dev/icon-generator/bin/mcp-server-proper.js"
      ]
    }
  }
}
```

3. Restart Claude Desktop

#### Step 3: Test in Claude
- Open Claude Desktop
- The icon generator tools should be available
- Try: "Use the icon generator to create a star icon"

### 2. Direct Testing (Without Claude)

Create test scripts to simulate MCP communication:

```javascript
// test-mcp-direct.js
const { spawn } = require('child_process');

const server = spawn('node', ['bin/mcp-server-proper.js']);

// Send initialize request
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "0.1.0",
    capabilities: {}
  }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

// Listen for responses
server.stdout.on('data', (data) => {
  console.log('Response:', data.toString());
});
```

### 3. Development Workflow

#### Concurrent Development & Testing

1. **Use `npm run dev`** for auto-rebuild:
```bash
# Terminal 1: Auto-rebuild on changes
npm run dev
```

2. **Test without restarting Claude**:
   - Changes to the TypeScript code auto-compile
   - Claude Desktop reloads the server on each conversation
   - No need to restart Claude after code changes

3. **Quick iteration cycle**:
   - Make changes to `src/` files
   - TypeScript auto-compiles to `dist/`
   - Start new conversation in Claude to test
   - See results immediately

#### Testing Different Scenarios

1. **Test basic generation**:
   ```
   "Create a simple star icon"
   ```

2. **Test with PNG reference**:
   ```
   "Create an icon based on /path/to/reference.png"
   ```

3. **Test error handling**:
   ```
   "Create an icon from a non-existent file"
   ```

4. **Test style variations**:
   ```
   "Create a folder icon in black and white flat style"
   ```

## Debugging MCP Servers

### 1. Enable Debug Logging

Create a debug wrapper:

```javascript
// bin/mcp-server-debug.js
process.env.DEBUG = 'mcp:*';
require('./mcp-server-proper.js');
```

### 2. Log to File (Not Console)

Since MCP servers can't use console.log, log to a file:

```javascript
const fs = require('fs');
const logFile = '/tmp/icon-generator-mcp.log';

function debugLog(message) {
  fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
}
```

### 3. Test Individual Components

Test the core functionality separately:

```javascript
// test-core.js
const { MCPServer } = require('./dist/server');
const server = new MCPServer();

async function test() {
  const result = await server.handleToolCall('generate_icon', {
    prompt: 'Create a test icon'
  });
  console.log(result);
}

test();
```

## Publishing vs Local Testing

### Local Testing (Development)
- Use `npm link` for immediate testing
- No need to publish to npm
- Changes reflect immediately after rebuild
- Perfect for development iteration

### Publishing (Production)
```bash
# When ready to publish
npm version patch  # or minor/major
npm publish

# Users install globally
npm install -g icon-generator-mcp
```

### Key Differences
- **Local**: Uses your development directory
- **Published**: Uses npm global install location
- **Config Path**: Update Claude config accordingly

## Common Issues & Solutions

### Issue: "Server not found in Claude"
- Check Claude Desktop config path
- Ensure correct absolute path in config
- Restart Claude Desktop

### Issue: "Tool execution fails"
- Check `/tmp/icon-generator-mcp.log`
- Verify all dependencies installed
- Ensure `potrace` is available

### Issue: "Changes not reflecting"
- Ensure `npm run build` completed
- Start new conversation in Claude
- Check TypeScript compilation errors

## Testing Checklist

- [ ] Build project: `npm run build`
- [ ] Link locally: `npm link`
- [ ] Update Claude config with local path
- [ ] Restart Claude Desktop
- [ ] Test basic icon generation
- [ ] Test with PNG references
- [ ] Test error scenarios
- [ ] Test style variations
- [ ] Monitor debug logs

## Advanced Testing

### 1. Automated MCP Tests

Create automated tests for MCP protocol:

```javascript
// test/mcp-protocol.test.js
describe('MCP Protocol', () => {
  it('should respond to initialize', async () => {
    // Test initialization
  });
  
  it('should list tools', async () => {
    // Test tool listing
  });
  
  it('should execute tool calls', async () => {
    // Test tool execution
  });
});
```

### 2. Performance Testing

Monitor performance during development:
- Generation time per request
- Memory usage
- File system operations

### 3. Integration Testing

Test with different MCP clients:
- Claude Desktop
- Gemini CLI
- Custom MCP clients

## Summary

1. **Don't publish during development** - use `npm link`
2. **Auto-rebuild with `npm run dev`** for quick iteration
3. **Test in Claude Desktop** with local config
4. **Debug using file logging**, not console
5. **New conversations** to test changes

This approach allows you to develop and test simultaneously without the overhead of publishing to npm for every change.