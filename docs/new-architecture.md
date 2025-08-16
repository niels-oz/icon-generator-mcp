# New Architecture: Real LLM Integration

## Problem Identified
The current implementation (v0.4.4) is using **placeholder/simulation code** instead of real AI generation:

```typescript
// WRONG: This is simulation, not real AI
private simulateAIGeneration(expertPrompt: string): { svg: string } {
    // Hardcoded responses based on keywords
    if (userRequest.includes('dog')) {
        return { svg: `<hardcoded dog SVG>` };
    }
    // More hardcoded responses...
}
```

## Required Architecture Changes

### 1. Real LLM Service Integration
Replace the simulation with actual LLM calls:

```typescript
// src/services/llm/llm-service.ts
export interface LLMService {
  generateSVG(prompt: string, context: GenerationContext): Promise<LLMResponse>;
}

// src/services/llm/mcp-llm-service.ts  
export class MCPLLMService implements LLMService {
  async generateSVG(prompt: string, context: GenerationContext): Promise<LLMResponse> {
    // Real MCP LLM call - no simulation
    return await this.mcpClient.callLLM(prompt);
  }
}
```

### 2. Updated Server Integration
The server should use the real LLM service:

```typescript
// src/server.ts
export class MCPServer {
  private llmService: LLMService;
  
  constructor(llmService?: LLMService) {
    this.llmService = llmService || new MCPLLMService();
  }
  
  private async executeGenerationPhase(sessionId: string): Promise<void> {
    // Use REAL LLM service, not simulation
    const llmResponse = await this.llmService.generateSVG(
      context.prompt, 
      context
    );
  }
}
```

### 3. Context Builder Enhancement
The context builder is good but needs real LLM integration:

```typescript
// src/context-builder.ts - KEEP THIS
export function buildGenerationContext(
  userPrompt: string, 
  svgReferences: string[] = [], 
  styleName?: string
): GenerationContext {
  // This is good - expert prompt engineering
  // Just needs to be used with REAL LLM calls
}
```

### 4. LLM Abstraction Layer
```typescript
// src/services/llm/types.ts - EXPAND THIS
export interface LLM {
  generate(prompt: string, svgReferences?: string[], styleName?: string): Promise<LLMResponse>;
  isMultimodalCapable(): boolean;
  processVisualReferences(paths: string[]): Promise<VisualContext>;
}
```

## Current State Analysis

### What's Working ✅
- **5-Phase Pipeline**: Validation → Analysis → Generation → Refinement → Output
- **Context Builder**: Expert prompt engineering with few-shot examples
- **File Management**: Smart naming, conflict resolution
- **State Management**: Progress tracking, error handling
- **Multimodal Detection**: PNG vs SVG reference handling

### What's Broken ❌
- **Generation Phase**: Using hardcoded simulation instead of real AI
- **LLM Integration**: No actual LLM service calls
- **Context Usage**: Expert prompts generated but not used for real generation

## Migration Path

1. **Revert to Last Working Version**: Before simulation was introduced
2. **Implement Real LLM Service**: Replace simulation with actual calls
3. **Integrate Context Builder**: Use expert prompts with real LLM
4. **Add LLM Abstraction**: Support multiple LLM providers
5. **Test Real Generation**: Ensure actual AI-powered SVG creation

## Architecture Goals

- **No Placeholders**: Every component must do real work
- **Real AI Generation**: Actual LLM calls, not keyword matching
- **Expert Prompting**: Use the sophisticated context builder
- **Visual Context**: Real PNG multimodal support
- **Style Consistency**: Few-shot learning with real examples

## Files to Fix

1. `src/server.ts:418-480` - Remove `simulateAIGeneration` entirely
2. `src/services/llm/` - Implement real LLM service
3. Integration between context builder and real LLM calls
4. Tests to validate real generation (not simulation)

The current architecture has all the right pieces but is using fake generation. The fix is to connect the expert prompt engineering to real LLM calls.