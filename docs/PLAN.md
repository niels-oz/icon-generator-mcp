# Icon Generator MCP Server - LLM Agnostic Refactoring Plan

**Project:** `icon-generator-mcp`  
**Version:** 0.4.0 (Target)  
**Date:** 2025-08-08  
**Status:** Planning Phase  

## Executive Summary

Refactor the Icon Generator MCP Server to be fully LLM-agnostic by removing provider-specific CLI subprocess calls and embracing MCP's core design principle of solving the N x M complexity problem. The server will become a pure tool provider that works seamlessly with any MCP-compatible LLM.

## Current Architecture Problems

### 1. Provider-Specific Complexity
- **CLI Subprocess Overhead**: Shelling out to `claude` and `gemini` CLIs
- **N x M Problem**: Each LLM requires specific integration code
- **Authentication Complexity**: Different auth mechanisms per provider
- **Maintenance Burden**: Provider-specific error handling and parsing

### 2. Fighting MCP Design
- **Against MCP Promise**: MCP exists to solve provider coupling
- **Subprocess Fragility**: External CLI dependencies break easily
- **Poor Error Handling**: CLI errors are opaque and hard to debug
- **Performance Overhead**: Multiple process spawns per generation

## Target Architecture

### Core Principle
**LLM-Agnostic Tool Provider**: The server provides structured context and handles file operations, letting the MCP client (any LLM) perform the creative generation naturally.

### New Flow
```
1. MCP Client (Claude/Gemini/OpenAI/etc) → Icon Generator MCP Server
2. Server processes inputs (PNG conversion, analysis, validation)
3. Server returns structured context to MCP Client
4. LLM generates SVG based on structured context
5. Server receives generated SVG and handles file operations
```

## Detailed Specification

### 1. Requirements Analysis

#### 1.1 Functional Requirements
- **FR-001**: Convert PNG references to SVG using Potrace
- **FR-002**: Provide structured context for icon generation
- **FR-003**: Handle file operations (validation, conflict resolution, saving)
- **FR-004**: Support style presets and custom parameters
- **FR-005**: Maintain processing metrics and error handling
- **FR-006**: Work with any MCP-compatible LLM client

#### 1.2 Non-Functional Requirements
- **NFR-001**: Zero external LLM CLI dependencies
- **NFR-002**: Sub-second response time for context preparation
- **NFR-003**: Backward compatibility with existing MCP tool schema
- **NFR-004**: Comprehensive error handling and logging
- **NFR-005**: Platform independence (remove macOS-only constraint)

#### 1.3 Constraints
- **C-001**: Must maintain MCP SDK compatibility
- **C-002**: Preserve existing file management capabilities
- **C-003**: Keep PNG-to-SVG conversion functionality
- **C-004**: Maintain test coverage above 80%

### 2. System Architecture

#### 2.1 High-Level Architecture
```
┌─────────────────────┐
│ Any MCP Client      │ (Claude, Gemini, OpenAI, etc.)
│ (LLM + MCP Runtime) │
└─────────┬───────────┘
          │ MCP Protocol
          ▼
┌─────────────────────┐
│ Icon Generator      │
│ MCP Server          │
│                     │
│ ┌─────────────────┐ │
│ │ Context Builder │ │ ← PNG conversion, analysis
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ File Manager    │ │ ← Save, validate, resolve conflicts
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ State Tracker   │ │ ← Progress, metrics, errors
│ └─────────────────┘ │
└─────────────────────┘
```

#### 2.2 Component Architecture

##### Core Components
1. **ContextBuilder** - Prepares structured generation context
2. **FileManager** - Handles all file operations
3. **StateTracker** - Manages processing state and metrics
4. **MCPServer** - Orchestrates components and handles MCP protocol

##### Removed Components
1. ~~**LLMFactory**~~ - No longer needed
2. ~~**ClaudeService**~~ - Provider-specific, removed
3. ~~**GeminiService**~~ - Provider-specific, removed
4. ~~**CLI Integration**~~ - No subprocess calls needed

#### 2.3 Data Flow

##### Input Processing Flow
```
1. MCP Tool Call → validate_inputs()
2. Convert PNG references → prepare_context()
3. Build structured context → return_to_llm()
4. LLM generates SVG → receive_generated_svg()
5. Save and validate → return_success()
```

##### Context Structure
```typescript
interface IconGenerationContext {
  // Input analysis
  prompt_analysis: {
    keywords: string[];
    style_indicators: string[];
    complexity_score: number;
  };
  
  // Reference processing
  reference_analysis?: {
    svg_references: string[];
    style_patterns: string[];
    color_palette: string[];
  };
  
  // Generation guidance
  generation_guidance: {
    recommended_approach: string;
    style_constraints: string[];
    technical_requirements: string[];
  };
  
  // Output requirements
  output_specification: {
    format: 'svg';
    viewBox: string;
    recommended_size: string;
    file_requirements: string[];
  };
}
```

### 3. Implementation Plan

#### 3.1 Phase 1: Core Refactoring (Week 1)
1. **Remove LLM Provider Infrastructure**
   - Delete `src/services/llm/` directory
   - Remove factory pattern and provider selection
   - Clean up constructor parameters

2. **Create ContextBuilder Service**
   - Implement `prepareGenerationContext()`
   - Move PNG analysis logic from LLM services
   - Add prompt analysis capabilities

3. **Update MCP Tool Schema**
   - Modify tool to return generation context
   - Remove provider selection parameter
   - Add context structure documentation

#### 3.2 Phase 2: Context Generation (Week 1)
1. **Implement Context Analysis**
   - PNG-to-SVG reference processing
   - Prompt keyword extraction
   - Style pattern recognition

2. **Build Generation Guidance**
   - Create style constraint mapping
   - Add technical requirement templates
   - Implement complexity scoring

3. **Update Response Format**
   - Structure context for LLM consumption
   - Add human-readable guidance
   - Include example patterns

#### 3.3 Phase 3: Integration & Testing (Week 1)
1. **Update Test Suite**
   - Remove LLM provider tests
   - Add context generation tests
   - Update integration tests

2. **Documentation Updates**
   - Revise README for LLM-agnostic approach
   - Update CLAUDE.md instructions
   - Create migration guide

3. **Platform Expansion**
   - Remove macOS-only constraint
   - Add Linux/Windows support
   - Update installation instructions

#### 3.4 Phase 4: Optimization & Release (Week 1)
1. **Performance Optimization**
   - Lazy-load heavy dependencies
   - Optimize PNG processing pipeline
   - Add context caching

2. **Error Handling Enhancement**
   - Remove CLI error complexity
   - Add structured error responses
   - Improve debugging information

3. **Release Preparation**
   - Version bump to 0.4.0
   - Update changelog
   - Prepare npm publication

### 4. Technical Specifications

#### 4.1 New MCP Tool Definition
```typescript
{
  name: 'generate_icon',
  description: 'Prepare context for AI-powered SVG icon generation',
  inputSchema: {
    type: 'object',
    properties: {
      reference_paths: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional PNG/SVG reference files'
      },
      prompt: {
        type: 'string',
        description: 'Icon description and requirements'
      },
      style: {
        type: 'string',
        description: 'Style preset (e.g., "minimalist", "detailed")'
      },
      output_name: {
        type: 'string',
        description: 'Custom filename'
      },
      output_path: {
        type: 'string',
        description: 'Custom output directory'
      }
    },
    required: ['prompt']
  }
}
```

#### 4.2 Response Format
```typescript
interface IconGenerationResponse {
  // Context for LLM
  generation_context: IconGenerationContext;
  
  // Processing metadata
  processing_info: {
    references_processed: number;
    analysis_time_ms: number;
    ready_for_generation: boolean;
  };
  
  // Instructions for LLM
  llm_instructions: {
    task: "Generate an SVG icon based on the provided context";
    format_requirements: string[];
    style_guidelines: string[];
    technical_constraints: string[];
  };
  
  // File handling info
  output_info: {
    suggested_filename: string;
    output_directory: string;
    conflict_resolution: 'append_number' | 'overwrite';
  };
}
```

#### 4.3 New Service Interfaces

##### ContextBuilder Service
```typescript
interface ContextBuilder {
  analyzePrompt(prompt: string): PromptAnalysis;
  processReferences(paths: string[]): ReferenceAnalysis;
  buildGenerationContext(prompt: string, references?: string[], style?: string): IconGenerationContext;
  createInstructions(context: IconGenerationContext): LLMInstructions;
}
```

##### FileManager Service (Enhanced)
```typescript
interface FileManager {
  validateInputs(paths: string[]): ValidationResult;
  convertPNGtoSVG(path: string): Promise<string>;
  prepareOutputLocation(name?: string, path?: string): OutputLocation;
  saveGeneratedSVG(svg: string, location: OutputLocation): Promise<SaveResult>;
  resolveConflicts(path: string): string;
}
```

### 5. Migration Strategy

#### 5.1 Breaking Changes
- **Remove LLM provider selection** - No more constructor parameter
- **Change response format** - Now returns context instead of final result
- **Remove CLI dependencies** - No more subprocess calls

#### 5.2 Backward Compatibility
- **Maintain MCP tool schema** - Same input parameters
- **Keep file operations** - All file handling remains the same
- **Preserve PNG conversion** - Potrace integration unchanged

#### 5.3 Migration Guide
1. **For MCP Clients**: No changes needed, same tool interface
2. **For Direct Users**: Update expectations about response format
3. **For Developers**: New service architecture, updated APIs

### 6. Testing Strategy

#### 6.1 Test Categories
1. **Unit Tests** - Service-level testing for each component
2. **Integration Tests** - End-to-end context generation
3. **Regression Tests** - Ensure file operations still work
4. **Performance Tests** - Context generation speed benchmarks

#### 6.2 Test Coverage Goals
- **Overall Coverage**: >85% (up from current 81%)
- **Critical Path Coverage**: 100% (context generation, file operations)
- **Error Handling Coverage**: >90%

#### 6.3 Test Infrastructure
```bash
# Core functionality (no LLM dependencies)
npm run test:core

# Context generation
npm run test:context

# File operations
npm run test:files

# Full integration (using mock contexts)
npm run test:integration

# Performance benchmarks
npm run test:performance
```

### 7. Risk Assessment

#### 7.1 Technical Risks
- **Risk**: Context quality insufficient for good generation
  - **Mitigation**: Extensive testing with various prompts and references
  - **Probability**: Medium | **Impact**: High

- **Risk**: Performance degradation during PNG processing
  - **Mitigation**: Optimize conversion pipeline, add caching
  - **Probability**: Low | **Impact**: Medium

#### 7.2 User Experience Risks
- **Risk**: LLMs generate poor quality SVGs without direct guidance
  - **Mitigation**: Rich context with examples and constraints
  - **Probability**: Medium | **Impact**: Medium

- **Risk**: Breaking changes confuse existing users
  - **Mitigation**: Clear migration guide and version communication
  - **Probability**: High | **Impact**: Low

#### 7.3 Operational Risks
- **Risk**: Loss of provider-specific optimizations
  - **Mitigation**: Generic approach may actually work better across providers
  - **Probability**: Low | **Impact**: Low

### 8. Success Metrics

#### 8.1 Technical Metrics
- **Context Generation Time**: < 500ms for typical requests
- **Memory Usage**: < 30MB during processing (down from 50MB)
- **Test Coverage**: > 85%
- **Build Time**: < 10 seconds

#### 8.2 User Experience Metrics
- **Icon Quality**: Subjective assessment with various LLMs
- **Error Rate**: < 5% for valid inputs
- **Setup Time**: Zero configuration required
- **Cross-Platform**: Works on macOS, Linux, Windows

#### 8.3 Ecosystem Metrics
- **LLM Compatibility**: Works with Claude, Gemini, GPT, local LLMs
- **Deployment Flexibility**: npm, docker, direct installation
- **Community Adoption**: GitHub stars, npm downloads

### 9. Documentation Plan

#### 9.1 Technical Documentation
- **API Reference**: Complete MCP tool specification
- **Architecture Guide**: New component structure
- **Migration Guide**: How to upgrade from 0.3.x
- **Developer Guide**: Contributing and extending

#### 9.2 User Documentation
- **Quick Start**: Zero-config installation and usage
- **Examples**: Common use cases and patterns
- **Troubleshooting**: Common issues and solutions
- **FAQ**: Addressing migration questions

#### 9.3 Specification Documents
- **MCP Tool Spec**: Formal tool definition
- **Context Schema**: Generation context structure
- **File Format Spec**: Supported input/output formats
- **Style Guide**: Coding standards and conventions

### 10. Timeline & Milestones

#### Week 1: Core Refactoring
- **Day 1-2**: Remove LLM provider infrastructure
- **Day 3-4**: Implement ContextBuilder service
- **Day 5-7**: Update MCP tool schema and responses

#### Week 2: Context Generation
- **Day 1-3**: Implement context analysis features
- **Day 4-5**: Build generation guidance system
- **Day 6-7**: Update response format and testing

#### Week 3: Integration & Testing
- **Day 1-3**: Comprehensive test suite updates
- **Day 4-5**: Documentation and migration guide
- **Day 6-7**: Platform expansion and compatibility

#### Week 4: Optimization & Release
- **Day 1-3**: Performance optimization and caching
- **Day 4-5**: Error handling enhancement
- **Day 6-7**: Release preparation and npm publication

### 11. Acceptance Criteria

#### 11.1 Functional Acceptance
- ✅ Server responds with structured generation context
- ✅ PNG conversion works without external LLM calls
- ✅ File operations maintain existing functionality
- ✅ Works with any MCP-compatible LLM client
- ✅ All existing use cases supported

#### 11.2 Technical Acceptance
- ✅ Zero CLI subprocess dependencies
- ✅ Response time under 500ms for typical requests
- ✅ Memory usage reduced by 40%
- ✅ Test coverage above 85%
- ✅ Cross-platform compatibility

#### 11.3 User Experience Acceptance
- ✅ No breaking changes to MCP tool interface
- ✅ Clear upgrade path from 0.3.x
- ✅ Works out-of-box with popular LLM clients
- ✅ Error messages are clear and actionable
- ✅ Documentation is complete and helpful

---

## Appendices

### Appendix A: Current vs Target Architecture Comparison
| Aspect | Current (0.3.1) | Target (0.4.0) |
|--------|-----------------|----------------|
| LLM Integration | CLI subprocess | MCP native |
| Provider Support | Claude + Gemini | Any MCP client |
| Dependencies | CLI tools required | Zero external LLMs |
| Response Time | 3-15 seconds | <500ms |
| Error Complexity | CLI parsing | Structured errors |
| Platform Support | macOS only | Cross-platform |

### Appendix B: Context Generation Examples
```typescript
// Input: Simple prompt
{
  prompt: "Create a folder icon",
  references: []
}

// Output: Rich context
{
  generation_context: {
    prompt_analysis: {
      keywords: ["folder", "directory", "storage"],
      style_indicators: ["simple", "recognizable"],
      complexity_score: 2
    },
    generation_guidance: {
      recommended_approach: "Use classic folder metaphor with clean lines",
      style_constraints: ["Maintain universal recognition", "Avoid excessive detail"],
      technical_requirements: ["24x24 minimum visibility", "Single color friendly"]
    }
  }
}
```

### Appendix C: File Structure Changes
```
src/
├── server.ts                 (simplified)
├── services/
│   ├── context-builder.ts    (new)
│   ├── file-manager.ts       (enhanced)
│   ├── state-tracker.ts      (simplified)
│   └── converter.ts          (unchanged)
├── types.ts                  (updated schemas)
└── utils/                    (new utilities)

Removed:
├── services/llm/             (entire directory)
└── bin/cli.ts                (already removed)
```

---

**Status**: Ready for implementation approval  
**Next Step**: Begin Phase 1 implementation upon approval