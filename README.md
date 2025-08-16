# Icon Generator MCP Server

**Zero-dependency MCP server for AI-powered SVG icon generation with multimodal LLM support.**

Works cross-platform with any MCP-compatible LLM environment. Supports PNG visual context and SVG text references.

## ✨ Features (v0.4.0)

- 🚀 **Zero Dependencies**: No system requirements - works on Windows, macOS, Linux
- 🖼️ **PNG Visual Context**: Multimodal LLMs process PNG files directly as visual references
- 📝 **SVG Text References**: Traditional text-based processing for pattern learning
- 🔍 **Smart Detection**: Automatic multimodal LLM capability detection
- ⚡ **5-Phase Pipeline**: Streamlined validation → analysis → generation → refinement → output
- 🎨 **Style Consistency**: Built-in style presets and pattern learning
- 📁 **Smart Naming**: Automatic filename generation with conflict resolution
- 🌐 **Cross-Platform**: Works everywhere Node.js runs

## 🚀 Installation

### Quick Install
```bash
npm install -g icon-generator-mcp
```

**That's it!** No system dependencies, no platform restrictions, no configuration needed.

### Setup in your MCP client
Add to your MCP configuration:
```json
{
  "mcpServers": {
    "icon-generator": {
      "command": "icon-generator-mcp"
    }
  }
}
```

## 📖 Usage

### Text-Only Generation
```
Create a simple star icon with clean lines
```

### PNG Visual Context (Multimodal LLMs)
```
Create an icon inspired by this design (attach PNG file)
```

### SVG Text References (All LLMs)
```
Create a similar icon based on this SVG pattern (attach SVG file)
```

### Mixed References
```
Create an icon combining elements from these references (attach PNG + SVG files)
```

### Style-Based Generation
```
Create a user profile icon in black-white-flat style
```

## 🛠️ Tool Parameters

**Tool: `generate_icon`**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | ✅ | Description of the desired icon |
| `reference_paths` | array | ❌ | PNG/SVG reference files |
| `style` | string | ❌ | Style preset (e.g., "black-white-flat") |
| `output_name` | string | ❌ | Custom filename |
| `output_path` | string | ❌ | Custom output directory |

## 🎯 How It Works

### For Multimodal LLMs (Claude Code, Gemini Pro Vision, GPT-4V)
- **PNG files**: Passed directly as visual context - no conversion needed
- **SVG files**: Processed as text for pattern learning
- **Result**: Higher quality generation with perfect visual understanding

### For Non-Multimodal LLMs
- **PNG files**: Clear error with helpful alternatives
- **SVG files**: Full text-based processing support
- **Prompt-only**: Works perfectly for all generation types

### 5-Phase Generation Pipeline
1. **Validation**: File checking + multimodal capability detection
2. **Analysis**: Visual/text reference categorization
3. **Generation**: Context-aware SVG creation
4. **Refinement**: Optional quality enhancement
5. **Output**: Smart file naming and saving

## 💡 Examples

### Prompt-Only (Works with any LLM)
```
generate_icon({
  "prompt": "Create a minimalist home icon"
})
```

### Visual Context (Requires multimodal LLM)
```
generate_icon({
  "prompt": "Create an icon based on this logo design",
  "reference_paths": ["my-logo.png"]
})
```

### Mixed References (Best results)
```
generate_icon({
  "prompt": "Combine elements from these references",
  "reference_paths": ["inspiration.png", "pattern.svg"],
  "style": "black-white-flat"
})
```

## 🔧 System Requirements

- **Platform**: Cross-platform (Windows, macOS, Linux)
- **Runtime**: Node.js 18+
- **Dependencies**: None! (Zero system dependencies)
- **MCP Client**: Any MCP-compatible LLM environment

## 🚫 Migration from v0.3.x

**v0.4.0 removes ALL system dependencies!**

### What Changed
- ❌ **Removed**: Potrace, Jimp, macOS-only restrictions
- ✅ **Added**: PNG visual context, multimodal detection, cross-platform support
- ⚡ **Improved**: Faster processing, better quality, 5-phase pipeline

### Migration Steps
1. **Uninstall system dependencies** (optional cleanup):
   ```bash
   # You can remove these if not used elsewhere
   brew uninstall potrace  # macOS
   ```

2. **Update package**:
   ```bash
   npm update -g icon-generator-mcp
   ```

3. **Enjoy zero dependencies!** - Everything works the same but better.

## 🧪 Development

```bash
# Clone repository
git clone https://github.com/niels-oz/icon-generator-mcp.git
cd icon-generator-mcp

# Install dependencies
npm install

# Run tests (51 tests, ~2s)
npm test

# Build TypeScript
npm run build

# Development mode
npm run dev

# Test multimodal functionality
npm test -- --testNamePattern="multimodal|visual-context"
```

### 📦 Local Package Testing (Recommended)

For testing unreleased versions exactly as users will experience them:

```bash
# 1. Build and package your development version
npm run build
npm pack
# Creates: icon-generator-mcp-0.4.0.tgz

# 2. Install globally from the package (like users would)
npm install -g ./icon-generator-mcp-0.4.0.tgz
```

**Test the installed package:**
```bash
# Test CLI binary
icon-generator-mcp --version
# Should show: 0.4.0

# Test programmatic usage
node -e "
const { MCPServer } = require('icon-generator-mcp');
const server = new MCPServer();
console.log('✅ Package version:', server.version);
console.log('✅ Zero dependencies verified');
"

# Test actual icon generation
node -e "
const { MCPServer } = require('icon-generator-mcp');
new MCPServer().handleToolCall('generate_icon', {
  prompt: 'Create a test star icon'
}).then(r => console.log('✅ Generation test:', r.success ? 'PASSED' : 'FAILED'));
"
```

**Use in MCP client configuration:**
```json
{
  "mcpServers": {
    "icon-generator": {
      "command": "icon-generator-mcp"
    }
  }
}
```

**Clean up when done:**
```bash
npm uninstall -g icon-generator-mcp
rm icon-generator-mcp-0.4.0.tgz
```

This approach tests the **exact package** that would be published to npm, ensuring binary scripts, file inclusion, and module resolution work correctly for real users.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol)
- Inspired by the need for zero-dependency, cross-platform AI tooling
- Special thanks to the multimodal LLM community for making visual context possible