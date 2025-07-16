# Icon Generator MCP Server - Development Guide

## Architectural Decision: MCP Server

**Decision**: Implement as MCP server rather than CLI tool
**Date**: July 16, 2025
**Status**: Confirmed

### Rationale

After comparing CLI tool vs MCP server approaches, MCP server was chosen for:

1. **Workflow Integration**: Natural fit with Claude Code development workflow
2. **Conversational Interface**: "Generate an icon like this but smaller" vs CLI syntax
3. **Context Awareness**: Claude Code can suggest relevant files automatically
4. **File Management**: Integrated project structure awareness
5. **Error Handling**: Structured responses integrate better with AI conversation

### Trade-offs Accepted

- **Setup Complexity**: Requires npm install + Claude Code configuration vs just npm install
- **Additional Dependency**: Requires Claude Code as runtime environment
- **Learning Curve**: Developers must understand MCP protocol basics

## Key Technical Decisions

### Binary Distribution Strategy
- **MVP**: Manual installation (`brew install potrace`) 
- **Rationale**: Minimal effort, Homebrew handles both Intel/ARM automatically
- **Future**: Bundled binaries for zero-dependency experience

### Platform Support
- **MVP**: macOS (Intel and Apple Silicon)
- **Rationale**: Homebrew handles architecture detection automatically
- **Future**: Windows, Linux support

### LLM Integration
- **MVP**: Claude Code CLI only
- **Architecture**: Tool-agnostic design for future multi-LLM support
- **Future**: Gemini CLI, direct API key integration

### File Naming Strategy
- **Primary**: LLM generates contextually appropriate filename
- **Fallback**: Automatic conflict resolution with index numbers
- **Output Location**: Same directory as input PNG files

## Development Setup

### Prerequisites
```bash
# Required dependencies
brew install potrace
npm install -g @anthropic-ai/claude-dev

# Verify installations
potrace --version
claude --version
```

### Development Commands
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run integration tests
npm run test:integration

# Run security tests
npm run test:security

# Development server (with auto-reload)
npm run dev

# Production build
npm run build:prod
```

### Testing Strategy
- **Unit Tests**: All service classes (ConversionService, LLMService, etc.)
- **Integration Tests**: End-to-end MCP tool execution
- **Security Tests**: Input validation, output sanitization
- **Manual Testing**: Real Claude Code integration

## Implementation Guidance

### Core Architecture
```
MCP Server → Tool Handler → Conversion Service → LLM Service → File Writer
```

### Key Components
1. **MCP Server** (`src/server.js`) - Protocol implementation
2. **Tool Handler** (`src/tools/generate-icon.js`) - Request processing
3. **Conversion Service** (`src/services/converter.js`) - PNG to SVG
4. **LLM Service** (`src/services/llm.js`) - Claude Code CLI wrapper
5. **File Writer** (`src/services/file-writer.js`) - Output management

### Security Requirements
- **Input Validation**: PNG format, file size limits, prompt filtering
- **Output Sanitization**: Remove `<script>`, event handlers, `<foreignObject>`
- **Process Isolation**: Secure subprocess execution
- **No Credential Handling**: Delegate to Claude Code CLI

### Error Handling Pattern
```javascript
try {
  // Process request
  const result = await processIcon(request)
  return { success: true, ...result }
} catch (error) {
  return { 
    success: false, 
    error: error.message,
    step: getCurrentStep() 
  }
}
```

## Package Structure
```
icon-generator-mcp/
├── src/
│   ├── server.js              # MCP server entry point
│   ├── tools/
│   │   └── generate-icon.js   # Tool implementation
│   ├── services/
│   │   ├── converter.js       # PNG to SVG conversion
│   │   ├── llm.js            # Claude Code CLI wrapper
│   │   ├── validator.js       # SVG sanitization
│   │   └── file-writer.js     # Output management
│   └── utils/
│       └── naming.js          # Filename generation
├── test/
├── docs/
└── package.json
```

## MCP Integration Notes

### Tool Registration
```javascript
server.addTool({
  name: 'generate_icon',
  description: 'Generate SVG icon from PNG references and text prompt',
  inputSchema: {
    type: 'object',
    properties: {
      png_paths: { type: 'array', items: { type: 'string' } },
      prompt: { type: 'string' },
      output_name: { type: 'string' }
    },
    required: ['png_paths', 'prompt']
  }
})
```

### Response Format
```javascript
{
  success: true,
  output_path: '/path/to/generated-icon.svg',
  message: 'Icon generated successfully',
  processing_time: 2340
}
```

## Common Development Tasks

### Adding New LLM Provider
1. Create provider class in `src/services/llm/`
2. Implement standard interface: `async generate(prompt): Promise<{svg, filename}>`
3. Add to LLMService provider array
4. Update tests

### Debugging MCP Communication
```bash
# Enable MCP debug logging
DEBUG=mcp:* npm run dev

# Test tool directly
node -e "
const server = require('./src/server.js');
server.testTool('generate_icon', {
  png_paths: ['test.png'],
  prompt: 'test prompt'
});
"
```

### Performance Optimization
- **Binary Caching**: Cache Potrace path resolution
- **Stream Processing**: Avoid loading large images into memory
- **Response Caching**: Cache similar LLM responses
- **Timeout Management**: Configurable timeouts with abort controllers

## Deployment Checklist

### Before Release
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Version numbers bumped
- [ ] CHANGELOG.md updated

### Package Publishing
```bash
npm run build
npm run test
npm publish
```

### User Installation Test
```bash
# Test global installation
npm install -g icon-generator-mcp

# Test MCP server startup
icon-generator-mcp --server

# Test with Claude Code
# (Manual verification required)
```

## Known Limitations

### MVP Constraints
- macOS Apple Silicon only
- Single icon generation per request
- PNG input format only
- Manual dependency installation required

### Future Improvements
See `docs/future-improvements.md` for prioritized enhancement roadmap.

## Troubleshooting

### Common Issues
1. **Potrace not found**: User needs `brew install potrace`
2. **Claude CLI not found**: User needs Claude Code CLI setup
3. **MCP connection failed**: Check Claude Code configuration
4. **Permission denied**: Check file system permissions

### Debug Commands
```bash
# Check dependencies
which potrace
which claude

# Test conversion
potrace --version
jimp --version

# Test MCP server
icon-generator-mcp --health
```

## References
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Claude Code Documentation](https://claude.ai/code)
- [Potrace Documentation](http://potrace.sourceforge.net/)
- [Project Documentation](./docs/)