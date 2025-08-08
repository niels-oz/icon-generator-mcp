# Changelog

All notable changes to the Icon Generator MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2025-08-07 (Beta)

### Fixed
- **Version Consistency**: Unified version handling across server, CLI, and package.json
- **LLM Provider Selection**: Removed hard-coded Claude override, now respects constructor parameter
- **Directory Creation**: FileWriterService now creates missing output directories automatically
- **Dependency Cleanup**: Removed unused node-fetch and @types/node-fetch dependencies
- **CLI Consolidation**: Removed duplicate CLI entry point to prevent drift

### Technical Improvements
- Server and CLI now read version from package.json at runtime for single source of truth
- Enhanced error messages for directory creation failures
- Improved provider selection respects multi-LLM architecture promises

## [0.3.0] - 2025-08-07 (Beta)

### Added
- **Multi-LLM Architecture**: Added support for both Claude and Gemini providers via factory pattern (Note: Provider selection currently defaults to Claude but can be overridden via constructor)
- **Phase-based Generation Pipeline**: Implemented 6-step generation process with state management
- **Visual Progress Feedback**: Real-time progress display during icon generation
- **Comprehensive Test Suite**: 31 tests covering core functionality, regression testing, and integration
- **Advanced State Management**: Session tracking with phase progression and timing metrics
- **Enhanced Error Handling**: Phase-specific error context and structured error responses
- **Smart File Management**: Conflict resolution with automatic numeric suffixes
- **Global npm Distribution**: Package ready for `npm install -g icon-generator-mcp`

### Enhanced
- **LLM Integration**: Improved CLI subprocess handling for both Claude and Gemini
- **PNG Conversion**: Better Jimp preprocessing before Potrace conversion
- **File Operations**: Flexible output directory support and smart naming
- **Testing Coverage**: Regression tests for few-shot learning and style consistency
- **Documentation**: Comprehensive CLAUDE.md with full development guidance

### Technical Improvements
- Factory pattern for LLM provider selection
- Phase-based state tracking with visual formatting
- Enhanced error context with step-specific messaging
- Improved timeout and buffer management for CLI calls
- Better SVG sanitization and validation

### Beta Status Notes
- **Stable Core**: All primary features working reliably
- **Testing**: Comprehensive test suite with 31 tests
- **Documentation**: Full development and usage documentation
- **Ready for Feedback**: Seeking user feedback before 1.0 release

## [0.2.0] - Previous Version

### Added
- Initial MCP server implementation with basic icon generation
- PNG to SVG conversion using Potrace
- CLI integration for AI-powered generation
- Basic file writing capabilities
- Style-based generation with few-shot examples

### Technical Details
- CLI-dependent architecture
- Manual configuration required
- Single LLM provider support
- Basic error handling

---

**Note**: Version 0.3.0 represents a significant architectural improvement with multi-LLM support, enhanced state management, and comprehensive testing. Ready for beta testing and feedback.