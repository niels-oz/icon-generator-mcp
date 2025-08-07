import { IconGenerationRequest, IconGenerationResponse, GenerationPhase } from './types';
import { ConversionService } from './services/converter';
import { LLM } from './services/llm/types';
import { getLLMProvider, LLMProvider } from './services/llm/factory';
import { FileWriterService } from './services/file-writer';
import { StateManager } from './services/state-manager';
import { VisualFormatter } from './services/visual-formatter';
import * as path from 'path';
import * as fs from 'fs';

export class MCPServer {
  public readonly name = 'icon-generator-mcp';
  public readonly version = '0.2.0';
  
  private conversionService: ConversionService;
  private llmService: LLM;
  private fileWriterService: FileWriterService;
  private stateManager: StateManager;
  private formatter: VisualFormatter;
  
  constructor(llmProvider: LLMProvider = 'claude') {
    this.conversionService = new ConversionService();
    this.llmService = getLLMProvider(llmProvider);
    this.fileWriterService = new FileWriterService();
    this.stateManager = new StateManager();
    this.formatter = new VisualFormatter();
  }

  getTools() {
    return [
      {
        name: 'generate_icon',
        description: 'Generate SVG icon from PNG references and/or text prompt with step-by-step visual feedback',
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
            output_name: { 
              type: 'string',
              description: 'Optional custom output filename'
            },
            output_path: { 
              type: 'string',
              description: 'Optional custom output directory path'
            },
            style: { 
              type: 'string',
              description: 'Optional style preset for consistent icon generation (e.g., "black-white-flat")'
            },
            llm_provider: { 
              type: 'string',
              description: 'Optional LLM provider to use (claude or gemini)',
              enum: ['claude', 'gemini']
            }
          },
          required: ['prompt']
        }
      }
    ];
  }

  async handleToolCall(toolName: string, request: any): Promise<IconGenerationResponse> {
    if (toolName !== 'generate_icon') {
      return {
        success: false,
        message: 'Tool not found',
        error: `Unknown tool: ${toolName}`
      };
    }

    try {
      // Validate request first
      const validatedRequest = this.validateRequest(request);
      
      // Create generation session with Sequential Thinking state management
      const state = this.stateManager.createSession(validatedRequest);
      
      const llmProvider = validatedRequest.llm_provider || 'claude';
      this.llmService = getLLMProvider(llmProvider);

      try {
        // Execute generation with step-by-step tracking
        const result = await this.executeSequentialGeneration(state.sessionId);
        
        // Generate final visual summary
        const summary = this.formatter.formatGenerationSummary(state);
        const finalResult = this.formatter.formatFinalResult(state, result.success);
        
        console.log('\n' + summary);
        console.log('\n' + finalResult);
        
        return {
          ...result,
          processing_time: this.stateManager.getProcessingTime(state.sessionId),
          steps: this.stateManager.getAllSteps(state.sessionId)
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.stateManager.addError(state.sessionId, state.currentPhase, errorMessage);
        
        const summary = this.formatter.formatGenerationSummary(state);
        const finalResult = this.formatter.formatFinalResult(state, false);
        
        console.log('\n' + summary);
        console.log('\n' + finalResult);
        
        return {
          success: false,
          message: 'Icon generation failed',
          error: errorMessage,
          processing_time: this.stateManager.getProcessingTime(state.sessionId),
          steps: this.stateManager.getAllSteps(state.sessionId)
        };
      } finally {
        // Clean up session after completion
        const cleanup = setTimeout(() => this.stateManager.cleanupSession(state.sessionId), 5000);
        cleanup.unref();
      }
    } catch (validationError) {
      // Handle validation errors before session creation
      const errorMessage = validationError instanceof Error ? validationError.message : 'Unknown validation error';
      return {
        success: false,
        message: 'Request validation failed',
        error: errorMessage,
        processing_time: 0,
        steps: []
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

    if (request.llm_provider && !['claude', 'gemini'].includes(request.llm_provider)) {
      throw new Error("Invalid llm_provider specified. Must be one of ['claude', 'gemini']");
    }

    return {
      png_paths: pngPaths,
      prompt: request.prompt.trim(),
      output_name: request.output_name,
      output_path: request.output_path,
      style: request.style,
      llm_provider: request.llm_provider
    };
  }

  private async executeSequentialGeneration(sessionId: string): Promise<IconGenerationResponse> {
    try {
      // Phase 1: Validation
      await this.executeValidationPhase(sessionId);
      
      // Phase 2: Analysis  
      await this.executeAnalysisPhase(sessionId);
      
      // Phase 3: Conversion
      await this.executeConversionPhase(sessionId);
      
      // Phase 4: Generation
      await this.executeGenerationPhase(sessionId);
      
      // Phase 5: Refinement (optional)
      await this.executeRefinementPhase(sessionId);
      
      // Phase 6: Output
      const result = await this.executeOutputPhase(sessionId);
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  private async executeValidationPhase(sessionId: string): Promise<void> {
    const state = this.stateManager.getSession(sessionId)!;
    this.stateManager.startValidation(sessionId);
    
    const progress = this.formatter.formatProgress(state);
    console.log('\n' + progress);
    
    try {
      // Validate prompt
      if (!state.request.prompt || state.request.prompt.trim() === '') {
        throw new Error('Prompt is required and cannot be empty');
      }
      
      // Validate PNG files if provided
      const validatedFiles: string[] = [];
      if (state.request.png_paths && state.request.png_paths.length > 0) {
        for (const filePath of state.request.png_paths) {
          if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
          }
          if (!filePath.toLowerCase().endsWith('.png') && !filePath.toLowerCase().endsWith('.svg')) {
            throw new Error(`Unsupported file format: ${filePath}. Only PNG and SVG files are supported.`);
          }
          validatedFiles.push(filePath);
        }
      }
      
      this.stateManager.updateContext(sessionId, { validatedFiles });
      this.stateManager.updateStep(sessionId, 'validation', 'completed', 
        `Validated ${validatedFiles.length} input files and prompt`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Validation failed';
      this.stateManager.addError(sessionId, 'validation', errorMsg);
      throw error;
    }
  }
  
  private async executeAnalysisPhase(sessionId: string): Promise<void> {
    const state = this.stateManager.getSession(sessionId)!;
    this.stateManager.startAnalysis(sessionId);
    
    const progress = this.formatter.formatProgress(state);
    console.log('\n' + progress);
    
    try {
      let analysisMessage = `Analyzing prompt: "${state.request.prompt.substring(0, 50)}..."`;
      
      if (state.context.validatedFiles.length > 0) {
        analysisMessage += ` and ${state.context.validatedFiles.length} reference files`;
      }
      
      if (state.request.style) {
        analysisMessage += ` with style: ${state.request.style}`;
      }
      
      this.stateManager.updateStep(sessionId, 'analysis', 'completed', analysisMessage);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Analysis failed';
      this.stateManager.addError(sessionId, 'analysis', errorMsg);
      throw error;
    }
  }
  
  private async executeConversionPhase(sessionId: string): Promise<void> {
    const state = this.stateManager.getSession(sessionId)!;
    
    if (state.context.validatedFiles.length === 0) {
      this.stateManager.skipPhase(sessionId, 'conversion', 'No input files to convert');
      return;
    }
    
    this.stateManager.startConversion(sessionId);
    
    const progress = this.formatter.formatProgress(state);
    console.log('\n' + progress);
    
    try {
      const svgReferences: string[] = [];
      
      for (const filePath of state.context.validatedFiles) {
        const svgContent = await this.convertImageToSVG(filePath);
        svgReferences.push(svgContent);
      }
      
      this.stateManager.updateContext(sessionId, { svgReferences });
      this.stateManager.updateStep(sessionId, 'conversion', 'completed',
        `Converted ${svgReferences.length} files to SVG references`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Conversion failed';
      this.stateManager.addError(sessionId, 'conversion', errorMsg);
      throw error;
    }
  }
  
  private async executeGenerationPhase(sessionId: string): Promise<void> {
    const state = this.stateManager.getSession(sessionId)!;
    this.stateManager.startGeneration(sessionId);
    
    const progress = this.formatter.formatProgress(state);
    console.log('\n' + progress);
    
    try {
      const llmResponse = await this.llmService.generate(
        state.request.prompt,
        state.context.svgReferences,
        state.request.style
      );
      
      this.stateManager.updateContext(sessionId, { 
        generatedSvg: llmResponse.svg,
        suggestedFilename: llmResponse.filename 
      });
      this.stateManager.updateStep(sessionId, 'generation', 'completed',
        `Generated SVG icon using AI (${llmResponse.svg.length} characters)`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Generation failed';
      this.stateManager.addError(sessionId, 'generation', errorMsg);
      throw error;
    }
  }
  
  private async executeRefinementPhase(sessionId: string): Promise<void> {
    // For now, skip refinement - could be enhanced with iterative improvement
    this.stateManager.skipPhase(sessionId, 'refinement', 'Basic generation complete, no refinement needed');
  }
  
  private async executeOutputPhase(sessionId: string): Promise<IconGenerationResponse> {
    const state = this.stateManager.getSession(sessionId)!;
    this.stateManager.startOutput(sessionId);
    
    const progress = this.formatter.formatProgress(state);
    console.log('\n' + progress);
    
    try {
      if (!state.context.generatedSvg) {
        throw new Error('No SVG content to save');
      }
      
      // Determine output filename - use suggested filename from LLM if available
      const outputFilename = state.request.output_name || 
        (state.context.suggestedFilename ? `${state.context.suggestedFilename}.svg` : 'generated-icon.svg');
      
      // Save generated SVG to file
      const referenceForLocation = state.request.output_path || 
        (state.context.validatedFiles.length > 0 ? state.context.validatedFiles[0] : undefined);
        
      const saveResult = await this.fileWriterService.saveGeneratedIcon(
        outputFilename,
        referenceForLocation,
        state.context.generatedSvg
      );
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save generated icon');
      }
      
      this.stateManager.updateContext(sessionId, { outputPath: saveResult.outputPath });
      this.stateManager.updateStep(sessionId, 'output', 'completed',
        `Saved to: ${path.basename(saveResult.outputPath!)}`);
      
      return {
        success: true,
        output_path: saveResult.outputPath!,
        message: `Icon generated successfully: ${path.basename(saveResult.outputPath!)}`
      };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Output failed';
      this.stateManager.addError(sessionId, 'output', errorMsg);
      throw error;
    }
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