# Icon Generator MCP Server - Development Guide

## Tech Stack
- **Language**: TypeScript
- **Platform**: macOS (Intel and Apple Silicon)
- **Runtime**: Node.js v18+
- **Testing**: Jest
- **Dependencies**: Potrace (via Homebrew), Claude Code CLI
- **Architecture**: MCP Server for PNG→SVG icon generation

## Project Structure
```
src/
├── server.ts          # MCP server entry point
├── bin/cli.ts         # CLI interface
├── services/
│   ├── converter.ts   # PNG to SVG conversion
│   ├── llm.ts         # Claude Code CLI wrapper
│   └── file-writer.ts # Output management
└── types.ts           # TypeScript definitions
```

## Prerequisites
```bash
# Required dependencies
brew install potrace
npm install -g @anthropic-ai/claude-dev

# Verify installations
potrace --version
claude --version
```

## Development Commands
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

## MCP Tool Schema
```typescript
generate_icon: {
  png_paths?: string[]   // Optional: PNG file paths for reference
  prompt: string         // Required: Text prompt for icon generation
  output_name?: string   // Optional: Custom filename (without .svg)
  output_path?: string   // Optional: Custom output directory
}
```

**Usage Modes:**
- **PNG-based**: Provide `png_paths` with reference images + descriptive `prompt`
- **Prompt-only**: Provide only `prompt` for text-based icon generation
- **Hybrid**: Combine PNG references with detailed text instructions

## Code Conventions
- **TypeScript**: Strict mode enabled
- **Testing**: TDD approach with minimal mocking
- **Error Handling**: Structured error responses with step context
- **Security**: Input validation, output sanitization for SVG
- **File Management**: Smart naming with conflict resolution

## Common Tasks

### Running Tests
```bash
# Run specific test file
npm test -- --testNamePattern="ConversionService"

# Run with coverage
npm test -- --coverage

# Run integration tests only
npm run test:integration
```

### Manual Testing
```bash
# Test end-to-end with example script
node example/simple-test.js

# Test with custom output path
node example/test-output-path.js

# Test prompt-only generation
node example/test-prompt-only.js
```

### Debugging
```bash
# Enable MCP debug logging
DEBUG=mcp:* npm run dev

# Check dependencies
which potrace && which claude
```

## Architecture Notes
- **Pipeline**: [PNG → SVG (Potrace)] → LLM Processing → File Output
- **Modes**: PNG-based, prompt-only, or hybrid generation
- **Security**: No credential handling, delegates to Claude Code CLI
- **Dependencies**: External binaries managed via Homebrew
- **Testing**: 75 tests across unit, integration, and security suites

## Important Implementation Details
- LLM service uses Claude Code CLI via subprocess execution
- File writer handles conflict resolution with numeric suffixes
- PNG conversion uses Jimp for preprocessing before Potrace (optional)
- Prompt-only generation defaults to current directory output
- All services follow error-first callback pattern with structured responses