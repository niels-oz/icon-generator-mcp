# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack
- **Language**: TypeScript with strict mode
- **Platform**: macOS (Intel and Apple Silicon)  
- **Runtime**: Node.js v18+
- **Testing**: Jest with ts-jest
- **Dependencies**: Potrace (via Homebrew), Claude Code CLI
- **Architecture**: MCP Server for PNG→SVG icon generation

## Prerequisites
```bash
# Required system dependencies
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

# Development with auto-rebuild
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Start production server
npm start
```

## Project Architecture

### Core Components
- **MCPServer** (`src/server.ts`) - Main orchestrator, handles MCP protocol and coordinates services
- **ConversionService** (`src/services/converter.ts`) - PNG→SVG conversion using Potrace
- **LLMService** (`src/services/llm.ts`) - Claude CLI integration with security validation
- **FileWriterService** (`src/services/file-writer.ts`) - Output management with conflict resolution

### Service Flow
1. Request validation and parsing
2. PNG conversion (if PNG files provided)
3. LLM processing for SVG generation/enhancement
4. Output file writing with automatic naming

### MCP Tool Schema
```typescript
generate_icon: {
  png_paths?: string[]     // Optional: PNG reference files
  prompt: string           // Required: Generation prompt
  search_keyword?: string  // Optional: Keyword for web image search
  auto_search?: boolean    // Optional: Enable automatic web search
  output_name?: string     // Optional: Custom filename
  output_path?: string     // Optional: Custom output directory
}
```

## Testing Strategy

### Test Organization
- **Unit Tests**: Individual service testing with mocking
- **Integration Tests**: End-to-end workflow testing (timeout: 30s)
- **Fixtures**: Real PNG/SVG files in `test/fixtures/`
- **Coverage**: Jest coverage reporting enabled

### Running Specific Tests
```bash
# Test specific service
npm test -- --testNamePattern="ConversionService"

# Test with coverage
npm test -- --coverage

# Watch mode for development
npm run test:watch
```

## Manual Testing
```bash
# Basic functionality test
node example/simple-test.js

# Test with custom output path
node example/test-output-path.js

# Test prompt-only generation
node example/test-prompt-only.js
```

## Key Implementation Details

### Security Features
- SVG sanitization in LLM service
- Input validation for all file paths
- No credential handling (delegates to Claude CLI)

### Error Handling
- Structured error responses with step context
- Graceful fallbacks for missing dependencies
- Proper cleanup of temporary files

### File Management
- Smart naming with conflict resolution (numeric suffixes)
- Flexible output directory support
- PNG preprocessing with Jimp before Potrace conversion

### Generation Modes
- **PNG-based**: Uses reference images + descriptive prompt
- **Prompt-only**: Pure text-based generation
- **Web search enhanced**: Automatically finds reference images from web
- **Hybrid**: Combines manual PNG references with web search results

## Debugging
```bash
# Enable MCP debug logging
DEBUG=mcp:* npm run dev

# Check system dependencies
which potrace && which claude
```

## Code Conventions
- TypeScript strict mode enabled
- Error-first callback pattern for services
- Comprehensive input validation
- No external API keys (uses Claude CLI authentication)