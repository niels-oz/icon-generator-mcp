# Technical Architecture

**Project:** `icon-generator-mcp`  
**Version:** 4.0 - LLM-Agnostic Implementation  
**Date:** January 2025  
**Status:** Production Ready  

## Architecture Overview

The Icon Generator MCP Server implements an LLM-agnostic context preparation system with phase-based processing pipeline. Instead of calling external LLM APIs, the server provides structured generation context that any MCP-compatible LLM can consume to generate SVG icons.

## Core Architecture Principle

**Context Preparation → LLM Generation → File Management**

The server acts as a preprocessing and postprocessing layer, handling PNG conversion and file operations while delegating creative generation to the MCP client's LLM.

## Current Architecture

### High-Level Design

The `icon-generator-mcp` is a phase-based MCP server that orchestrates a complete icon generation pipeline with multi-LLM provider support. It combines PNG-to-SVG conversion, AI-powered generation, and intelligent file management through a state-managed workflow with visual progress feedback.

## System Architecture

```
┌─────────────────────┐     ┌──────────────────────────────────────────┐
│ Any MCP Client      │────▶│ Icon Generator MCP Server                │
│ (Claude/Gemini/GPT) │     │                                          │
└─────────────────────┘     │ ┌──────────────────────────────────────┐ │
                            │ │ Phase 1: Input Validation            │ │
                            │ │ • PNG/SVG file validation           │ │
                            │ │ • Prompt parameter checking         │ │
                            │ └──────────────────────────────────────┘ │
                            │ ┌──────────────────────────────────────┐ │
                            │ │ Phase 2: Context Analysis            │ │
                            │ │ • Prompt keyword extraction         │ │
                            │ │ • Style preset application          │ │
                            │ └──────────────────────────────────────┘ │
                            │ ┌──────────────────────────────────────┐ │
                            │ │ Phase 3: PNG→SVG Conversion         │ │
                            │ │ • Jimp preprocessing                │ │
                            │ │ • Potrace vectorization             │ │
                            │ └──────────────────────────────────────┘ │
                            │ ┌──────────────────────────────────────┐ │
                            │ │ Phase 4: Context Preparation         │ │
                            │ │ • Build generation instructions     │ │
                            │ │ • Include reference SVGs            │ │
                            │ │ • Apply few-shot examples           │ │
                            │ └──────────────────────────────────────┘ │
                            └──────────────────────────────────────────┘
                                           │
                                           ▼
                               ┌─────────────────────┐
                               │ Structured Context  │
                               │ for LLM Generation  │
                               └─────────────────────┘
                                           │
                                           ▼
                   ┌─────────────────────────────────────────────────┐
                   │ MCP Client LLM generates SVG based on context  │
                   │ • Uses provided instructions and examples       │
                   │ • Follows style guidelines from context        │
                   │ • Returns generated SVG to user                │
                   └─────────────────────────────────────────────────┘
```

## LLM-Agnostic Data Flow

### Phase-Based Context Preparation

**Phase 1 - Validation:** Input parameter validation, file existence checks, format verification
**Phase 2 - Analysis:** Prompt keyword extraction, style preset detection, complexity analysis  
**Phase 3 - Conversion:** PNG→SVG conversion using Potrace with Jimp preprocessing
**Phase 4 - Context Building:** Structured instruction generation with few-shot examples and references
**Phase 5 - Response Formatting:** Package context for MCP client consumption
**Phase 6 - State Management:** Progress tracking, error handling, session cleanup

### Context Response Format
```typescript
interface GenerationContext {
  prompt: string;                    // Complete generation instructions
  instructions: string;              // Specific formatting requirements
  processing_info: {
    references_processed: number;    // Number of PNG/SVG references converted
    style_applied: string | null;    // Applied style preset name
    analysis_time_ms: number;        // Context preparation time
  };
}
```

### Context Structure Example
```typescript
{
  prompt: `You are an expert SVG icon designer...
           [Few-shot examples if style specified]
           [Reference SVGs if provided]
           User request: Create a minimalist folder icon
           
           Requirements:
           - Use proper SVG namespace
           - Include viewBox for scalability
           - Follow provided style examples
           - Generate clean, optimized code`,
           
  instructions: "Generate SVG and return in specified format",
  processing_info: {
    references_processed: 2,
    style_applied: "black-white-flat",
    analysis_time_ms: 143
  }
}
```

### LLM-Agnostic Design Benefits
- **No Provider Lock-in:** Works with Claude, Gemini, GPT, local LLMs
- **Zero CLI Dependencies:** No subprocess calls or external tool requirements
- **Faster Response:** Context preparation under 500ms vs seconds for API calls
- **Better Error Handling:** Structured errors without CLI parsing complexity
- **Platform Independence:** No macOS-only constraints from provider tools

## Core Components

### MCPServer (`src/server.ts`) 
- **Role:** Phase-based context preparation orchestrator
- **Responsibilities:**
  - 6-phase context preparation pipeline
  - Input validation and error handling  
  - Phase progression with state management
  - MCP protocol tool exposure
  - Session lifecycle management

### ContextBuilder (`src/context-builder.ts`)
- **Role:** LLM generation context preparation
- **Responsibilities:**
  - Build structured generation instructions
  - Apply few-shot learning examples for styles
  - Include reference SVG content
  - Format requirements and constraints
  - Generate contextually appropriate prompts

### ConversionService (`src/services/converter.ts`)
- **Role:** PNG to SVG vectorization
- **Responsibilities:**
  - Preprocess PNG files with Jimp (brightness, contrast)
  - Execute Potrace conversion to clean SVG
  - Handle format validation and error cases
  - Optimize SVG output for context inclusion

### StateManager (`src/services/state-manager.ts`)
- **Role:** Processing state and progress tracking
- **Responsibilities:**
  - Phase-based state transitions
  - Processing time metrics
  - Error context tracking
  - Visual progress feedback
  - Session cleanup and memory management

### FileWriterService (`src/services/file-writer.ts`)
- **Role:** Output file management (for future generated SVG saving)
- **Responsibilities:**
  - Smart filename generation from prompts
  - Conflict resolution with numeric suffixes
  - Custom output path support
  - Directory validation and creation

### VisualFormatter (`src/services/visual-formatter.ts`)
- **Role:** Progress display and user feedback
- **Responsibilities:**
  - Format phase progression display
  - Generate processing summaries
  - Create structured error messages
  - Provide completion status feedback

### Style System (`src/styles/few-shot-examples.ts`)
- **Role:** Style preset management with few-shot learning
- **Responsibilities:**
  - Define style configurations with examples
  - Provide consistent style application
  - Support style-based generation consistency
  - Enable style transfer learning

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

## LLM-Agnostic Implementation Benefits

### ✅ Universal LLM Compatibility
- **Any MCP Client:** Works with Claude, Gemini, GPT, local LLMs
- **No Provider Dependencies:** Zero CLI tools or API requirements
- **Better Performance:** Context prep <500ms vs 8-15s for API calls
- **Simplified Architecture:** No provider selection or fallback logic

### ✅ Enhanced Context Quality
- **Structured Instructions:** Detailed generation guidance
- **Few-Shot Learning:** Style consistency with examples
- **Reference Integration:** Clean SVG references for style transfer
- **Format Requirements:** Specific output formatting instructions

### ✅ Developer Experience
- **Zero Configuration:** Works immediately after npm install
- **Fast Response:** Instant context preparation
- **Clear Instructions:** Detailed error messages and guidance
- **Platform Independent:** No macOS-only constraints

### ✅ Production Ready
- **Comprehensive Testing:** 32 tests with LLM-independent validation
- **Robust Error Handling:** Structured errors without CLI complexity
- **Memory Efficient:** Reduced memory usage (30MB vs 50MB)
- **State Management:** Full session tracking and cleanup

## Current Testing Strategy

Comprehensive testing with 32 essential tests:

- **Core Tests:** MCP server, PNG conversion, phase processing (`test/core.test.ts`)
- **Service Tests:** File operations, multi-provider LLM testing, conversion pipeline
- **Integration Tests:** End-to-end workflow validation (`test/integration/end-to-end.test.ts`)
- **Regression Tests:** Cross-domain few-shot learning validation (`test/regression/code-review-icon-generation.test.ts`)
- **Performance Testing:** Processing time benchmarks and provider comparison

### Test Coverage Metrics
- **Lines:** 81% coverage (maintained during refactoring)
- **Functions:** 85% coverage
- **Branches:** 78% coverage  
- **Statements:** 81% coverage
- **Context Generation:** 100% coverage for core context building
- **LLM Independence:** All tests run without external LLM dependencies

## Performance Benchmarks

**Context Preparation Times:**
- Context generation (prompt-only): <200ms
- Context with PNG references: 1-3 seconds (including conversion)
- Style preset application: <100ms additional
- Complex multi-reference requests: <5 seconds

**Resource Usage:**
- Memory: ~30MB peak during PNG processing (reduced from 50MB)
- CPU: Moderate during Potrace conversion only
- Disk: Minimal temporary files, immediate cleanup
- Network: Zero external API calls (LLM-agnostic)

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

## Implementation Status

- **LLM-Agnostic Architecture:** Complete refactoring from provider-specific to universal
- **Context-Based Generation:** Structured instruction preparation instead of direct LLM calls
- **Published Package:** Available as `icon-generator-mcp` on npm
- **Universal Compatibility:** Works with any MCP-compatible LLM client
- **Testing:** 32 tests with 81% coverage, all LLM-independent
- **Phase-Based Pipeline:** 6-step context preparation with state management
- **Performance Optimized:** Sub-500ms context preparation, reduced memory usage

## Error Handling

The server provides comprehensive error handling:

- **Validation Errors:** Clear parameter validation with specific guidance
- **Provider Errors:** Graceful fallback between Claude/Gemini
- **Conversion Errors:** Detailed Potrace processing failures
- **File System Errors:** Permission and path validation
- **LLM Errors:** Provider-specific error context and suggestions

## Future Extensibility

The LLM-agnostic architecture enables easy extension:

- **Enhanced Context Types:** Advanced prompt engineering, multi-modal contexts
- **Additional Input Formats:** JPEG, WebP, GIF support with conversion
- **Style System Expansion:** Custom style presets, user-defined few-shot examples
- **Batch Processing:** Multiple icon contexts in single request
- **Plugin Architecture:** Custom context builders and processing extensions
- **Configuration System:** Project-level settings, style template management

---

**Architecture Status:** ✅ **Production Ready** - Multi-LLM MCP server with comprehensive phase-based pipeline, state management, and extensive test coverage.