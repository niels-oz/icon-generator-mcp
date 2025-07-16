# Icon Generator MCP Server - Architecture

## System Architecture Overview

The Icon Generator MCP Server follows a **layered service architecture** with clear separation of concerns, optimized for local execution and MCP protocol integration.

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Client Layer                         │
│              (Claude Desktop / IDE)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ MCP Protocol
┌─────────────────────▼───────────────────────────────────────┐
│                 MCP Server Layer                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │            Tool Registry & Handler                      │ │
│  │          (generate_icon endpoint)                       │ │
│  └─────────────────────┬───────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                 Business Logic Layer                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Input         │ │   Conversion    │ │   LLM Service   │ │
│  │   Validator     │ │   Service       │ │   Orchestrator  │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   SVG           │ │   Naming        │ │   File          │ │
│  │   Sanitizer     │ │   Manager       │ │   Writer        │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                 Infrastructure Layer                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Potrace       │ │   CLI Tool      │ │   File System   │ │
│  │   Binary        │ │   Interface     │ │   Operations    │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Selection

### Core Runtime
- **Node.js v18+**: LTS support, excellent subprocess handling, cross-platform compatibility
- **MCP SDK**: Official Model Context Protocol implementation
- **TypeScript**: Type safety, better IDE support, enterprise-grade development

### Image Processing
- **jimp**: Pure JavaScript image manipulation (no native dependencies)
- **Potrace binary**: Industry-standard bitmap to vector conversion
- **Platform-specific bundling**: macOS ARM64 binary included in npm package

### LLM Integration
- **child_process.spawn**: Secure subprocess execution for CLI tools
- **Commander pattern**: Abstracted LLM interface supporting multiple providers
- **Timeout management**: Promise-based execution with configurable timeouts

### Validation & Security
- **xml2js**: Safe XML parsing for SVG validation
- **DOMPurify**: Client-side XSS protection adapted for SVG sanitization
- **Path validation**: Filesystem security for input/output operations

## Detailed Component Architecture

### 1. MCP Server Layer (`src/server.js`)

```javascript
class IconGeneratorMCPServer {
    constructor() {
        this.server = new MCPServer("icon-generator", "1.0.0")
        this.toolRegistry = new ToolRegistry()
        this.configManager = new ConfigManager()
    }
    
    // Tool registration and request handling
    // Connection management with MCP clients
    // Error boundary and logging
}
```

**Responsibilities:**
- MCP protocol compliance and message handling
- Tool registration and capability advertisement
- Request routing to business logic layer
- Error response formatting and logging

### 2. Business Logic Layer

**Input Validator (`src/services/validator.js`)**
```javascript
class InputValidator {
    validatePNGFiles(paths)     // File existence and format validation
    validatePrompt(text)        // Content validation and sanitization
    validateOutputPath(path)    // Filesystem permission checks
}
```

**Conversion Service (`src/services/converter.js`)**
```javascript
class ConversionService {
    constructor() {
        this.potracePath = this.resolveBinaryPath()
    }
    
    async convertPNGToSVG(pngPath) {
        // PNG → BMP → SVG pipeline using Potrace
        // Temporary file management
        // Error handling for conversion failures
    }
}
```

**LLM Service Orchestrator (`src/services/llm.js`)**
```javascript
class LLMService {
    constructor() {
        this.providers = [
            new ClaudeCLIProvider(),
            new GeminiCLIProvider()
        ]
    }
    
    async generateIcon(prompt, timeout = 60000) {
        // Provider selection and fallback logic
        // Request formatting and response parsing
        // Timeout management and error handling
    }
}
```

### 3. Infrastructure Layer

**Binary Management (`src/utils/binary-manager.js`)**
```javascript
class BinaryManager {
    static resolvePotracePath() {
        // Platform detection (darwin-arm64 for MVP)
        // Binary extraction and permission setting
        // Verification of binary integrity
    }
}
```

**File System Operations (`src/utils/file-operations.js`)**
```javascript
class FileOperations {
    static async writeAtomic(path, content) {
        // Atomic file writing with temp files
        // Permission and directory creation
        // Rollback capability on failure
    }
}
```

## Data Flow Architecture

```
PNG Files → Input Validation → Vectorization → LLM Processing → Sanitization → File Writing
     ↓              ↓              ↓              ↓              ↓              ↓
[file.png]    [validation]    [svg data]    [generated]    [clean svg]    [output.svg]
     ↓              ↓              ↓              ↓              ↓              ↓
File System    Error Handling    Potrace       CLI Tool      Security       File System
```

## Security Architecture

### Input Sanitization
- Path traversal prevention for file operations
- PNG format validation before processing
- Prompt content filtering for sensitive data

### Process Isolation
- Subprocess execution for external tools (Potrace, CLI)
- Temporary file cleanup in isolated directories
- Resource limits on subprocess execution

### Output Sanitization
- SVG content scrubbing for malicious elements
- Filename sanitization for filesystem compatibility
- Permission-based file writing with user context

## Configuration Management

### Environment Configuration
```javascript
// Default configuration with environment override
const config = {
    timeout: process.env.ICON_GENERATOR_TIMEOUT || 60000,
    tempDir: process.env.ICON_GENERATOR_TEMP || os.tmpdir(),
    logLevel: process.env.ICON_GENERATOR_LOG_LEVEL || 'info',
    maxFileSize: process.env.ICON_GENERATOR_MAX_SIZE || '10MB'
}
```

### MCP Server Configuration
```json
{
    "mcpServers": {
        "icon-generator": {
            "command": "node",
            "args": ["/path/to/icon-generator-mcp/src/server.js"],
            "env": {
                "ICON_GENERATOR_TIMEOUT": "60000"
            }
        }
    }
}
```

## Package Distribution Architecture

### NPM Package Structure
```
icon-generator-mcp/
├── package.json              # Dependencies and metadata
├── bin/
│   └── icon-generator-mcp    # Executable entry point
├── src/                      # Source code
├── binaries/
│   └── darwin-arm64/
│       └── potrace          # Bundled binary
├── types/                   # TypeScript definitions
└── docs/                    # Installation and usage guides
```

### Installation Flow
1. **npm install**: Downloads package with bundled binary
2. **Postinstall script**: Sets binary permissions, validates environment
3. **MCP registration**: User adds server to MCP configuration
4. **Capability advertisement**: Server announces tools to MCP clients

## Scalability Considerations

### Resource Management
- Concurrent request limiting (prevent resource exhaustion)
- Temporary file cleanup with TTL-based garbage collection
- Memory-efficient image processing with streaming where possible

### Performance Optimization
- Binary caching and reuse across requests
- SVG template caching for common patterns
- Asynchronous processing with proper error boundaries

## Monitoring and Observability

### Logging Strategy
- Structured JSON logging for operational insights
- Request tracing with unique correlation IDs
- Performance metrics for conversion and LLM operations

### Health Checks
- Binary availability verification
- CLI tool accessibility testing
- File system permission validation

## Reflection

This architecture balances simplicity with robustness, providing a solid foundation for the MVP while enabling future enhancements. The layered approach ensures clear separation of concerns and makes the system testable and maintainable.

The MCP server architecture integrates seamlessly with existing Claude Desktop workflows while maintaining security through process isolation and input sanitization. The CLI-first approach reduces complexity while providing a clear upgrade path to direct API integration.

The bundled binary approach ensures consistent functionality across installations, while the configurable timeout and resource management provide operational flexibility. The TypeScript foundation enables better development experience and reduces runtime errors.