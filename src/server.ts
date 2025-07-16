import { IconGenerationRequest, IconGenerationResponse } from './types';
import { ConversionService } from './services/converter';
import { LLMService } from './services/llm';
import { FileWriterService } from './services/file-writer';
import * as path from 'path';

export class MCPServer {
  public readonly name = 'icon-generator-mcp';
  public readonly version = '0.1.0';
  
  private conversionService: ConversionService;
  private llmService: LLMService;
  private fileWriterService: FileWriterService;
  
  constructor() {
    this.conversionService = new ConversionService();
    this.llmService = new LLMService();
    this.fileWriterService = new FileWriterService();
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
            },
            output_path: { 
              type: 'string',
              description: 'Optional custom output directory path'
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
      output_name: request.output_name,
      output_path: request.output_path
    };
  }

  private async generateIcon(request: IconGenerationRequest): Promise<{ output_path: string; message: string }> {
    // Step 1: Convert all PNG files to SVG references
    const svgReferences: string[] = [];
    for (const pngPath of request.png_paths) {
      try {
        const svgContent = await this.conversionService.convertPNGToSVG(pngPath);
        svgReferences.push(svgContent);
      } catch (error) {
        throw new Error(`Failed to convert PNG file ${pngPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Step 2: Generate icon using LLM with SVG references and prompt
    const llmResponse = await this.llmService.generateSVG(request.prompt, svgReferences);

    // Step 3: Determine output filename
    const outputFilename = request.output_name || llmResponse.filename;

    // Step 4: Save generated SVG to file
    const referenceForLocation = request.output_path || request.png_paths[0];
    const saveResult = await this.fileWriterService.saveGeneratedIcon(
      outputFilename,
      referenceForLocation,
      llmResponse.svg
    );

    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to save generated icon');
    }

    // Step 5: Return success response
    return {
      output_path: saveResult.outputPath!,
      message: `Icon generated successfully: ${path.basename(saveResult.outputPath!)}`
    };
  }
}