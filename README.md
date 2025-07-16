# Icon Generator MCP Server

Generate SVG icons from PNG references and/or text prompts using AI, integrated directly into your Claude Code workflow.

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

### 2. Install the MCP Server

```bash
# Install globally via npm
npm install -g icon-generator-mcp

# Verify installation
icon-generator-mcp --version
```

### 3. Configure Claude Code

Add the server to your Claude Code configuration:

```json
{
  "mcpServers": {
    "icon-generator": {
      "command": "icon-generator-mcp",
      "args": ["--server"]
    }
  }
}
```

### 4. Restart Claude Code

Restart Claude Code to load the new MCP server. The `generate_icon` tool will be available for Claude Code to use automatically when you request icon generation.

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
# Install Potrace
brew install potrace

# Verify it's in your PATH
which potrace
```

**"Claude CLI not found"**
- Ensure Claude Code is installed and authenticated
- Check that the CLI is accessible in your PATH

**"MCP server not responding"**
- Verify the server is configured correctly in Claude Code
- Restart Claude Code after configuration changes
- Check server status: `icon-generator-mcp --health`

**"Permission denied"**
- Ensure you have write permissions to the directory containing PNG files
- Check file permissions: `ls -la your-file.png`

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

**Built with ❤️ for developers who need quick, AI-powered icon generation in their workflow.**