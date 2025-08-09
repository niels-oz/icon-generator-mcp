# Version 3.2: Remove Potrace PNG Conversion

## Overview
Remove Potrace PNG-to-SVG conversion functionality to simplify the MCP server, eliminate system dependencies, and focus on SVG-first workflows.

## Motivation

### Problems with Current PNG Conversion
- **System Dependencies**: Requires `brew install potrace` (macOS-specific)
- **Cross-Platform Issues**: Complex installation on Windows/Linux
- **Distribution Friction**: Blocks simple `npm install -g` workflows
- **Quality Issues**: PNG→SVG tracing produces suboptimal results
- **Maintenance Burden**: Additional error handling and preprocessing complexity

### Benefits of Removal
- **Simplified Installation**: Zero system dependencies
- **Better UX**: Focus on high-quality SVG generation
- **Easier Maintenance**: Remove ConversionService complexity
- **Modern Workflow**: Aligns with SVG-first design practices
- **Global Distribution**: Seamless npm package installation

## Technical Changes

### 1. Core Architecture Changes

#### Remove Files
```bash
# Delete conversion service
rm src/services/converter.ts

# Remove conversion tests
rm test/services/converter.test.ts
```

#### Update Dependencies
```json
// package.json - Remove these dependencies
"potrace": "^1.2.5",
"jimp": "^0.22.8"
```

#### Update server.ts
- Remove ConversionService import and initialization
- Remove PNG conversion phase from pipeline
- Update phase definitions to skip conversion step
- Simplify file validation to SVG-only for references

### 2. API Schema Changes

#### MCP Tool Schema Update
```typescript
// Current schema allows PNG files
reference_paths?: string[]  // PNG/SVG reference files

// New schema - SVG only
reference_paths?: string[]  // SVG reference files only
```

#### Input Validation Changes
- Update `validateRequest()` to reject PNG files with helpful error
- Add clear error message suggesting SVG alternatives
- Keep validation for file existence and SVG format

### 3. Phase Pipeline Simplification

#### Current Pipeline (6 phases)
1. Validation - Input validation and file checking
2. Analysis - Prompt and reference analysis  
3. **Conversion** - PNG→SVG conversion ← REMOVE THIS
4. Generation - AI-powered SVG creation
5. Refinement - Quality enhancement
6. Output - File writing

#### New Pipeline (5 phases)
1. Validation - Input validation and SVG file checking
2. Analysis - Prompt and reference analysis
3. Generation - AI-powered SVG creation  
4. Refinement - Quality enhancement
5. Output - File writing

### 4. Error Handling Updates

#### New Error Messages
```typescript
// When PNG files are provided
"PNG files are no longer supported. Please use SVG reference files or prompt-only generation."

// Helpful suggestion
"Consider converting PNG to SVG using online tools like trace.moe or vectorizer.ai"
```

## File Changes Checklist

### Source Code
- [ ] `src/server.ts` - Remove ConversionService integration
- [ ] `src/services/converter.ts` - DELETE FILE
- [ ] `src/types.ts` - Update phase definitions
- [ ] `src/services/state-manager.ts` - Update phase tracking
- [ ] `src/services/visual-formatter.ts` - Remove conversion phase display

### Tests
- [ ] `test/services/converter.test.ts` - DELETE FILE
- [ ] `test/core.test.ts` - Remove PNG conversion tests
- [ ] `test/integration/end-to-end.test.ts` - Update test cases
- [ ] All regression tests - Remove PNG reference examples

### Configuration
- [ ] `package.json` - Remove potrace and jimp dependencies
- [ ] `package.json` - Update version to 3.2.0
- [ ] `jest.config.js` - Remove converter test patterns

### Documentation
- [ ] `README.md` - Remove Potrace installation instructions
- [ ] `CLAUDE.md` - Update tech stack and dependencies
- [ ] `CLAUDE.md` - Update architecture documentation
- [ ] `CLAUDE.md` - Remove PNG conversion examples
- [ ] Create `docs/MIGRATION_3.2.md` - Migration guide

### Examples and Demos
- [ ] `example/demos/test-conversion.js` - DELETE FILE
- [ ] All demo scripts - Remove PNG reference examples
- [ ] Update all demo scripts to use SVG-only workflows

## Documentation Updates

### README.md Changes
```diff
## Prerequisites
- Node.js v18+
- - System dependencies: `brew install potrace` (macOS)

## Installation
```bash
# Global installation
npm install -g icon-generator-mcp

# - Verify system dependencies
# - potrace --version
icon-generator-mcp --version
```

### CLAUDE.md Updates
```diff
## Tech Stack
- **Language**: TypeScript with strict mode (ES2020 target)
- **Platform**: macOS (Intel and Apple Silicon)  
- **Runtime**: Node.js v18+
- **Testing**: Jest with ts-jest (XX tests, XX test suites)
- - **Dependencies**: MCP SDK v0.4.0, Potrace, Jimp, chalk, node-fetch
+ **Dependencies**: MCP SDK v0.4.0, chalk, node-fetch
- **Architecture**: MCP Server with multi-LLM support (Claude + Gemini)

## Prerequisites
```bash
# - Required system dependencies
# - brew install potrace

# Global installation (preferred)
npm install -g icon-generator-mcp

# Verify installations
- potrace --version
icon-generator-mcp --version
```

### Core Components
- **MCPServer** (`src/server.ts`) - Main orchestrator with phase-based generation pipeline
- - **ConversionService** (`src/services/converter.ts`) - PNG→SVG conversion using Potrace + Jimp preprocessing
- **LLM Services** (`src/services/llm/`) - Multi-provider architecture (Claude + Gemini)
```

### MCP Tool Schema Documentation
```diff
generate_icon: {
- reference_paths?: string[]     // Optional: PNG/SVG reference files
+ reference_paths?: string[]     // Optional: SVG reference files only
  prompt: string           // Required: Generation prompt
  style?: string           // Optional: Style preset (e.g., "black-white-flat")
  output_name?: string     // Optional: Custom filename
  output_path?: string     // Optional: Custom output directory
  llm_provider?: 'claude' | 'gemini'  // Optional: LLM provider selection
}
```

## Testing Strategy

### Test Updates Required
- [ ] Remove all PNG conversion test cases
- [ ] Update fixtures to remove PNG files
- [ ] Add tests for PNG rejection with helpful errors
- [ ] Update integration tests to SVG-only workflows
- [ ] Verify all regression tests work with SVG references only

### New Test Cases
```typescript
// Test PNG rejection
it('should reject PNG files with helpful error message', async () => {
  const request = {
    reference_paths: ['test/fixtures/sample.png'],
    prompt: 'Create an icon'
  };
  
  const response = await server.handleToolCall('generate_icon', request);
  
  expect(response.success).toBe(false);
  expect(response.error).toContain('PNG files are no longer supported');
  expect(response.error).toContain('Please use SVG reference files');
});
```

### Test Count Adjustment
- Current: ~32 tests
- After removal: ~28 tests (remove 4 PNG conversion tests)
- Runtime improvement: ~5-10 seconds faster

## Migration Guide (docs/MIGRATION_3.2.md)

### For Existing Users
1. **If using PNG references**: Convert to SVG using online tools
2. **If using prompt-only**: No changes required
3. **Update installation**: Re-run `npm install -g icon-generator-mcp`

### Recommended PNG→SVG Tools
- **Online**: trace.moe, vectorizer.ai, convertio.co
- **Desktop**: Adobe Illustrator, Inkscape
- **CLI**: svg-converter (pure JS alternative)

### Breaking Changes
- PNG files in `reference_paths` will return error
- No system dependency requirements
- Simplified installation process

## Implementation Steps

### Phase 1: Code Changes
1. Remove ConversionService and related files
2. Update server.ts pipeline
3. Update validation logic
4. Add helpful error messages

### Phase 2: Test Updates
1. Remove PNG-related tests
2. Add PNG rejection tests  
3. Update all demo scripts
4. Verify test suite passes

### Phase 3: Documentation
1. Update README.md installation
2. Update CLAUDE.md architecture
3. Create migration guide
4. Update all examples

### Phase 4: Release
1. Update package.json to 3.2.0
2. Test global installation
3. Verify zero system dependencies
4. Publish to npm

## Success Criteria
- [ ] Zero system dependencies required
- [ ] Clean `npm install -g icon-generator-mcp` installation  
- [ ] All tests pass (reduced from 32 to ~28 tests)
- [ ] Clear error messages for PNG attempts
- [ ] Complete documentation updates
- [ ] Successful npm package publication

## Rollback Plan
If issues arise:
1. Revert to version 3.1.x
2. Re-add ConversionService with feature flag
3. Gradual deprecation approach instead of immediate removal

## Timeline Estimate
- **Code Changes**: 2-3 hours
- **Test Updates**: 1-2 hours  
- **Documentation**: 1-2 hours
- **Testing & QA**: 1 hour
- **Total**: 5-8 hours

This removal will significantly simplify the architecture while maintaining the core value proposition of AI-powered SVG generation.