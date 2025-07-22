import { execSync } from 'child_process';
import { LLMResponse } from '../types';
import { StyleConfig, getStyleConfig } from '../styles/few-shot-examples';

export interface LLMConfig {
  timeout: number;
  maxPromptLength: number;
  cliCommand: string;
}

export class LLMService {
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    this.config = {
      timeout: 60000, // 60 seconds
      maxPromptLength: 2000,
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

${styleConfig.examples.map((example, index) => `Example ${index + 1}:
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
  async generateSVG(prompt: string, svgReferences: string[] = [], styleName?: string): Promise<LLMResponse> {
    // Validate input
    this.validatePrompt(prompt);

    // Check if Claude CLI is available
    this.findClaudeBinary();

    // Get style config if specified
    const styleConfig = styleName ? getStyleConfig(styleName) : undefined;

    // Build system prompt with few-shot learning if style is specified
    const systemPrompt = this.buildSystemPrompt(prompt, svgReferences, styleConfig);

    try {
      // Execute Claude CLI with the prompt - use proper shell escaping
      const response = execSync('claude', {
        input: systemPrompt,
        encoding: 'utf8',
        timeout: this.config.timeout,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      // Parse and return response
      return this.parseResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error(`Claude CLI execution timed out after ${this.config.timeout}ms`);
        }
        throw new Error(`Claude CLI execution failed: ${error.message}`);
      }
      throw new Error('Claude CLI execution failed: Unknown error');
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