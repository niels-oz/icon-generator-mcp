/**
 * Service for detecting multimodal LLM capabilities
 * This is crucial for determining if PNG visual references can be processed
 */
export class MultimodalDetector {
  
  /**
   * Detect if the current MCP client supports multimodal (visual) inputs
   * This is crucial for PNG reference handling
   */
  isMultimodalLLMAvailable(): boolean {
    try {
      // Check environment variables and process info for LLM indicators
      const indicators = this.getMultimodalIndicators();
      
      // Check for multimodal capability indicators
      const multimodalKeywords = [
        'vision', 'multimodal', 'image', 'visual',
        'claude-3', 'claude-sonnet', 'claude-opus',
        'gpt-4v', 'gpt-4-vision', 'gpt-4-turbo',
        'gemini-pro-vision', 'gemini-1.5'
      ];
      
      return multimodalKeywords.some(keyword => 
        indicators.some(indicator => 
          indicator.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    } catch (error) {
      // If detection fails, assume non-multimodal for safety
      return false;
    }
  }
  
  /**
   * Get helpful error message for non-multimodal scenarios
   */
  getMultimodalRequiredError(): string {
    return [
      'PNG references require a multimodal LLM for visual processing.',
      '',
      'Compatible LLMs:',
      '  • Claude Code (claude-3-sonnet, claude-3-opus)',
      '  • Gemini Pro Vision (gemini-1.5-pro)',
      '  • GPT-4 Vision (gpt-4v, gpt-4-turbo)',
      '  • Other vision-capable models',
      '',
      'You can still use this tool by:',
      '1. Using SVG reference files instead of PNG',
      '2. Using prompt-only generation (no reference files)',
      '3. Converting PNG to SVG with online tools first',
      '4. Upgrading to a multimodal LLM for the best experience',
      '',
      'Learn more: https://docs.anthropic.com/claude-code/multimodal'
    ].join('\n');
  }
  
  /**
   * Get multimodal indicators from environment and process
   * This attempts to detect what LLM is being used
   */
  private getMultimodalIndicators(): string[] {
    const indicators: string[] = [];
    
    // Check environment variables
    const envVars = [
      'ANTHROPIC_MODEL', 'CLAUDE_MODEL', 'OPENAI_MODEL', 
      'GOOGLE_MODEL', 'GEMINI_MODEL', 'LLM_MODEL',
      'MCP_CLIENT', 'AI_MODEL', 'MODEL_NAME'
    ];
    
    envVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        indicators.push(value);
      }
    });
    
    // Check process arguments
    if (process.argv) {
      indicators.push(...process.argv);
    }
    
    // Check process title and other process info
    if (process.title) {
      indicators.push(process.title);
    }
    
    // Add some reasonable defaults for common scenarios
    // This helps with detection in typical MCP environments
    if (process.env.NODE_ENV === 'development') {
      // In development, assume multimodal for testing
      indicators.push('claude-3-sonnet');
    }
    
    return indicators.filter(Boolean);
  }
  
  /**
   * Check if the current environment suggests a specific LLM type
   */
  detectLLMType(): string | null {
    const indicators = this.getMultimodalIndicators();
    const combined = indicators.join(' ').toLowerCase();
    
    if (combined.includes('claude')) {
      return 'claude';
    } else if (combined.includes('gemini')) {
      return 'gemini';
    } else if (combined.includes('gpt') || combined.includes('openai')) {
      return 'openai';
    }
    
    return null;
  }
}