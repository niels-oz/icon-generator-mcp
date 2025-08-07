# MCP Server Enhancement Requirements Document

**Project:** Icon Generator MCP Server Enhancement  
**Version:** 1.0  
**Date:** January 7, 2025  
**Status:** Final Requirements  

## Problem Statement

The current Icon Generator MCP Server relies on external CLI dependencies (`claude` and `gemini` commands) which creates installation complexity, portability issues, and maintenance overhead. The enhancement aims to create a true MCP server that works seamlessly within LLM tools without requiring additional API keys or complex configuration.

## Solution Overview

Transform the Icon Generator into a self-contained MCP server that:
- Works within LLM tools (Claude Code/Gemini) using their existing authentication
- Requires zero configuration and works out of the box
- Maintains current functionality while improving reliability and user experience
- Can be easily distributed via npm

## Functional Requirements

### Core Functionality
- **FR-1**: Generate SVG icons from PNG references and/or text prompts
- **FR-2**: Support both Claude Code and Gemini CLI environments
- **FR-3**: Convert PNG files to SVG using Potrace integration
- **FR-4**: Maintain existing tool schema for `generate_icon`
- **FR-5**: Preserve file writing capabilities with conflict resolution
- **FR-6**: Support style-based icon generation with few-shot examples

### Architecture Requirements
- **FR-7**: Work within host LLM environment without external API keys
- **FR-8**: Use existing MCP SDK approach (no HTTP server needed)
- **FR-9**: Maintain CLI integration but improve implementation
- **FR-10**: Eliminate need for environment configuration files

### Distribution Requirements
- **FR-11**: Publish to npm registry for easy installation
- **FR-12**: Support global installation via `npm install -g icon-generator-mcp`
- **FR-13**: Include all necessary dependencies in package
- **FR-14**: Maintain macOS platform focus

## Technical Requirements

### File Structure Changes
```
src/
├── server.ts              # Main MCP server (keep existing)
├── services/
│   ├── converter.ts       # PNG to SVG conversion (keep)
│   ├── file-writer.ts     # File operations (keep)
│   ├── llm/
│   │   ├── claude.ts      # Improve CLI integration
│   │   ├── gemini.ts      # Improve CLI integration
│   │   └── factory.ts     # Provider selection (keep)
│   └── state-manager.ts   # Optional: simplify or remove
```

### Implementation Specifications

#### LLM Service Refactoring
- **TR-1**: Improve `execSync` implementation in `src/services/llm/claude.ts:190`
- **TR-2**: Enhance error handling for CLI subprocess calls
- **TR-3**: Maintain structured response parsing
- **TR-4**: Keep security validation and SVG sanitization

#### Tool Schema Maintenance
- **TR-5**: Preserve existing `generate_icon` tool interface
- **TR-6**: Keep support for `png_paths`, `prompt`, `output_name`, `output_path`, `style`, `llm_provider`
- **TR-7**: Maintain backward compatibility with current usage patterns

#### File Operations
- **TR-8**: Keep `ConversionService` with Potrace dependency
- **TR-9**: Maintain `FileWriterService` for automatic file saving
- **TR-10**: Preserve conflict resolution with numeric suffixes

#### Style System
- **TR-11**: Keep `few-shot-examples` style system
- **TR-12**: Maintain style-based generation capabilities
- **TR-13**: Preserve existing style configurations

### Dependencies
- **TR-14**: Keep `@modelcontextprotocol/sdk` for MCP protocol
- **TR-15**: Maintain `jimp` for image processing
- **TR-16**: Keep `node-fetch` for potential web operations
- **TR-17**: Require system `potrace` installation (document in README)

## Implementation Hints and Patterns

### Code Patterns to Follow
1. **Error Handling**: Maintain robust error handling for file operations and CLI calls
2. **Security**: Keep SVG sanitization and input validation
3. **Modularity**: Preserve service-based architecture
4. **Testing**: Maintain existing test coverage patterns

### Files to Modify
- `src/services/llm/claude.ts` - Improve CLI integration
- `src/services/llm/gemini.ts` - Improve CLI integration  
- `package.json` - Update for npm publishing
- `README.md` - Update installation instructions
- `bin/mcp-server.js` - Ensure proper entry point

### Files to Keep Unchanged
- `src/server.ts` - Core MCP server logic
- `src/services/converter.ts` - PNG conversion service
- `src/services/file-writer.ts` - File operations
- `src/types.ts` - Type definitions

## Acceptance Criteria

### Installation & Setup
- **AC-1**: User can install with `npm install -g icon-generator-mcp`
- **AC-2**: No additional configuration files required
- **AC-3**: Works immediately after installation in Claude Code/Gemini
- **AC-4**: Clear error messages if system dependencies missing

### Functionality
- **AC-5**: All existing demo scripts continue to work
- **AC-6**: PNG to SVG conversion maintains quality
- **AC-7**: Style-based generation produces consistent results
- **AC-8**: File naming and conflict resolution works as before

### Reliability
- **AC-9**: Improved error handling for CLI timeouts
- **AC-10**: Graceful fallback when CLI tools unavailable
- **AC-11**: No regression in generation quality or speed
- **AC-12**: Maintains security standards for SVG output

### Distribution
- **AC-13**: Package publishes successfully to npm
- **AC-14**: Global installation works on macOS (Intel/Apple Silicon)
- **AC-15**: Documentation updated for new installation method
- **AC-16**: Existing users can upgrade seamlessly

## Future Iterations

The following features are deferred to future releases:

### Phase 2 Enhancements
- **FI-1**: Dynamic tool loading system for custom capabilities
- **FI-2**: Structured logging with Winston/Pino integration
- **FI-3**: Multi-platform support (Windows, Linux)
- **FI-4**: Real-time progress updates via WebSocket/SSE
- **FI-5**: Bundled Potrace binary to eliminate system dependency

### Phase 3 Enhancements  
- **FI-6**: Additional input formats (JPEG, GIF, WebP)
- **FI-7**: Batch processing capabilities
- **FI-8**: Advanced conversion parameters
- **FI-9**: Plugin architecture for extensibility
- **FI-10**: Performance optimizations and caching

## Success Metrics

- **Zero-config installation**: No setup steps beyond npm install
- **Maintained functionality**: All existing features work as before
- **Improved reliability**: Reduced CLI timeout issues
- **Easy distribution**: Simple npm-based installation
- **User satisfaction**: Seamless integration with LLM tools

---

**Document Status**: Final - Ready for Implementation  
**Next Steps**: Begin implementation following technical requirements and acceptance criteria