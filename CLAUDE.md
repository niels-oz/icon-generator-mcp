# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack
- **Language**: TypeScript with strict mode (ES2020 target)
- **Platform**: macOS (Intel and Apple Silicon)  
- **Runtime**: Node.js v18+
- **Testing**: Jest with ts-jest (81 tests, 10 test suites)
- **Dependencies**: MCP SDK v0.4.0, Potrace, Jimp, chalk, node-fetch
- **Architecture**: MCP Server with multi-LLM support (Claude + Gemini)

## Prerequisites
```bash
# Required system dependencies
brew install potrace

# Global installation (preferred)
npm install -g icon-generator-mcp

# Verify installations
potrace --version
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

# Run tests (81 tests, ~42s runtime)
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
- **MCPServer** (`src/server.ts`) - Main orchestrator with phase-based generation pipeline
- **ConversionService** (`src/services/converter.ts`) - PNG→SVG conversion using Potrace + Jimp preprocessing
- **LLM Services** (`src/services/llm/`) - Multi-provider architecture (Claude + Gemini)
  - **Factory** (`factory.ts`) - LLM provider selection
  - **Claude** (`claude.ts`) - Claude CLI integration
  - **Gemini** (`gemini.ts`) - Gemini CLI integration
- **FileWriterService** (`src/services/file-writer.ts`) - Output management with conflict resolution
- **StateManager** (`src/services/state-manager.ts`) - Phase-based state tracking and progress management
- **VisualFormatter** (`src/services/visual-formatter.ts`) - Progress visualization
- **CLI** (`src/bin/cli.ts`) - Command-line interface

### Phase-Based Generation Pipeline
1. **Validation** - Input validation and file checking
2. **Analysis** - Prompt and reference analysis
3. **Conversion** - PNG→SVG conversion (if needed)
4. **Generation** - AI-powered SVG creation
5. **Refinement** - Quality enhancement (planned)
6. **Output** - File writing with smart naming

### MCP Tool Schema
```typescript
generate_icon: {
  reference_paths?: string[]     // Optional: PNG/SVG reference files
  prompt: string           // Required: Generation prompt
  style?: string           // Optional: Style preset (e.g., "black-white-flat")
  output_name?: string     // Optional: Custom filename
  output_path?: string     // Optional: Custom output directory
  llm_provider?: 'claude' | 'gemini'  // Optional: LLM provider selection
}
```

## Testing Strategy

### Test Organization (32 Tests Total - Simplified)
- **Core Tests**: Consolidated essential functionality
  - `test/core.test.ts` - MCP server, PNG conversion, phase processing
  - `test/services/file-operations.test.ts` - File handling and path generation
  - `test/services/llm.test.ts` - Multi-provider LLM testing (Claude + Gemini)
  - `test/services/converter.test.ts` - PNG to SVG conversion
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
# All tests (32 tests, ~34s)
npm test

# Regression tests only (30-35s timeout)
npm run test:regression
npm run test:code-review
npm run test:add-user

# Test specific functionality
npm test -- --testNamePattern="core|llm|file-operations"

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
node example/demos/test-conversion.js
node example/demos/test-code-review-regression.js

# Few-shot learning examples
node example/test-few-shot.js
node example/test-add-user-icon.js

# Regression test scripts
./scripts/run-regression-test.sh
./scripts/run-code-review-regression-test.sh
./scripts/run-add-user-regression-test.sh
```

## Key Implementation Details

### Multi-LLM Architecture
- **Provider Factory**: Dynamic LLM provider selection
- **Claude Integration**: Uses `claude` CLI with proper authentication
- **Gemini Integration**: Uses `gemini` CLI with proper authentication
- **Fallback Support**: Graceful handling of provider unavailability

### State Management Implementation
- **Session Tracking**: Comprehensive state management
- **Phase Progression**: 6-step generation process
- **Visual Feedback**: Real-time progress display
- **Error Context**: Phase-specific error reporting
- **Processing Time**: Detailed timing metrics

### Security Features
- SVG sanitization in LLM services
- Input validation for all file paths
- No credential handling (delegates to CLI tools)
- Path traversal protection

### Error Handling
- Structured error responses with step context
- Graceful fallbacks for missing dependencies
- Proper cleanup of temporary files
- Session-based error tracking

### File Management
- Smart naming with conflict resolution (numeric suffixes)
- Flexible output directory support  
- PNG preprocessing with Jimp before Potrace conversion
- Support for both PNG and SVG input files

### Generation Modes
- **PNG/SVG-based**: Uses reference files + descriptive prompt
- **Prompt-only**: Pure text-based generation
- **Style-guided**: Consistent styling with presets
- **Multi-variation**: Automatic variation generation for style keywords

## Debugging
```bash
# Enable MCP debug logging
DEBUG=mcp:* npm run dev

# Check system dependencies
which potrace
which claude
which gemini

# Check build status
npm run build

# Validate MCP server
node bin/mcp-server.js

# Test specific LLM provider
npm test -- --testNamePattern="claude|gemini"
```

## Code Conventions
- TypeScript strict mode enabled (ES2020 target)
- Error-first callback pattern for services
- Comprehensive input validation
- No external API keys (uses CLI authentication)
- Phase-based processing patterns
- Factory pattern for multi-provider support
- State management with session isolation
- Visual formatting for user feedback

## Current Status
- ✅ **Multi-LLM Support**: Claude + Gemini providers
- ✅ **Phase-Based Pipeline**: 6-step generation process with state management
- ✅ **Comprehensive Testing**: 31 tests with regression validation
- ✅ **Visual Feedback**: Real-time progress display
- ✅ **Error Handling**: Phase-specific error context
- ✅ **File Management**: Smart naming and conflict resolution
- ✅ **Global Distribution**: npm package ready