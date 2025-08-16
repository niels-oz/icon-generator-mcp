# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack
- **Language**: TypeScript with strict mode (ES2020 target)
- **Platform**: Cross-platform (Windows, macOS, Linux)  
- **Runtime**: Node.js v18+
- **Testing**: Jest with ts-jest (51 tests, 9 test suites)
- **Dependencies**: MCP SDK v0.4.0, chalk (zero system dependencies)
- **Architecture**: Zero-dependency MCP Server with multimodal LLM support

## Prerequisites
```bash
# Zero system dependencies required!
# No Potrace, Jimp, or platform-specific tools needed

# Global installation
npm install -g icon-generator-mcp

# Verify installation
icon-generator-mcp --version
```

## Development Commands
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Development with auto-rebuild
npm run dev

# Run tests (51 tests, ~2s runtime)
npm test

# Run tests in watch mode
npm run test:watch

# Run regression tests (30s timeout)
npm run test:regression
npm run test:code-review
npm run test:add-user

# Start production MCP server
npm start
```

## Project Architecture

### Core Components
- **MCPServer** (`src/server.ts`) - Main orchestrator with 5-phase generation pipeline
- **MultimodalDetector** (`src/services/multimodal-detector.ts`) - Detects multimodal LLM capabilities for PNG support
- **FileWriterService** (`src/services/file-writer.ts`) - Output management with conflict resolution
- **StateManager** (`src/services/state-manager.ts`) - Phase-based state tracking and progress management
- **VisualFormatter** (`src/services/visual-formatter.ts`) - Progress visualization
- **CLI** (`src/bin/cli.ts`) - Command-line interface

### 5-Phase Generation Pipeline
1. **Validation** - Input validation, file checking, and multimodal capability detection
2. **Analysis** - Prompt and reference analysis with visual/text categorization
3. **Generation** - AI-powered SVG creation using visual context (PNG) or text references (SVG)
4. **Refinement** - Quality enhancement (optional)
5. **Output** - File writing with smart naming

### MCP Tool Schema
```typescript
generate_icon: {
  reference_paths?: string[]     // Optional: PNG/SVG reference files
  prompt: string           // Required: Generation prompt
  style?: string           // Optional: Style preset (e.g., "black-white-flat")
  output_name?: string     // Optional: Custom filename
  output_path?: string     // Optional: Custom output directory
}
```

## Testing Strategy

### Test Organization (51 Tests Total - Comprehensive)
- **Core Tests**: Essential functionality
  - `test/core.test.ts` - MCP server, multimodal detection, 5-phase processing
  - `test/services/file-operations.test.ts` - File handling and path generation
- **New Architecture Tests**: Visual context and multimodal support
  - `test/multimodal-detection.test.ts` - Multimodal LLM capability detection
  - `test/visual-context.test.ts` - PNG visual context processing (no conversion)
  - `test/five-phase-pipeline.test.ts` - Updated 5-phase pipeline validation
- **Integration Tests**: End-to-end workflow testing
  - `test/integration/end-to-end.test.ts` - Complete workflow validation
- **Regression Tests**: Advanced AI generation validation
  - `test/regression/few-shot-learning.test.ts` - Pattern learning
  - `test/regression/code-review-icon-generation.test.ts` - Specific use case
  - `test/regression/add-user-icon-generation.test.ts` - Style consistency
- **Fixtures**: Real PNG/SVG files in `test/fixtures/`
- **Test Output**: Generated files in `test/test-output/` (git-ignored)

### Running Specific Tests
```bash
# All tests (51 tests, ~2s)
npm test

# Regression tests only (30-35s timeout)
npm run test:regression
npm run test:code-review
npm run test:add-user

# Test specific functionality
npm test -- --testNamePattern="core|multimodal|visual-context|file-operations"

# Test with coverage
npm test -- --coverage

# Watch mode for development
npm run test:watch
```

## Manual Testing
```bash
# Demo scripts in example/demos/
node example/demos/test-simple.js
node example/demos/test-prompt-only.js
node example/demos/test-output-path.js
node example/demos/test-visual-context.js  # NEW: PNG visual context demo
node example/demos/test-code-review-regression.js

# Few-shot learning examples
node example/test-few-shot.js
node example/test-add-user-icon.js

# Regression test scripts available via npm
npm run test:regression
npm run test:code-review
npm run test:add-user
```

## Key Implementation Details

### Multimodal LLM Architecture
- **Visual Context Processing**: PNG files passed directly to multimodal LLMs as visual references
- **Text Reference Processing**: SVG files processed as text content for all LLMs
- **Automatic Detection**: Smart detection of multimodal LLM capabilities
- **Graceful Fallback**: Clear error messages for non-multimodal LLMs with helpful alternatives

### State Management Implementation
- **Session Tracking**: Comprehensive state management
- **Phase Progression**: 5-step generation process (validation → analysis → generation → refinement → output)
- **Visual Feedback**: Real-time progress display
- **Error Context**: Phase-specific error reporting
- **Processing Time**: Detailed timing metrics

### Security Features
- SVG sanitization for safe output
- Input validation for all file paths
- Zero external dependencies eliminates attack vectors
- Path traversal protection

### Error Handling
- Structured error responses with step context
- Zero-dependency architecture eliminates system dependency failures
- Proper cleanup of temporary files
- Session-based error tracking
- Multimodal capability detection with helpful alternatives

### File Management
- Smart naming with conflict resolution (numeric suffixes)
- Flexible output directory support  
- Zero-copy PNG processing (passed as visual context, not converted)
- Direct SVG text processing for all LLMs
- Support for both PNG and SVG input files

### Generation Modes
- **Visual Context (PNG)**: Multimodal LLMs process PNG files directly as visual references
- **Text References (SVG)**: SVG files processed as text content for pattern learning
- **Mixed References**: Combination of PNG visual context and SVG text references
- **Prompt-only**: Pure text-based generation (works with all LLMs)
- **Style-guided**: Consistent styling with presets

## Debugging
```bash
# Enable MCP debug logging
DEBUG=mcp:* npm run dev

# Check build status (no system dependencies to verify!)
npm run build

# Validate MCP server
node bin/mcp-server.js

# Test specific functionality
npm test -- --testNamePattern="core|multimodal|visual-context|file-operations"

# Test multimodal detection specifically
npm test -- --testNamePattern="multimodal"

# Test visual context processing
npm test -- --testNamePattern="visual-context"
```

## Local Installation Testing

### ⚠️ Important: MCP Server vs CLI Tool Distinction

The `icon-generator-mcp` binary is an **MCP server**, not a traditional CLI tool. This is a common source of confusion when testing.

```bash
# ❌ WRONG: These will hang because the binary expects MCP protocol input
icon-generator-mcp --version
icon-generator-mcp --help

# ✅ CORRECT: Test as MCP server
npm pack
npm install -g ./icon-generator-mcp-0.4.0.tgz

# Verify installation
which icon-generator-mcp  # Should show: /opt/homebrew/bin/icon-generator-mcp
npm list -g icon-generator-mcp  # Should show: icon-generator-mcp@0.4.0
```

### Proper MCP Client Testing

The binary communicates via **JSON-RPC over stdio**, not CLI arguments:

```json
// Add to your MCP client configuration (e.g., Claude Code settings)
{
  "mcpServers": {
    "icon-generator": {
      "command": "icon-generator-mcp"
    }
  }
}
```

### Understanding the Architecture

- **Binary Purpose**: `bin/mcp-server.js` is a stdio-based MCP server
- **Protocol**: Communicates via JSON-RPC messages, not CLI arguments
- **Hanging Behavior**: Normal when run directly - it's waiting for MCP input
- **Testing Method**: Must be tested within an MCP client environment

### Development vs Production Testing

```bash
# Development: Direct server testing
node bin/mcp-server.js  # Will wait for stdin input (expected)

# Production: Test via MCP client
# Use in Claude Code, Continue, or other MCP-compatible tools
```

This distinction is critical for understanding why traditional CLI testing methods don't apply to MCP servers.

## Code Conventions
- TypeScript strict mode enabled (ES2020 target)
- Error-first callback pattern for services
- Comprehensive input validation
- Zero external dependencies approach
- 5-phase processing patterns
- Multimodal LLM detection and visual context processing
- State management with session isolation
- Visual formatting for user feedback

## Current Status (v0.4.0)
- ✅ **Zero Dependencies**: No system requirements, cross-platform compatibility
- ✅ **Multimodal Support**: PNG visual context + SVG text references
- ✅ **5-Phase Pipeline**: Streamlined validation → analysis → generation → refinement → output  
- ✅ **Comprehensive Testing**: 51 tests with full visual context validation
- ✅ **Visual Feedback**: Real-time progress display with 5-phase tracking
- ✅ **Error Handling**: Multimodal detection with helpful alternatives
- ✅ **File Management**: Smart naming and conflict resolution
- ✅ **Cross-Platform**: Works on Windows, macOS, Linux
- ✅ **Performance**: Faster processing without conversion overhead
- ✅ **Global Distribution**: npm package ready