# Icon Generator MCP Architecture

## Overview

The Icon Generator MCP Server follows the standard Model Context Protocol (MCP) pattern, similar to successful MCPs like Context7. Instead of calling external LLM services, it processes input data and returns structured information that Claude Code can use to generate SVG icons.

## Core Principle

**Process data locally, return structured results → Let Claude Code handle generation**

This eliminates circular dependencies and leverages Claude Code's existing authentication and processing capabilities.

## Architecture Diagram

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Claude Code │───▶│ MCP Server      │───▶│ Structured Data │
│             │    │ (Local Process) │    │ Response        │
└─────────────┘    └─────────────────┘    └─────────────────┘
                            │                       │
                            ▼                       ▼
                   ┌─────────────────┐    ┌─────────────────┐
                   │ PNG Conversion  │    │ Claude Code     │
                   │ (Potrace)       │    │ SVG Generation  │
                   └─────────────────┘    └─────────────────┘
```

## Data Flow

### 1. Input Processing
- **PNG Conversion**: Convert reference PNG files to SVG using Potrace
- **Prompt Processing**: Structure and optimize user prompts
- **Validation**: Ensure all inputs are safe and properly formatted

### 2. Structured Response
The MCP server returns:
```typescript
{
  success: boolean;
  svg_references?: string[];     // Converted PNG files
  generation_prompt: string;     // Optimized prompt for Claude
  raw_prompt: string;           // Original user prompt
  output_name?: string;         // User-provided filename
  output_path?: string;         // Suggested output location
  instructions: string;         // SVG generation guidelines
  message: string;              // Status message
}
```

### 3. Claude Code Processing
- Receives structured data from MCP
- Uses `generation_prompt` to generate SVG content
- Uses `raw_prompt` or `output_name` for filename generation
- Follows `instructions` for proper SVG formatting
- Saves to `output_path` if provided

## Key Components

### MCPServer (`src/server.ts`)
- **Role**: Main orchestrator and MCP protocol handler
- **Responsibilities**:
  - Request validation and parsing
  - Coordinate service calls
  - Build structured responses
  - Handle errors gracefully

### ConversionService (`src/services/converter.ts`)
- **Role**: PNG to SVG conversion using Potrace
- **Responsibilities**:
  - Process PNG reference files
  - Generate clean SVG representations
  - Handle conversion errors

### Response Structure
The server builds optimized prompts and instructions:

```typescript
private buildGenerationPrompt(userPrompt: string, svgReferences: string[]): string {
  // Combines user prompt with SVG references
  // Creates context-rich prompt for Claude Code
}

private buildSVGInstructions(): string {
  // Provides consistent SVG generation guidelines
  // Ensures proper formatting and security
}
```

## Benefits Over Previous Architecture

### ✅ Reliability
- **No subprocess calls**: Eliminates Claude CLI timeout issues
- **No circular dependencies**: Follows standard MCP pattern
- **Consistent responses**: Structured data format every time

### ✅ Performance
- **Faster processing**: No external CLI execution
- **Lower latency**: Direct data processing
- **Better resource usage**: No subprocess overhead

### ✅ Maintainability
- **Simpler codebase**: Removed LLMService complexity
- **Standard pattern**: Follows established MCP conventions
- **Easy testing**: Pure functions with predictable outputs

### ✅ Security
- **No credential handling**: Leverages Claude Code's auth
- **Input validation**: Maintains security checks
- **No external calls**: Reduced attack surface

## Generation Modes

### Prompt-Only Mode
```javascript
{
  prompt: "Create a red circle icon",
  // No PNG references needed
}
```

### PNG Reference Mode
```javascript
{
  png_paths: ["./reference.png"],
  prompt: "Make this blue instead of red"
}
```

### Custom Output Mode
```javascript
{
  prompt: "Git commit icon",
  output_name: "commit-confirmed",
  output_path: "./icons/"
}
```

## Error Handling

The server provides graceful error handling:
- **Validation errors**: Clear messages for invalid inputs
- **Conversion errors**: Specific PNG processing failures
- **System errors**: Fallback responses with error context

## Future Extensibility

This architecture supports easy extension:
- **Additional formats**: SVG, PDF, or other vector formats
- **More services**: Color analysis, style processing
- **Enhanced prompts**: Template systems, style guides
- **Batch processing**: Multiple icons at once

## Testing Strategy

The architecture enables comprehensive testing:
- **Unit tests**: Individual service testing
- **Integration tests**: End-to-end workflow validation
- **Response validation**: Structured data format testing
- **Error scenarios**: Comprehensive error handling tests

## Comparison with Other MCPs

Like Context7 and other successful MCPs:
- ✅ **Local processing**: No external API dependencies
- ✅ **Structured responses**: Consistent data format
- ✅ **Single responsibility**: Clear, focused functionality
- ✅ **Claude Code integration**: Seamless user experience

This architecture ensures the Icon Generator MCP Server provides a reliable, performant, and maintainable solution for SVG icon generation.