# Icon Generator MCP Server

> **AI-powered SVG icon generation for developers** - Generate professional icons instantly using Claude Code MCP integration

Transform your development workflow with intelligent icon generation. This MCP server combines web search, PNG-to-SVG conversion, and AI creativity to produce clean, scalable icons in seconds.

## 🚀 Quick Start

```bash
# Install globally via npm (zero configuration required)
npm install -g icon-generator-mcp

# That's it! The MCP server is now available in Claude Code and Gemini CLI
# No additional setup, API keys, or configuration needed
```

## ✨ Features

- **🎨 Intelligent Icon Generation**: Create SVG icons from text prompts
- **🔍 Web Search Integration**: Automatically find reference images
- **🖼️ PNG to SVG Conversion**: Convert PNG references using Potrace
- **🎭 Smart Variations**: Auto-generate multiple design options
- **⚡ Style Detection**: Automatically detects style preferences
- **🛡️ Production Ready**: Robust error handling and validation

## 🛠️ Installation

### Prerequisites
```bash
# Required system dependencies
brew install potrace

# Verify installation
potrace --version
```

### Global Installation
```bash
# Install the MCP server globally
npm install -g icon-generator-mcp

# The server will automatically be available in:
# - Claude Code
# - Gemini CLI environments
```

### Zero Configuration
- ✅ **No API keys required** - Uses your LLM tool's existing authentication
- ✅ **No environment files** - Works out of the box
- ✅ **No additional setup** - Ready to use immediately after installation

## 📖 Usage

### Basic Icon Generation
```javascript
const { MCPServer } = require('./dist/server');
const server = new MCPServer();

const request = {
  prompt: 'Create a star icon with clean lines'
};

const response = await server.handleToolCall('generate_icon', request);
console.log(response.output_path); // ./star-icon.svg
```

### Web Search Enhanced
```javascript
const request = {
  prompt: 'Create a folder icon',
  search_keyword: 'folder',
  auto_search: true
};
```

### Style-Specific Generation
```javascript
const request = {
  prompt: 'Create a code review icon with black and white outlines, simple flat design'
  // Auto-generates 4 variations due to style keywords
};
```

### Multiple Variations
```javascript
const request = {
  prompt: 'Create a star icon',
  generate_variations: true  // Force variation mode
};
```

## 🎯 MCP Tool Schema

### `generate_icon`
Generate SVG icons from prompts and references.

**Parameters:**
- `prompt` (string, required): Text description of the desired icon
- `png_paths` (array, optional): PNG file paths for references
- `search_keyword` (string, optional): Keyword for web search
- `auto_search` (boolean, optional): Enable web search
- `generate_variations` (boolean, optional): Generate multiple variations
- `output_name` (string, optional): Custom filename
- `output_path` (string, optional): Custom output directory

**Response:**
- `success` (boolean): Operation success status
- `output_path` (string): Path to generated icon(s)
- `message` (string): Human-readable result message
- `processing_time` (number): Generation time in milliseconds

## 🧠 Smart Features

### Auto-Variation Detection
The system automatically generates variations when it detects style-specific keywords:
- `black and white`, `monochrome`, `b&w`
- `outline`, `line art`, `stroke`
- `flat`, `minimal`, `simple`, `clean`
- `variations`, `options`, `different styles`

### Intelligent Prompt Analysis
- **Keyword Extraction**: Identifies main concepts
- **Style Detection**: Recognizes design preferences
- **Context Understanding**: Adapts generation approach

### Web Search Integration
- **Smart Queries**: Optimized search terms
- **Format Filtering**: SVG/PNG only, excludes JPG
- **Quality Filtering**: Filters out photos and complex graphics
- **Reference Downloading**: Automatic image acquisition

## 🔧 Development

### Project Structure
```
icon-generator/
├── src/
│   ├── server.ts           # Main MCP server
│   ├── types.ts           # TypeScript interfaces
│   └── services/
│       ├── converter.ts    # PNG to SVG conversion
│       ├── llm.ts         # Claude CLI integration
│       ├── file-writer.ts # File output management
│       └── web-search.ts  # Google Search integration
├── test/                  # Test suites
├── example/
│   ├── demos/            # Demo scripts
│   └── test-outputs/     # Generated test icons
├── bin/
│   └── mcp-server.js     # Server entry point
└── CLAUDE.md             # Claude Code instructions
```

### Development Commands
```bash
npm run dev          # Watch mode with auto-rebuild
npm test            # Run test suite
npm run test:watch  # Watch mode testing
npm run build       # Build TypeScript
npm start           # Start production server
```

### Testing
```bash
# Run all tests
npm test

# Test specific functionality
npm test -- --testNamePattern="WebImageSearchService"

# Run with coverage
npm test -- --coverage

# Demo scripts
node example/demos/test-simple.js
node example/demos/test-code-review-workflow.js

# Few-shot learning example
node example/test-add-user-icon.js
```

## 🎨 Examples

### Single Icon Generation
```bash
node example/demos/test-simple.js
```
**Output:** `./star-icon.svg` (10s)

### Few-Shot Learning Example
```bash
node example/test-add-user-icon.js
```
**Output:** `./example/test-outputs/add-user-icon-example.svg` (8-15s)
**Features:**
- Demonstrates few-shot learning with existing black-white-flat examples
- Generates add user icon using learned style patterns
- Shows style consistency across different icon types

### Multiple Variations
```bash
node example/demos/test-code-review-bw-variations.js
```
**Output:** 4 variations (44s total)
- `code-review-bw-primary.svg`
- `code-review-bw-detailed.svg`
- `code-review-bw-minimal.svg`
- `code-review-bw-geometric.svg`

### Web Search Integration
```bash
node example/demos/test-web-search.js
```
**Features:**
- Finds reference images automatically
- Combines with custom prompts
- Graceful fallback without API keys

## 🔧 Configuration

### Environment Variables
```env
# Google Search API (optional)
GOOGLE_SEARCH_API_KEY=your_api_key
GOOGLE_SEARCH_ENGINE_ID=your_engine_id

# Server Configuration
DEFAULT_OUTPUT_PATH=./icons
MAX_SEARCH_RESULTS=3
DEBUG_MODE=false

# MCP Settings
MCP_SERVER_NAME=icon-generator-mcp
MCP_SERVER_VERSION=1.0.0
```

### MCP Server Registration
Add to your Claude Code MCP configuration:
```json
{
  "servers": {
    "icon-generator": {
      "command": "node",
      "args": ["/path/to/icon-generator/bin/mcp-server.js"]
    }
  }
}
```

## 📊 Performance

### Benchmarks
- **Single icon**: ~10 seconds
- **4 variations**: ~44 seconds (sequential)
- **Web search**: +2-3 seconds per query
- **PNG conversion**: ~1-2 seconds per file

### Optimization Tips
- Use web search for better results
- Enable variations for style-specific requests
- Provide clear, descriptive prompts
- Use PNG references for complex concepts

## 🛡️ Security

- **Input Validation**: All inputs are sanitized
- **SVG Sanitization**: Generated SVGs are validated
- **No Credential Storage**: Uses Claude CLI authentication
- **Path Validation**: Secure file operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - feel free to use in your projects!

## 🆘 Support

- **Issues**: Report bugs on GitHub
- **Documentation**: See `CLAUDE.md` for detailed implementation
- **Examples**: Check `example/demos/` for usage patterns

---

**Made with ❤️ for developers who need beautiful icons fast.**

## Overview

The Icon Generator MCP Server enables developers to create custom SVG icons by providing PNG reference images and/or text prompts. It leverages AI to understand your design intent and generates production-ready SVG icons that match your requirements.

**Key Features:**
- 🎨 **AI-Powered Generation**: Uses Claude to create contextually appropriate icons
- 🔄 **PNG to SVG Conversion**: Automatically vectorizes reference images (optional)
- ✨ **Prompt-Only Generation**: Create icons from text descriptions alone
- 🛠️ **Claude Code Integration**: Works seamlessly within your development workflow
- 🔒 **Local Processing**: All processing happens locally on your machine
- 📁 **Smart File Management**: Automatically places icons in appropriate locations

## Prerequisites

Before installing, ensure you have:
- **Node.js** (v18 or newer)
- **macOS** (Intel or Apple Silicon)
- **Claude Code** installed and configured

## Installation

### 1. Install System Dependencies

```bash
# Install Potrace for PNG to SVG conversion
brew install potrace

# Verify installation
potrace --version
```

### 2. Automatic Integration

The MCP server automatically integrates with your LLM environment:

- **Claude Code**: Server is automatically discovered and available
- **Gemini CLI**: Server works seamlessly within Gemini environment
- **No manual configuration required**

### 3. Start Using

The `generate_icon` tool is immediately available in your LLM tool after installation.

## Usage

### Basic Usage

Once configured, you can generate icons directly through Claude Code:

**With PNG References:**
```
Generate an icon based on these PNG files: logo.png, reference.png
Make it more minimalist and suitable for a web application.
```

**Prompt-Only Generation:**
```
Create a simple blue circle icon for a navigation button
```

### Advanced Usage

**Custom Output Names:**
```
Create an icon from header-bg.png with the prompt "remove background, make it a simple outline"
Save it as "header-outline"
```

**Custom Output Directory:**
```
Generate an icon from logo.png with the prompt "make it minimalist"
Save it to the /assets/icons/ directory
```

**Multiple References:**
```
I have three PNG files: icon1.png, icon2.png, icon3.png
Generate a new icon that combines elements from all three
Make it cohesive and modern
```

**Prompt-Only with Custom Settings:**
```
Create a minimalist arrow icon pointing right
Save it as "nav-arrow" in the ./assets/icons/ directory
```

### File Management

- **Input**: PNG files from your project directory (optional) or text prompts only
- **Output**: SVG files saved in the same directory as input PNGs, custom path, or current directory
- **Naming**: AI generates contextually appropriate filenames
- **Conflicts**: Automatic numbering (e.g., `icon-2.svg`, `icon-3.svg`)
- **Custom Paths**: Use `output_path` parameter to specify save location
- **Prompt-Only**: When no PNG files provided, saves to current directory by default

## Examples

### Example 1: Logo Simplification
```
Input: complex-logo.png
Prompt: "Simplify this logo for use as a favicon"
Output: simplified-favicon.svg
```

### Example 2: Icon Style Transfer
```
Input: material-icon.png, brand-logo.png
Prompt: "Create an icon with the style of the brand logo but the shape of the material icon"
Output: branded-material-icon.svg
```

### Example 3: Background Removal
```
Input: product-photo.png
Prompt: "Remove the background and create a clean product icon"
Output: clean-product-icon.svg
```

### Example 4: Prompt-Only Generation
```
Input: (none)
Prompt: "Create a simple home icon with a house outline"
Output: home-outline-icon.svg
```

### Example 5: Prompt-Only with Custom Settings
```
Input: (none)
Prompt: "Create a minimalist settings gear icon"
Custom Name: "settings-gear"
Output: settings-gear.svg
```

## Troubleshooting

### Common Issues

**"Potrace not found"**
```bash
# Install Potrace (required system dependency)
brew install potrace

# Verify it's in your PATH
which potrace
```

**"MCP server not found"**
- Ensure you installed globally: `npm install -g icon-generator-mcp`
- Restart your LLM tool (Claude Code/Gemini CLI) after installation

**"Permission denied"**
- Ensure you have write permissions to the directory containing PNG files
- Check file permissions: `ls -la your-file.png`

**"CLI execution failed"**
- Verify your LLM tool (Claude Code/Gemini CLI) is properly installed
- Check that the CLI tools are accessible in your PATH

### Debug Mode

Enable debug logging for troubleshooting:

```bash
DEBUG=icon-generator:* icon-generator-mcp --server
```

## Supported Formats

### Input
- **PNG files** (optional) - File sizes up to 10MB, multiple references supported
- **Text prompts** (required) - Descriptive text for icon generation
- **Hybrid approach** - Combine PNG references with text prompts for best results

### Output
- **SVG format** (scalable vector graphics)
- **Clean, optimized** SVG code
- **Security sanitized** (no executable content)

## Limitations

### Current Status
- ✅ **MVP Complete**: All core features implemented and tested
- ✅ **macOS Support**: Intel and Apple Silicon
- ✅ **PNG Input**: Full PNG to SVG conversion pipeline
- ✅ **Single Icon Generation**: One icon per request
- ✅ **Manual Dependencies**: Requires `brew install potrace`
- ✅ **Test Coverage**: 67 tests, 74.87% code coverage

### Future Improvements
- Multi-platform support (Windows, Linux)
- Additional input formats (JPEG, GIF, WebP)  
- Batch processing
- Multiple LLM providers
- Bundled binary distribution
- Advanced conversion parameters

## Security

The Icon Generator MCP Server prioritizes security:
- **Local Processing**: No data sent to external services (except Claude API)
- **Output Sanitization**: Generated SVGs are cleaned of potentially malicious content
- **No Credential Handling**: Authentication is handled by Claude Code CLI
- **Input Validation**: PNG files are validated before processing

## Performance

Typical processing times:
- **Small icons** (< 1MB): 3-8 seconds
- **Medium icons** (1-5MB): 8-15 seconds
- **Large icons** (5-10MB): 15-30 seconds

Performance depends on:
- PNG file size and complexity
- Claude API response time
- System resources
- Potrace conversion time

**Tested Performance** (on MacBook Pro M2):
- Blue circle PNG → Red circle SVG: ~4.2 seconds
- 50x50 PNG → Optimized SVG: ~3.5 seconds

## Contributing

We welcome contributions! Please see:
- [Technical Documentation](docs/technical-design.md)
- [Development Guide](CLAUDE.md)
- [Future Improvements](docs/future-improvements.md)


## Support

For issues and questions:
- **Bug Reports**: [GitHub Issues](https://github.com/your-org/icon-generator-mcp/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-org/icon-generator-mcp/discussions)
- **Documentation**: [docs/](docs/) directory

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Built with ❤️ for developers who need intelligent, AI-powered icon generation with Sequential Thinking architecture.**