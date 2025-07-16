# Icon Generator MCP Server - Specification

## Project Variables

- **Project_Name**: Icon Generator MCP Server  
- **Project_Goal**: Local MCP server that converts PNG references + text prompts into AI-generated SVG icons
- **Target_Audience**: Developers building web projects who need quick icon generation
- **Functional_Requirements**: PNG vectorization, LLM-based icon generation, automatic naming, file validation
- **NonFunctional_Requirements**: 60s timeout, CLI tool prioritization, API key fallback, error handling
- **User_Scenarios**: Developer has PNG inspiration → generates matching SVG icon via shell command
- **UI_UX_Guidelines**: Shell-based CLI, no GUI for MVP
- **Technical_Constraints**: macOS Apple Silicon only, Node.js, MCP server architecture
- **Assumptions**: Users have Claude/Gemini CLI installed, PNG inputs are valid icons

## Project Overview

The **Icon Generator MCP Server** is a locally executable MCP server that enables developers to quickly generate SVG icons by combining PNG reference images with text prompts. It integrates with Claude Desktop/IDE extensions and prioritizes CLI tool integration over API keys for the MVP.

## Core Functional Requirements

### MCP Server Architecture
- Exposes `generate_icon` tool/function via MCP protocol
- Accepts PNG file paths, text prompt, optional output name
- Runs as standalone Node.js process
- Integrates with Claude Desktop MCP configuration

### Icon Generation Pipeline
1. **Input Validation**: Verify PNG files exist and are valid format
2. **Vectorization**: Convert PNG to SVG using bundled Potrace binary
3. **LLM Processing**: Send vectorized SVG + prompt to Claude/Gemini CLI
4. **Intelligent Naming**: LLM generates contextually appropriate filename
5. **Conflict Resolution**: Auto-append index numbers for duplicate names
6. **Output Sanitization**: Remove potentially malicious SVG elements
7. **File Writing**: Save sanitized SVG to same directory as input PNG

## Technical Architecture Requirements

### Installation & Distribution
- Standalone npm package for local installation
- Bundle macOS Apple Silicon Potrace binary
- Simple setup process for MCP server registration

### LLM Integration Priority
1. **Primary**: Claude CLI tool (`claude` command)
2. **Secondary**: Gemini CLI tool (`gemini` command)  
3. **Future**: Direct API key integration

### Error Handling & Validation
- Graceful failure when CLI tools unavailable
- PNG format validation before processing
- Vectorization failure handling with future API fallback option
- 60-second timeout with configurable parameter
- Proper exit codes and error messages

## User Experience Flow

### Developer Workflow
```bash
# Developer has PNG inspiration files
ls icons/
# monkey.png, banana.png, tree.png

# Generate icon via MCP server integration
[MCP tool execution through Claude Desktop]
# Input: monkey.png, banana.png + "remove the banana from the monkey icon"
# Output: monkey-without-banana.svg (or monkey-without-banana-2.svg if exists)
```

### MCP Integration Pattern
- Tool appears in Claude Desktop tool palette
- Parameters: PNG paths, prompt text, optional output name
- Real-time feedback during processing steps
- Success/failure status with clear error messages

## File Structure & Naming Convention

### Automatic Naming Logic
- LLM generates contextually appropriate filename from prompt
- Sanitize filename for filesystem compatibility
- Check for existing files and append index if needed
- Default to same directory as input PNG unless `-o` specified

### Directory Organization
```
icon-generator-mcp/
├── package.json
├── src/
│   ├── server.js          # MCP server entry point
│   ├── tools/
│   │   └── generate-icon.js
│   ├── services/
│   │   ├── converter.js    # PNG to SVG conversion
│   │   ├── llm.js         # CLI tool integration
│   │   └── validator.js   # SVG sanitization
│   └── utils/
│       └── naming.js      # Filename generation
├── binaries/
│   └── darwin-arm64/
│       └── potrace        # Bundled binary
└── README.md
```

## Assumptions & Constraints

### MVP Assumptions
- Target developers have Claude or Gemini CLI installed
- PNG inputs represent icon-like graphics (not photos)
- SVG output suitable for web development use
- macOS Apple Silicon development environment

### Technical Constraints
- No GUI components for MVP version
- Single platform support (macOS Apple Silicon)
- CLI tool integration preferred over API keys
- 60-second processing timeout
- Zero external service dependencies for core functionality

## Reflection

This specification balances developer productivity with technical simplicity. The MCP server architecture provides seamless integration with existing Claude Desktop workflows while maintaining the security benefits of local processing. The CLI-first approach reduces complexity around API key management and authentication.

The automatic naming feature leverages LLM intelligence to create contextually appropriate filenames, reducing friction in the developer workflow. The vectorization step ensures high-quality scalable output suitable for modern web development.

The phased approach (CLI tools first, API keys later) allows for rapid MVP delivery while maintaining upgrade path for future enhancements.