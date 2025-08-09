# Icon Generator MCP Server

Zero-config MCP server for AI-powered SVG icon generation. Works with any MCP-compatible LLM environment.

## Installation

### Prerequisites
```bash
# macOS only - install Potrace for PNG conversion
brew install potrace
```

### Install
```bash
npm install -g icon-generator-mcp
```

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

## Usage

### Generate from text
```
Create a simple star icon with clean lines
```

### Convert PNG to SVG
```
Convert my-logo.png to a clean SVG icon
```

### Style-based generation
```
Create a user profile icon in black-white-flat style
```

## Parameters

**Tool: `generate_icon`**

- `prompt` (string, required): Description of the desired icon
- `reference_paths` (array, optional): PNG/SVG reference files
- `style` (string, optional): Style preset (e.g., "black-white-flat")
- `output_name` (string, optional): Custom filename  
- `output_path` (string, optional): Custom output directory

## Features

- **Text-to-SVG**: Generate icons from descriptions
- **PNG Conversion**: Convert PNG images to clean SVG icons
- **Style Consistency**: Built-in style presets
- **Smart Naming**: Automatic filename generation with conflict resolution
- **MCP Standard**: Works with any MCP-compatible LLM

## Requirements

- **Platform**: macOS (Intel or Apple Silicon)
- **Dependencies**: Potrace (`brew install potrace`)
- **Runtime**: Node.js 18+
- **MCP Client**: Any MCP-compatible LLM environment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.