import { IconGenerationRequest, IconGenerationResponse } from './types';
import { ConversionService } from './services/converter';
import { LLMService } from './services/llm';
import { FileWriterService } from './services/file-writer';
import { WebImageSearchService } from './services/web-search';
import * as path from 'path';
import * as fs from 'fs';

export class MCPServer {
  public readonly name = 'icon-generator-mcp';
  public readonly version = '0.1.0';
  
  private conversionService: ConversionService;
  private llmService: LLMService;
  private fileWriterService: FileWriterService;
  private webSearchService: WebImageSearchService;
  
  constructor() {
    this.conversionService = new ConversionService();
    this.llmService = new LLMService();
    this.fileWriterService = new FileWriterService();
    this.webSearchService = new WebImageSearchService();
  }

  getTools() {
    return [
      {
        name: 'generate_icon',
        description: 'Generate SVG icon from PNG references and/or text prompt',
        inputSchema: {
          type: 'object',
          properties: {
            png_paths: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Optional array of PNG file paths to use as references'
            },
            prompt: { 
              type: 'string',
              description: 'Text description of the desired icon'
            },
            search_keyword: {
              type: 'string',
              description: 'Single keyword or 2-word phrase for web image search (e.g., "star", "folder", "shopping cart")'
            },
            auto_search: {
              type: 'boolean',
              description: 'Whether to automatically search web for reference images'
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
          required: ['prompt']
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
    // Validate prompt (always required)
    if (!request.prompt || typeof request.prompt !== 'string' || request.prompt.trim() === '') {
      throw new Error('prompt is required and must be a non-empty string');
    }

    // Validate png_paths (optional, but if provided must be valid array)
    let pngPaths: string[] = [];
    if (request.png_paths !== undefined) {
      if (!Array.isArray(request.png_paths)) {
        throw new Error('png_paths must be an array if provided');
      }
      pngPaths = request.png_paths;
    }

    return {
      png_paths: pngPaths,
      prompt: request.prompt.trim(),
      search_keyword: request.search_keyword,
      auto_search: request.auto_search,
      output_name: request.output_name,
      output_path: request.output_path
    };
  }

  private async generateIcon(request: IconGenerationRequest): Promise<{ output_path: string; message: string }> {
    // Step 1: Get PNG files from manual uploads and web search
    let pngPaths = request.png_paths || [];
    
    // Add web search results if requested
    if (request.auto_search && request.search_keyword) {
      try {
        const searchedPngs = await this.webSearchService.searchSimpleIcons(request.search_keyword);
        pngPaths = [...pngPaths, ...searchedPngs];
      } catch (error) {
        console.warn('Web search failed, continuing with manual PNGs only:', error);
      }
    }
    
    // Step 2: Convert all image files to SVG references
    const svgReferences: string[] = [];
    if (pngPaths.length > 0) {
      for (const imagePath of pngPaths) {
        try {
          const svgContent = await this.convertImageToSVG(imagePath);
          svgReferences.push(svgContent);
        } catch (error) {
          throw new Error(`Failed to convert image file ${imagePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Step 3: Generate icon using LLM with SVG references and prompt
    const llmResponse = await this.llmService.generateSVG(request.prompt, svgReferences);

    // Step 4: Determine output filename
    const outputFilename = request.output_name || llmResponse.filename;

    // Step 5: Save generated SVG to file
    const referenceForLocation = request.output_path || (pngPaths.length > 0 ? pngPaths[0] : undefined);
    const saveResult = await this.fileWriterService.saveGeneratedIcon(
      outputFilename,
      referenceForLocation,
      llmResponse.svg
    );

    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to save generated icon');
    }

    // Step 6: Return success response
    return {
      output_path: saveResult.outputPath!,
      message: `Icon generated successfully: ${path.basename(saveResult.outputPath!)}`
    };
  }

  /**
   * Convert image file to SVG based on file format
   */
  private async convertImageToSVG(imagePath: string): Promise<string> {
    const ext = path.extname(imagePath).toLowerCase();
    
    switch (ext) {
      case '.svg':
        // SVG files can be used directly
        return fs.readFileSync(imagePath, 'utf8');
      
      case '.png':
        // PNG files need conversion via Potrace
        return await this.conversionService.convertPNGToSVG(imagePath);
      
      default:
        throw new Error(`Unsupported image format: ${ext}. Only SVG and PNG are supported.`);
    }
  }
}