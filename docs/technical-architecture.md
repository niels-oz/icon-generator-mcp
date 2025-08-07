# Technical Architecture & Design

**Project:** `icon-generator-mcp`  
**Version:** 3.0  
**Date:** January 2025  
**Status:** Current Implementation  

## Overview

The Icon Generator MCP Server implements a complete phase-based icon generation pipeline with multi-LLM provider support. The current implementation performs end-to-end generation with comprehensive state management, visual feedback, and production-ready error handling.

## Core Principle

**Phase-based pipeline with multi-provider support → Complete icon generation with state management**

This provides a complete solution with visual feedback, robust error handling, and extensible architecture supporting multiple AI providers.

## Current Architecture

### High-Level Design

The `icon-generator-mcp` is a phase-based MCP server that orchestrates a complete icon generation pipeline with multi-LLM provider support. It combines PNG-to-SVG conversion, AI-powered generation, and intelligent file management through a state-managed workflow with visual progress feedback.

### Architecture Diagram

```
┌─────────────────┐    ┌─────────────────────────────────────────────┐
│ Claude Code/    │───▶│ MCP Server (Phase-Based Pipeline)      │
│ Gemini CLI      │    │                                         │
└─────────────────┘    │ Phase 1: Validation ────────────────────► │
                       │ Phase 2: Analysis   ────────────────────► │
                       │ Phase 3: Conversion (PNG→SVG)  ────────► │
                       │ Phase 4: Generation (Multi-LLM) ──────► │
                       │ Phase 5: Refinement ────────────────────► │
                       │ Phase 6: Output (File Writing) ────────► │
                       │                                         │
                       │ State: Visual Progress + Error Context │
                       └─────────────────────────────────────────┘
                                           │
                                           ▼
                              ┌─────────────────────┐
                              │ Generated SVG Files │
                              │ + Processing Stats  │
                              └─────────────────────┘
```

## Current Data Flow

### Phase-Based Processing Pipeline

**Phase 1 - Validation:** Input parameter validation, file existence checks  
**Phase 2 - Analysis:** Prompt analysis, provider selection, style detection  
**Phase 3 - Conversion:** PNG→BMP→SVG conversion using Potrace+Jimp  
**Phase 4 - Generation:** Multi-LLM generation (Claude/Gemini) with provider selection  
**Phase 5 - Refinement:** SVG sanitization, validation, quality checks  
**Phase 6 - Output:** File writing, conflict resolution, success reporting  

### Current Response Format
```typescript
{
  success: boolean;
  output_path?: string;          // Path to generated icon(s)
  message: string;               // Human-readable result
  processing_time: number;       // Generation time in ms
  steps?: ProcessingStep[];      // Phase execution details
  error?: string;               // Error details if failed
  variations_count?: number;     // Number of variations generated
  llm_provider?: string;        // Provider used for generation
}
```

### Multi-Provider Architecture
- **Provider Factory:** Dynamic selection between Claude/Gemini
- **Runtime Selection:** Provider specified via `llm_provider` parameter
- **Fallback Support:** Graceful degradation when providers unavailable
- **Authentication:** Delegates to CLI tools, no credential handling

## Core Components

### MCPServer (`src/server.ts`)
- **Role:** Phase-based pipeline orchestrator with state management
- **Responsibilities:**
  - 6-phase generation pipeline execution
  - State management and visual progress feedback
  - Multi-provider coordination via factory pattern
  - Comprehensive error handling with context
  - Processing time tracking and metrics

### StateManager (`src/services/state-manager.ts`)
- **Role:** Session state tracking and phase progression
- **Responsibilities:**
  - Phase-based state management
  - Processing time metrics
  - Visual feedback coordination
  - Session isolation and cleanup

### LLM Factory (`src/services/llm/factory.ts`)
- **Role:** Multi-provider abstraction and selection
- **Providers:** Claude (`claude.ts`) + Gemini (`gemini.ts`)
- **Features:** Runtime provider selection, graceful fallbacks

### ConversionService (`src/services/converter.ts`)
- **Role:** PNG to SVG conversion using Potrace
- **Responsibilities:**
  - Process PNG reference files with Jimp preprocessing
  - Generate clean SVG representations using Potrace
  - Handle conversion errors gracefully

### FileWriterService (`src/services/file-writer.ts`)
- **Role:** Output management with conflict resolution
- **Responsibilities:**
  - Smart filename generation with LLM suggestions
  - Conflict resolution using numeric suffixes
  - Custom output path support
  - File permission and access validation

## Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Runtime** | Node.js (v18+) | Excellent for I/O-bound tasks, rich npm ecosystem |
| **MCP Protocol** | `@modelcontextprotocol/sdk` | Official SDK for MCP server implementation |
| **Vectorization** | System `potrace` binary | Industry-standard bitmap tracing |
| **Image Processing** | `jimp` | Pure JavaScript, no native dependencies |
| **LLM Interface** | CLI integration | Secure subprocess execution, delegated auth |
| **Multi-Provider** | Factory pattern | Extensible architecture for provider additions |

## Security Architecture

### Threat Model & Controls

**Primary Threats:**
1. **Malicious LLM Output:** SVG containing XSS payloads
2. **Input Validation:** Crafted PNG files or prompts
3. **Process Injection:** Command injection in CLI calls

**Security Controls:**
1. **SVG Sanitization:** Removes `<script>` tags, event attributes
2. **Input Validation:** PNG format validation, file size limits
3. **Secure Subprocess:** `child_process.spawn` prevents shell injection
4. **Delegated Authentication:** No credential handling in server
5. **Process Isolation:** Limited system access, separate process space

## Current Implementation Benefits

### ✅ Multi-Provider Support
- **Claude + Gemini:** Runtime provider selection
- **Extensible Factory:** Easy addition of new providers
- **Graceful Fallbacks:** Provider unavailability handling
- **CLI Authentication:** Delegates auth to provider tools

### ✅ Phase-Based Pipeline
- **6-Phase Processing:** Structured generation workflow
- **State Management:** Session tracking and progress feedback
- **Visual Feedback:** Real-time progress display
- **Error Context:** Phase-specific error reporting

### ✅ Production Quality
- **32 Essential Tests:** Comprehensive test coverage
- **Error Handling:** Robust failure recovery
- **Performance Metrics:** Processing time tracking
- **File Management:** Smart naming and conflict resolution

### ✅ Developer Experience
- **Zero Config:** Works immediately after `npm install -g`
- **Clear Feedback:** Detailed progress and error messages
- **Flexible Parameters:** Support for all use cases
- **Global Distribution:** npm package ready for production

## Current Testing Strategy

Comprehensive testing with 32 essential tests:

- **Core Tests:** MCP server, PNG conversion, phase processing (`test/core.test.ts`)
- **Service Tests:** File operations, multi-provider LLM testing, conversion pipeline
- **Integration Tests:** End-to-end workflow validation (`test/integration/end-to-end.test.ts`)
- **Regression Tests:** Cross-domain few-shot learning validation (`test/regression/code-review-icon-generation.test.ts`)
- **Performance Testing:** Processing time benchmarks and provider comparison

### Test Coverage Metrics
- **Lines:** 81% coverage
- **Functions:** 85% coverage
- **Branches:** 78% coverage
- **Statements:** 81% coverage

## Performance Benchmarks

**Generation Times:**
- Single icon (prompt-only): 8-15 seconds
- Single icon (with references): 3-8 seconds
- Style variations (4 icons): 25-35 seconds
- Regression tests: 30-35 seconds per test

**Resource Usage:**
- Memory: ~50MB during generation
- CPU: Moderate during Potrace conversion
- Disk: Minimal temporary files, immediate cleanup

## Generation Modes

### Prompt-Only Mode
```javascript
{
  prompt: "Create a minimalist star icon with clean lines"
  // No PNG references needed
}
```

### PNG Reference Mode
```javascript
{
  reference_paths: ["./reference.png"],
  prompt: "Make this icon more geometric and flat"
}
```

### Style-Based Generation
```javascript
{
  prompt: "Create a code review icon",
  style: "black-white-flat"
  // Auto-generates variations with consistent style
}
```

### Multi-Provider Mode
```javascript
{
  prompt: "Generate a folder icon",
  llm_provider: "gemini"  // or "claude"
}
```

## Current Implementation Status

- **Published Package:** Available as `icon-generator-mcp` on npm
- **Global Installation:** `npm install -g icon-generator-mcp`
- **Zero Configuration:** Works out-of-box in Claude Code/Gemini environments
- **Testing:** 32 tests with 81% coverage, including regression tests
- **Multi-LLM Support:** Claude + Gemini providers with runtime selection
- **Phase-Based Pipeline:** 6-step generation with state management and visual feedback

## Error Handling

The server provides comprehensive error handling:

- **Validation Errors:** Clear parameter validation with specific guidance
- **Provider Errors:** Graceful fallback between Claude/Gemini
- **Conversion Errors:** Detailed Potrace processing failures
- **File System Errors:** Permission and path validation
- **LLM Errors:** Provider-specific error context and suggestions

## Future Extensibility

This architecture supports easy extension:

- **Additional LLM Providers:** Factory pattern enables OpenAI, local LLMs
- **Enhanced Formats:** SVG input, JPEG/WebP support
- **Advanced Features:** Batch processing, configuration files
- **Platform Support:** Windows/Linux compatibility
- **Plugin System:** Custom processing extensions

---

**Architecture Status:** ✅ **Production Ready** - Multi-LLM MCP server with comprehensive phase-based pipeline, state management, and extensive test coverage.