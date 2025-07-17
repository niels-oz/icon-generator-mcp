# Web Image Search Integration Plan

## Current Problem
The Icon Generator MCP Server currently has reliability issues with prompt-only generation (50% failure rate with Claude CLI). We need to enhance it with web image search capabilities to provide better reference images for more reliable SVG generation.

## Proposed Solution
Add web image search functionality where Claude Code provides search keywords, and our MCP automatically finds and downloads relevant reference images.

## Architecture Overview

### Current Flow
```
User Prompt → MCP Server → PNG Conversion (if provided) → LLM Service → File Writer → SVG File
```

### Enhanced Flow
```
User Prompt + Search Keyword → MCP Server → Web Image Search → Download PNGs → PNG Conversion → LLM Service → File Writer → SVG File
```

## Implementation Plan

### Phase 1: Enhanced MCP Tool Schema
Update the MCP tool to accept web search parameters:

```typescript
{
  name: 'generate_icon',
  inputSchema: {
    properties: {
      png_paths?: string[]      // Existing: Manual PNG references
      prompt: string           // Existing: Generation prompt
      search_keyword?: string  // NEW: Keyword for web search
      auto_search?: boolean    // NEW: Enable automatic web search
      output_name?: string     // Existing: Custom filename
      output_path?: string     // Existing: Custom output directory
    }
  }
}
```

### Phase 2: Web Image Search Service
Create a new service to handle web image search:

```typescript
export class WebImageSearchService {
  async searchSimpleIcons(keyword: string): Promise<string[]> {
    // Search for simple, SVG-friendly icons
    // Filter for clean, vector-style images
    // Download top 3 results as PNG files
    // Return local file paths
  }
}
```

**Search Strategy:**
- Query: `"icon ${keyword} svg flat outline -photo -3d -gradient"`
- Use Google Custom Search API (100 free searches/day)
- Filter for simple, clean icons suitable for SVG conversion
- Download top 3 results automatically

### Phase 3: Integration with Existing Flow
Enhance the existing `generateIcon` method:

```typescript
private async generateIcon(request: IconGenerationRequest) {
  let pngPaths = request.png_paths || [];
  
  // NEW: Web search for additional references
  if (request.auto_search && request.search_keyword) {
    const searchedPngs = await this.webSearchService.searchSimpleIcons(request.search_keyword);
    pngPaths = [...pngPaths, ...searchedPngs];
  }
  
  // Existing flow continues...
  const svgReferences = await this.convertPNGsToSVG(pngPaths);
  const llmResponse = await this.llmService.generateSVG(request.prompt, svgReferences);
  // ... rest of existing logic
}
```

## Technical Implementation Details

### 1. Web Search Service
- **API**: Google Custom Search JSON API
- **Query Format**: `"icon ${keyword} svg flat outline -photo -3d -gradient"`
- **Filtering**: Prefer vector graphics, avoid photos/renders
- **Limit**: 3 results per search for MVP

### 2. Image Download & Processing
- **Download**: Fetch images to temporary directory
- **Format**: Convert to PNG if needed
- **Cleanup**: Remove temporary files after processing
- **Error Handling**: Graceful fallback if search fails

### 3. Updated Types
```typescript
export interface IconGenerationRequest {
  png_paths: string[];
  prompt: string;
  search_keyword?: string;  // NEW
  auto_search?: boolean;    // NEW
  output_name?: string;
  output_path?: string;
}
```

## Benefits

### For Users
- **Better Results**: Automatic reference images improve generation quality
- **Simplified Workflow**: No need to manually find and upload reference images
- **Higher Success Rate**: More context leads to better SVG generation

### For Developers
- **Reduced Complexity**: Claude Code provides optimized search keywords
- **Fallback Strategy**: Manual PNG uploads still work as backup
- **Gradual Enhancement**: Existing functionality remains unchanged

## Testing Strategy

### Unit Tests
- WebImageSearchService functionality
- Search query building
- Image download and processing
- Error handling scenarios

### Integration Tests
- End-to-end workflow with web search
- Fallback to manual PNG uploads
- Error scenarios (API failures, network issues)

### Manual Testing
```bash
# Test automatic search
node example/test-web-search.js

# Test combined manual + automatic
node example/test-hybrid-references.js
```

## Implementation Steps

1. **Update Types**: Add `search_keyword` and `auto_search` to interfaces
2. **Create WebImageSearchService**: Implement Google Custom Search integration
3. **Update MCPServer**: Integrate web search into existing flow
4. **Add Tests**: Comprehensive test coverage for new functionality
5. **Update Documentation**: Reflect new capabilities in CLAUDE.md

## Success Criteria
- ✅ Claude Code can provide search keywords automatically
- ✅ Web search finds relevant, simple icons for SVG conversion
- ✅ Success rate improves from 50% to 80%+ on complex prompts
- ✅ Existing manual PNG upload workflow remains functional
- ✅ Comprehensive test coverage for new features

## Future Enhancements
- Multiple search providers (Icons8, Iconify)
- Advanced filtering algorithms
- User preference learning
- Batch processing for multiple icons