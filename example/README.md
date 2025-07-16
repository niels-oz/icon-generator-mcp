# Example Usage

This folder contains example scripts to test the icon-generator-mcp functionality.

## Files

- **`test-simple.js`** - Basic MCP server test with PNG and prompt
- **`test-conversion.js`** - PNG to SVG conversion test using Potrace
- **`your-test.js`** - Template for testing with your own PNG files
- **`test-output.svg`** - Example SVG output from conversion

## How to Run

```bash
# Test basic MCP server functionality
node example/test-simple.js

# Test PNG to SVG conversion
node example/test-conversion.js

# Test with your own PNG (edit the file first)
node example/your-test.js
```

## Customizing Tests

Edit `your-test.js` to test with your own PNG files:

```javascript
// Change these lines:
const yourPngPath = path.join(__dirname, '../your-png-file.png');
const yourPrompt = 'Change the color from black to red';
```

## Current Status

- ✅ MCP server registration and validation
- ✅ PNG to SVG conversion with Potrace
- ⏳ LLM integration (next iteration)
- ⏳ Real file writing with smart naming (next iteration)