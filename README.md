# Icon Generator MCP Server

Generate SVG icons from PNG references using AI, integrated directly into your Claude Code workflow.

## Overview

The Icon Generator MCP Server enables developers to create custom SVG icons by providing PNG reference images and text prompts. It leverages AI to understand your design intent and generates production-ready SVG icons that match your requirements.

**Key Features:**
- 🎨 **AI-Powered Generation**: Uses Claude to create contextually appropriate icons
- 🔄 **PNG to SVG Conversion**: Automatically vectorizes reference images
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

```
Generate an icon based on these PNG files: logo.png, reference.png
Make it more minimalist and suitable for a web application.
```

### Advanced Usage

**Custom Output Names:**
```
Create an icon from header-bg.png with the prompt "remove background, make it a simple outline"
Save it as "header-outline"
```

**Multiple References:**
```
I have three PNG files: icon1.png, icon2.png, icon3.png
Generate a new icon that combines elements from all three
Make it cohesive and modern
```

### File Management

- **Input**: PNG files from your project directory
- **Output**: SVG files saved in the same directory as input PNGs
- **Naming**: AI generates contextually appropriate filenames
- **Conflicts**: Automatic numbering (e.g., `icon-2.svg`, `icon-3.svg`)

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
- **PNG files** (required)
- **File sizes** up to 10MB
- **Multiple references** supported

### Output
- **SVG format** (scalable vector graphics)
- **Clean, optimized** SVG code
- **Security sanitized** (no executable content)

## Limitations

### MVP Constraints
- macOS Apple Silicon only
- PNG input format only
- Single icon generation per request
- Requires manual dependency installation

### Future Improvements
- Multi-platform support (Windows, Linux, Intel Mac)
- Additional input formats (JPEG, GIF, WebP)
- Batch processing
- Multiple LLM providers

## Security

The Icon Generator MCP Server prioritizes security:
- **Local Processing**: No data sent to external services (except Claude API)
- **Output Sanitization**: Generated SVGs are cleaned of potentially malicious content
- **No Credential Handling**: Authentication is handled by Claude Code CLI
- **Input Validation**: PNG files are validated before processing

## Performance

Typical processing times:
- **Small icons** (< 1MB): 5-15 seconds
- **Medium icons** (1-5MB): 15-30 seconds
- **Large icons** (5-10MB): 30-60 seconds

Performance depends on:
- PNG file size and complexity
- Claude API response time
- System resources

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