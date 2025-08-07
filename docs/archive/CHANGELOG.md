# Changelog

All notable changes to the Icon Generator MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-07

### Added
- **Zero-config installation**: Works out of the box without any setup or configuration files
- **Enhanced error handling**: Improved CLI integration with specific error messages for common issues
- **NPM publishing support**: Package ready for global installation via `npm install -g icon-generator-mcp`
- **Automatic LLM tool integration**: Seamlessly works within Claude Code and Gemini CLI environments
- **Comprehensive requirements documentation**: Added detailed requirements and future iterations planning
- **Few-shot learning example**: Added "add user" icon example demonstrating style learning from existing patterns
- **Add user icon regression test**: New script for testing few-shot learning capabilities

### Changed
- **BREAKING**: Removed dependency on environment configuration files (.env)
- **BREAKING**: Simplified installation process - no manual setup required
- **Improved**: Enhanced CLI subprocess error handling with specific error types
- **Improved**: Better timeout and buffer management for LLM CLI calls
- **Updated**: Package.json configured for npm publishing with proper metadata
- **Updated**: README.md reflects new zero-config installation process

### Enhanced
- **Error Messages**: More specific and actionable error messages for CLI failures
- **Installation Experience**: Added postinstall script with helpful setup information
- **Documentation**: Updated installation and troubleshooting sections
- **Package Metadata**: Added proper repository, bugs, and homepage URLs
- **Few-shot Examples**: Extended black-white-flat style with add user icon example
- **Testing Coverage**: Added regression test for few-shot learning validation

### Technical Improvements
- Enhanced `execSync` implementation in both Claude and Gemini services
- Added explicit stdio configuration for better process management
- Improved response validation before parsing
- Added specific error handling for timeout, permission, and command not found scenarios
- Better buffer overflow handling for large responses

### Maintained
- All existing functionality preserved (FR-1 through FR-6)
- PNG to SVG conversion with Potrace integration
- Style-based icon generation with few-shot examples
- File writing capabilities with conflict resolution
- Existing tool schema for `generate_icon`
- Support for both Claude Code and Gemini CLI environments

### Requirements Fulfilled
- **FR-7**: Works within host LLM environment without external API keys ✅
- **FR-8**: Uses existing MCP SDK approach (no HTTP server needed) ✅
- **FR-9**: Maintains CLI integration but improves implementation ✅
- **FR-10**: Eliminates need for environment configuration files ✅
- **FR-11**: Ready for npm registry publishing ✅
- **FR-12**: Supports global installation via npm ✅
- **FR-13**: Includes all necessary dependencies in package ✅
- **FR-14**: Maintains macOS platform focus ✅

### Future Iterations
Deferred features documented in `docs/future-iterations.md`:
- Dynamic tool loading system
- Structured logging integration
- Multi-platform support (Windows, Linux)
- Real-time progress updates
- Bundled Potrace binary distribution

---

## [0.2.0] - Previous Version
- Initial MCP server implementation
- CLI-dependent architecture
- Manual configuration required