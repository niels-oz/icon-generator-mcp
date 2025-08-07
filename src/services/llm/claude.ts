import { execSync } from 'child_process';
import { LLMResponse } from '../../types';
import { LLM } from './types';
import { StyleConfig, getStyleConfig } from '../../styles/few-shot-examples';

export interface LLMConfig {
  timeout: number;
  maxPromptLength: number;
  cliCommand: string;
}

export class ClaudeService implements LLM {
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    this.config = {
      timeout: 60000, // 60 seconds
      maxPromptLength: 8192,
      cliCommand: 'claude',
      ...config
    };
  }

  /**
   * Find Claude CLI binary in system PATH
   */
  findClaudeBinary(): string {
    try {
      const claudePath = execSync('which claude', { 
        encoding: 'utf8',
        timeout: 5000 
      }).trim();
      return claudePath;
    } catch (error) {
      throw new Error('Claude Code CLI not found in PATH. Please install Claude Code CLI first.');
    }
  }

  /**
   * Validate prompt for security and length
   */
  validatePrompt(prompt: string): void {
    // Check for empty prompt
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    // Check prompt length
    if (prompt.length > this.config.maxPromptLength) {
      throw new Error(`Prompt too long (${prompt.length} characters, max ${this.config.maxPromptLength})`);
    }

    // Check for malicious content
    const maliciousPatterns = [
      /[;&|`$]/,           // Command injection characters
      /\$\(/,              // Command substitution
      /`.*`/,              // Backtick execution
      /\|\s*\w+/,          // Pipe to commands
      /&&\s*\w+/,          // Command chaining
      /;\s*\w+/            // Command separation
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(prompt)) {
        throw new Error('Invalid characters in prompt');
      }
    }
  }

  /**
   * Sanitize SVG content to remove dangerous elements
   */
  sanitizeSVG(svg: string): string {
    // Remove markdown code fences if present
    svg = svg.replace(/^```\w*\n?/m, '').replace(/\n?```$/m, '');
    
    // Remove script tags and their content
    svg = svg.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove foreignObject elements and their content
    svg = svg.replace(/<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/gi, '');
    
    // Remove event handlers (onclick, onload, etc.)
    svg = svg.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove javascript: URLs
    svg = svg.replace(/javascript:[^"']*/gi, '');
    
    return svg;
  }

  /**
   * Build system prompt for Claude CLI with optional few-shot learning
   */
  buildSystemPrompt(userPrompt: string, svgReferences: string[], styleConfig?: StyleConfig): string {
    let systemPrompt = `You are an expert SVG icon designer. Given SVG references and a user request, generate a clean, optimized SVG icon.`;

    // Add few-shot examples if style config is provided
    if (styleConfig) {
      systemPrompt += `\n\nSTYLE: ${styleConfig.name}
${styleConfig.description}

Here are examples of this style:

${styleConfig.examples.map((example: any, index: number) => `Example ${index + 1}:
Prompt: "${example.prompt}"
Description: ${example.description}
SVG:
${example.svg}
`).join('\n')}

Follow the exact same style, structure, and visual approach as these examples.`;
    }

    // Add reference SVGs if provided
    if (svgReferences.length > 0) {
      systemPrompt += `\n\nReference SVG icons:
${svgReferences.map((svg, index) => `Reference ${index + 1}:
${svg}
`).join('\n')}`;
    }

    systemPrompt += `\n\nUser request: ${userPrompt}

Please generate:
1. A clean SVG icon that fulfills the request
2. A descriptive filename (no extension)

Format your response exactly as:
FILENAME: [suggested-filename]
SVG: [complete SVG code]

Requirements:
- Use proper SVG namespace: xmlns="http://www.w3.org/2000/svg"
- Include viewBox attribute for scalability
- Use clean, optimized SVG code
- No script tags or dangerous elements
- Filename should be descriptive and kebab-case${styleConfig ? `
- CRITICALLY IMPORTANT: Follow the exact style, stroke-width, color scheme, and visual approach from the provided examples` : ''}`;

    return systemPrompt;
  }

  /**
   * Parse Claude CLI response to extract SVG and filename
   */
  parseResponse(response: string): LLMResponse {
    // Look for FILENAME: and SVG: markers
    const filenameMatch = response.match(/FILENAME:\s*(.+?)(?:\n|$)/i);
    const svgMatch = response.match(/SVG:\s*([\s\S]*?)(?:\n\nFILENAME:|$)/i);

    if (!svgMatch || !svgMatch[1]) {
      throw new Error('Invalid response format from Claude CLI - SVG content not found');
    }

    let svg = svgMatch[1].trim();
    let filename = filenameMatch ? filenameMatch[1].trim() : 'generated-icon';

    // Sanitize SVG content
    svg = this.sanitizeSVG(svg);

    // Clean up filename
    filename = filename.replace(/\.svg$/i, ''); // Remove .svg extension if present
    filename = filename.replace(/[^a-zA-Z0-9-_.]/g, '-'); // Replace invalid chars with dash

    return {
      svg,
      filename
    };
  }

  /**
   * Generate SVG icon using Claude CLI with optional style guidance
   */
  async generate(prompt: string, svgReferences: string[] = [], styleName?: string): Promise<LLMResponse> {
    // Validate input
    this.validatePrompt(prompt);

    // Check if Claude CLI is available
    this.findClaudeBinary();

    // Get style config if specified
    const styleConfig = styleName ? getStyleConfig(styleName) : undefined;

    // Build system prompt with few-shot learning if style is specified
    const systemPrompt = this.buildSystemPrompt(prompt, svgReferences, styleConfig);

    try {
      // Execute Claude CLI with the prompt - improved error handling and timeout management
      const response = execSync('claude', {
        input: systemPrompt,
        encoding: 'utf8',
        timeout: this.config.timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        stdio: ['pipe', 'pipe', 'pipe'], // Explicit stdio configuration
        windowsHide: true // Hide window on Windows (future compatibility)
      });

      // Validate response before parsing
      if (!response || typeof response !== 'string') {
        throw new Error('Claude CLI returned empty or invalid response');
      }

      // Parse and return response
      return this.parseResponse(response);
    } catch (error) {
      // Use a more robust check for timeout errors first
      if (String(error).includes('ETIMEDOUT')) {
        throw new Error(`Claude CLI execution timed out after ${this.config.timeout}ms. The service is unresponsive. Please try again later or check the CLI's status.`);
      }

      // Enhanced error handling with specific error types
      if (error instanceof Error) {
        const err = error as any; // Cast to access potential properties like 'code'
        
        // Handle API quota errors (Anthropic uses 429 for rate limits)
        if (err.message.includes('429') && (err.message.includes('rate limit') || err.message.includes('quota'))) {
          throw new Error(`Claude API Quota Exceeded. You have made too many requests. Please wait for your quota to reset.`);
        }

        // Handle command not found errors
        if (err.code === 'ENOENT' || err.message.includes('command not found')) {
          throw new Error('Claude CLI not found. Please ensure the Claude CLI is installed and that its location is in your system\'s PATH.');
        }
        
        // Handle permission errors
        if (err.code === 'EACCES' || err.message.includes('permission denied')) {
          throw new Error('Permission denied while executing Claude CLI. Please check the permissions of the Claude executable.');
        }
        
        // Handle buffer overflow
        if (err.message.includes('maxBuffer')) {
          throw new Error('Claude CLI output exceeded the buffer limit. The generated content is too large to process.');
        }
        
        // Handle process killed errors
        if (err.signal === 'SIGKILL' || err.signal === 'SIGTERM') {
          throw new Error(`Claude CLI process was terminated unexpectedly with signal ${err.signal}.`);
        }
        
        // Generic fallback error with original message
        throw new Error(`Claude CLI execution failed: ${err.message}`);
      }
      
      // Fallback for non-Error objects
      throw new Error(`Claude CLI execution failed: ${String(error)}`);
    }
  }

  /**
   * Get current timeout setting
   */
  getTimeout(): number {
    return this.config.timeout;
  }

  /**
   * Get max prompt length setting
   */
  getMaxPromptLength(): number {
    return this.config.maxPromptLength;
  }
}