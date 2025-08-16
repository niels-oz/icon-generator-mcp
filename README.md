# Icon Generator MCP Server

Generate clean, production-ready SVG icons from natural language prompts. Zero dependencies, supports PNG visual context for better consistency.

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

## Quick Start

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

| Parameter | Type | Required / Optional | Description |
|-----------|------|----------|-------------|
| `prompt` | string | ✅ | Description of the desired icon |
| `reference_paths` | array | ⚪  | PNG/SVG reference files |
| `style` | string | ⚪  | Style preset |
| `output_name` | string | ⚪  | Custom filename |
| `output_path` | string | ⚪  | Custom output directory |

## Features

- **MCP‑native tool**: Exposes `generate_icon` with a clear JSON schema
- **Visual Context (PNG/SVG)**: Includes PNG or SVG references for pattern matching.
- **Smart Detection**: Automatic multimodal capability detection
- **Smart Output**: Suggests a filename from the prompt
- **Style Presets**: Optional `style` to enforce consistent icon families (e.g., `black-white-flat`).
- **Robust Validation & Errors**: Checks file existence and formats (PNG/SVG). Clear and actionable errors guide you to alternatives.
- **Zero Dependencies**: Pure Node.js (18+) server.

## Requirements

- Node.js 18+
- MCP-compatible LLM environment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT