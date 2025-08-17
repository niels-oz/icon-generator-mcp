# PLAN: Naming Improvements for v0.5.x

## Overview
Implement better tool naming and workflow guidance. Keep the two-tool architecture but make the tool calls clear and intuitive.

## Current State (Problematic)
```typescript
Tools:
- prepare_icon_context  // Unclear: What does this do?
- save_icon            // Unclear: When do I use this?

Response format:
{
  type: 'generation_context',
  expert_prompt: '...',
  metadata: { suggested_filename: '...' }
  // No guidance on what to do next
}
```

## Target State (Clear & Intuitive)
```typescript
Tools:
- create_icon_prompt   // Clear: Creates a prompt for generation
- save_generated_icon  // Clear: Saves what was generated

Response format with workflow guidance:
{
  type: 'prompt_created',
  expert_prompt: '...',
  suggested_filename: 'cat-pillow',
  next_action: {
    description: 'Generate SVG with this prompt, then call save_generated_icon',
    tool_name: 'save_generated_icon',
    required_params: ['svg', 'filename'],
    workflow_step: '2 of 2'
  }
}
```

## Implementation Plan

### Phase 1: Tool Renaming
1. **Rename MCP Tools**
   - `prepare_icon_context` → `create_icon_prompt`
   - `save_icon` → `save_generated_icon`

2. **Update Tool Descriptions**
   ```typescript
   {
     name: 'create_icon_prompt',
     description: 'Creates an expert prompt for AI icon generation. Call this first to get generation instructions.',
     // ...
   },
   {
     name: 'save_generated_icon', 
     description: 'Saves a generated SVG icon to file. Call this after generating SVG with the prompt.',
     // ...
   }
   ```

3. **Backward Compatibility**
   - Rename fully. No aliases.

### Phase 2: Workflow Guidance
1. **Add `next_action` to Responses**
   ```typescript
   // In create_icon_prompt response:
   {
     type: 'prompt_created',
     expert_prompt: buildExpertPrompt(request),
     suggested_filename: generateFilename(request),
     next_action: {
       description: 'Generate SVG with this prompt, then call save_generated_icon',
       tool_name: 'save_generated_icon',
       required_params: ['svg', 'filename'],
       workflow_step: '2 of 2',
       example_usage: {
         svg: '<svg xmlns="http://www.w3.org/2000/svg">...</svg>',
         filename: 'cat-pillow'
       }
     }
   }
   ```

2. **Update Response Types**
   ```typescript
   // Current unclear types:
   type: 'generation_context'
   
   // New clear types:
   type: 'prompt_created'      // From create_icon_prompt
   type: 'icon_saved'          // From save_generated_icon
   type: 'validation_failed'   // When SVG validation fails
   ```

### Phase 3: Enhanced Tool Descriptions
1. **Clear Tool Documentation**
   ```typescript
   {
     name: 'create_icon_prompt',
     description: `Creates an expert prompt for AI icon generation.
     
     WORKFLOW: This is step 1 of 2
     1. Call this tool with your icon request
     2. Use the returned expert_prompt to generate SVG
     3. Call save_generated_icon with the generated SVG
     
     Example: create_icon_prompt({prompt: "cat on pillow", style: "flat"})`,
     inputSchema: {
       // ... existing schema
     }
   }
   ```

2. **Workflow Examples in Schema**
   - Add usage examples directly in tool schemas
   - Include common error scenarios
   - Show complete workflow examples

### Phase 4: Testing Updates
1. **Update All Tests**
   - Replace old tool names in all test files
   - Update response format expectations
   - Add tests for `next_action` guidance

2. **Integration Tests**
   - Test complete workflow with new names
   - Verify backward compatibility during transition
   - Test error scenarios with new response types

## File Changes Required

### Core Implementation
- `src/server.ts` - Tool registration and naming
- `src/context-builder.ts` - Response format with next_action
- `src/services/file-writer.ts` - Updated response types

### Testing
- `test/core.test.ts` - Tool name and response updates
- `test/integration/end-to-end.test.ts` - Workflow tests
- `test/filename-generation.test.ts` - Tool name updates
- All regression tests - Tool name updates

### Documentation  
- `README.md` - Updated workflow examples
- `CLAUDE.md` - Tool usage documentation
- `CHANGELOG.md` - Document breaking changes

## Benefits

### User Experience
- **Intuitive naming** - Tools clearly describe their purpose
- **Guided workflow** - Response includes exact next steps
- **Self-documenting** - No need to guess the workflow
- **Error prevention** - Clear parameter requirements

### Developer Experience  
- **Easier testing** - Clear tool boundaries and expectations
- **Better debugging** - Response types indicate exact state
- **Maintainable** - Single responsibility principle maintained
- **Documentation** - Built-in workflow guidance

### Operational Benefits
- **Reduced support** - Self-explanatory tool usage
- **Better adoption** - Lower learning curve
- **Fewer errors** - Clear workflow prevents mistakes

## Migration Strategy

### Version 0.5.1 (Transition)
- Add new tool names alongside old ones
- Old names show deprecation warnings
- All responses include `next_action` guidance
- Update documentation to use new names

### Version 0.5.2 (Stabilization)
- Increase deprecation warning visibility
- All examples use new tool names
- Test suite primarily uses new names

### Version 0.6.0 (Breaking Change)
- Remove old tool names completely
- Update major version for breaking change
- Complete migration to new architecture

## Success Metrics

### Technical Metrics
- All tests pass with new tool names
- Response format includes `next_action` in 100% of cases
- Zero breaking changes for users using new names

### User Experience Metrics
- Reduced confusion in tool selection
- Clear workflow understanding from response guidance
- Improved error messages and troubleshooting

## Risk Mitigation

### Backward Compatibility
- Maintain old tool names during transition period
- Clear migration timeline and documentation
- Automated warnings for deprecated usage

### Testing Coverage
- Comprehensive test updates for new tool names
- Integration tests for complete workflows
- Regression tests for backward compatibility

### Documentation
- Updated examples throughout codebase
- Clear migration guide for users
- Tool description improvements

## Timeline

- **Week 1**: Core implementation (tool renaming, next_action)
- **Week 2**: Testing updates and validation
- **Week 3**: Documentation and examples update
- **Week 4**: Release v0.5.1 with transition support

This plan addresses the root cause identified in the post-mortem: unclear tool naming and workflow guidance, while maintaining the architectural benefits of the two-tool approach.