# Icon Generator MCP Server

AI-powered SVG icon generation for MCP-compatible LLMs. Zero dependencies, cross-platform, with PNG visual context support.

## Installation

```bash
npm install -g icon-generator-mcp
```

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

### Text-Only Generation
```
Create a minimalist home icon
```

### With Reference Files
```
Create an icon based on this design (attach PNG/SVG)
```

### With Style
```
Create a user profile icon in black-white-flat style
```

## Tool Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | ✅ | Description of the desired icon |
| `reference_paths` | array | ❌ | PNG/SVG reference files |
| `style` | string | ❌ | Style preset |
| `output_name` | string | ❌ | Custom filename |
| `output_path` | string | ❌ | Custom output directory |

## Features

- **PNG Visual Context**: Multimodal LLMs process PNG files directly
- **SVG Text References**: Pattern learning from SVG files  
- **Zero Dependencies**: Works on Windows, macOS, Linux
- **Smart Detection**: Automatic multimodal capability detection
- **Style Consistency**: Built-in presets and pattern learning

## Requirements

- Node.js 18+
- MCP-compatible LLM environment

## License

MIT