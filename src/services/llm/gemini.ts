import { execSync } from 'child_process';
import { LLMResponse } from '../../types';
import { LLM } from './types';
import { StyleConfig, getStyleConfig } from '../../styles/few-shot-examples';

export interface GeminiCLIConfig {
  timeout: number;
  maxPromptLength: number;
  cliCommand: string;
}

export class GeminiService implements LLM {
  private config: GeminiCLIConfig;

  constructor(config?: Partial<GeminiCLIConfig>) {
    this.config = {
      timeout: 60000, // 60 seconds
      maxPromptLength: 8192,
      cliCommand: 'gemini',
      ...config
    };
  }

  findGeminiBinary(): string {
    try {
      return execSync('which gemini', { encoding: 'utf8', timeout: 5000 }).trim();
    } catch (error) {
      throw new Error('Gemini CLI not found in PATH. Please install Gemini CLI first.');
    }
  }

  validatePrompt(prompt: string): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }
    if (prompt.length > this.config.maxPromptLength) {
      throw new Error(`Prompt too long (${prompt.length} characters, max ${this.config.maxPromptLength})`);
    }
    const maliciousPatterns = [/[;&|`$]/, /\$\(.*\)/, /`.*`/, /\|\s*\w+/, /&&\s*\w+/, /;\s*\w+/];
    for (const pattern of maliciousPatterns) {
      if (pattern.test(prompt)) {
        throw new Error('Invalid characters in prompt');
      }
    }
  }

  sanitizeSVG(svg: string): string {
    svg = svg.replace(/^```\w*\n?/m, '').replace(/\n?```$/m, '');
    svg = svg.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    svg = svg.replace(/<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/gi, '');
    svg = svg.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    svg = svg.replace(/javascript:[^"']*/gi, '');
    return svg;
  }

  buildSystemPrompt(userPrompt: string, svgReferences: string[], styleConfig?: StyleConfig): string {
    let systemPrompt = `You are an expert SVG icon designer. Given SVG references and a user request, generate a clean, optimized SVG icon.`;

    if (styleConfig) {
      systemPrompt += `\n\nSTYLE: ${styleConfig.name}\n${styleConfig.description}\n\nHere are examples of this style:\n\n${styleConfig.examples.map((example, index) => `Example ${index + 1}:\nPrompt: "${example.prompt}"\nDescription: ${example.description}\nSVG:\n${example.svg}\n`).join('\n')}\n\nFollow the exact same style, structure, and visual approach as these examples.`;
    }

    if (svgReferences.length > 0) {
      systemPrompt += `\n\nReference SVG icons:\n${svgReferences.map((svg, index) => `Reference ${index + 1}:\n${svg}\n`).join('\n')}`;
    }

    systemPrompt += `\n\nUser request: ${userPrompt}\n\nPlease generate:\n1. A clean SVG icon that fulfills the request\n2. A descriptive filename (no extension)\n\nFormat your response exactly as:\nFILENAME: [suggested-filename]\nSVG: [complete SVG code]\n\nRequirements:\n- Use proper SVG namespace: xmlns="http://www.w3.org/2000/svg"\n- Include viewBox attribute for scalability\n- Use clean, optimized SVG code\n- No script tags or dangerous elements\n- Filename should be descriptive and kebab-case${styleConfig ? `\n- CRITICALLY IMPORTANT: Follow the exact style, stroke-width, color scheme, and visual approach from the provided examples` : ''}`;

    return systemPrompt;
  }

  parseResponse(response: string): LLMResponse {
    const filenameMatch = response.match(/FILENAME:\s*(.+?)(?:\n|$)/i);
    const svgMatch = response.match(/SVG:\s*([\s\S]*?)(?:\n\nFILENAME:|$)/i);

    if (!svgMatch || !svgMatch[1]) {
      throw new Error('Invalid response format from Gemini CLI - SVG content not found');
    }

    let svg = svgMatch[1].trim();
    let filename = filenameMatch ? filenameMatch[1].trim() : 'generated-icon';

    svg = this.sanitizeSVG(svg);
    filename = filename.replace(/\.svg$/i, '').replace(/[^a-zA-Z0-9-_.]/g, '-');

    return { svg, filename };
  }

  async generate(prompt: string, svgReferences: string[] = [], styleName?: string): Promise<LLMResponse> {
    this.validatePrompt(prompt);
    this.findGeminiBinary();
    const styleConfig = styleName ? getStyleConfig(styleName) : undefined;
    const systemPrompt = this.buildSystemPrompt(prompt, svgReferences, styleConfig);

    try {
      // Execute Gemini CLI with improved error handling and timeout management
      const response = execSync('gemini', {
        input: systemPrompt,
        encoding: 'utf8',
        timeout: this.config.timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        stdio: ['pipe', 'pipe', 'pipe'], // Explicit stdio configuration
        windowsHide: true // Hide window on Windows (future compatibility)
      });

      // Validate response before parsing
      if (!response || typeof response !== 'string') {
        throw new Error('Gemini CLI returned empty or invalid response');
      }

      return this.parseResponse(response);
    } catch (error) {
      // Use a more robust check for timeout errors first
      if (String(error).includes('ETIMEDOUT')) {
        throw new Error(`Gemini CLI execution timed out after ${this.config.timeout}ms. The service is unresponsive. Please try again later or check the CLI's status.`);
      }

      // Enhanced error handling with specific error types
      if (error instanceof Error) {
        const err = error as any; // Cast to access potential properties like 'code'
        
        // Handle API quota errors
        if (err.message.includes('429') && (err.message.includes('Quota exceeded') || err.message.includes('RESOURCE_EXHAUSTED'))) {
          throw new Error(`Gemini API Quota Exceeded. You have made too many requests for the day. Please wait for your quota to reset.`);
        }

        // Handle command not found errors
        if (err.code === 'ENOENT' || err.message.includes('command not found')) {
          throw new Error('Gemini CLI not found. Please ensure the Gemini CLI is installed and that its location is in your system\'s PATH.');
        }
        
        // Handle permission errors
        if (err.code === 'EACCES' || err.message.includes('permission denied')) {
          throw new Error('Permission denied while executing Gemini CLI. Please check the permissions of the Gemini executable.');
        }

        // Handle buffer overflow
        if (err.message.includes('maxBuffer')) {
          throw new Error('Gemini CLI output exceeded the buffer limit. The generated content is too large to process.');
        }
        
        // Handle process killed errors
        if (err.signal === 'SIGKILL' || err.signal === 'SIGTERM') {
          throw new Error(`Gemini CLI process was terminated unexpectedly with signal ${err.signal}.`);
        }
        
        // Generic fallback error with original message
        throw new Error(`Gemini CLI execution failed: ${err.message}`);
      }
      
      // Fallback for non-Error objects
      throw new Error(`Gemini CLI execution failed: ${String(error)}`);
    }
  }
}
