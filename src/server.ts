import { IconGenerationRequest, IconGenerationResponse } from './types';
import { ConversionService } from './services/converter';

export class MCPServer {
  public readonly name = 'icon-generator-mcp';
  public readonly version = '0.1.0';
  
  private conversionService: ConversionService;
  
  constructor() {
    this.conversionService = new ConversionService();
  }

  getTools() {
    return [
      {
        name: 'generate_icon',
        description: 'Generate SVG icon from PNG references and text prompt',
        inputSchema: {
          type: 'object',
          properties: {
            png_paths: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Array of PNG file paths to use as references'
            },
            prompt: { 
              type: 'string',
              description: 'Text description of the desired icon'
            },
            output_name: { 
              type: 'string',
              description: 'Optional custom output filename'
            }
          },
          required: ['png_paths', 'prompt']
        }
      }
    ];
  }

  async handleToolCall(toolName: string, request: any): Promise<IconGenerationResponse> {
    const startTime = Date.now();
    
    try {
      if (toolName !== 'generate_icon') {
        return {
          success: false,
          message: 'Tool not found',
          error: `Unknown tool: ${toolName}`
        };
      }

      const validatedRequest = this.validateRequest(request);
      const result = await this.generateIcon(validatedRequest);
      
      return {
        success: true,
        output_path: result.output_path,
        message: result.message,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: 'Icon generation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time: Date.now() - startTime
      };
    }
  }

  private validateRequest(request: any): IconGenerationRequest {
    if (!request.png_paths || !Array.isArray(request.png_paths) || request.png_paths.length === 0) {
      throw new Error('png_paths is required and must be a non-empty array');
    }

    if (!request.prompt || typeof request.prompt !== 'string' || request.prompt.trim() === '') {
      throw new Error('prompt is required and must be a non-empty string');
    }

    return {
      png_paths: request.png_paths,
      prompt: request.prompt.trim(),
      output_name: request.output_name
    };
  }

  private async generateIcon(request: IconGenerationRequest): Promise<{ output_path: string; message: string }> {
    // For now, just return a simple response
    // In the next iteration, we'll implement the full pipeline
    return {
      output_path: '/tmp/generated-icon.svg',
      message: `Icon generated successfully from ${request.png_paths.length} PNG file(s) with prompt: "${request.prompt}"`
    };
  }
}