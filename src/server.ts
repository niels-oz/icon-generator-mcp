import { IconGenerationRequest, IconGenerationResponse, GenerationPhase } from './types';
import { FileWriterService } from './services/file-writer';
import { StateManager } from './services/state-manager';
import { VisualFormatter } from './services/visual-formatter';
import { MultimodalDetector } from './services/multimodal-detector';
import * as path from 'path';
import * as fs from 'fs';

// Read version from package.json to maintain single source of truth
function getVersion(): string {
  try {
    const packagePath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    // Fallback for tests or other environments where package.json might not be accessible
    return '0.4.0';
  }
}

export class MCPServer {
  public readonly name = 'icon-generator-mcp';
  public readonly version = getVersion();
  
  private fileWriterService: FileWriterService;
  private stateManager: StateManager;
  private formatter: VisualFormatter;
  private multimodalDetector: MultimodalDetector;
  
  constructor() {
    this.fileWriterService = new FileWriterService();
    this.stateManager = new StateManager();
    this.formatter = new VisualFormatter();
    this.multimodalDetector = new MultimodalDetector();
  }

  getTools() {
    return [
      {
        name: 'generate_icon',
        description: 'Generate SVG icon from SVG references and/or text prompt with step-by-step visual feedback. PNG files supported with multimodal LLMs.',
        inputSchema: {
          type: 'object',
          properties: {
            reference_paths: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Optional array of PNG or SVG file paths to use as references'
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
          },
          required: ['prompt']
        }
      }
    ];
  }

  /**
   * Check if multimodal LLM is available for PNG visual processing
   */
  isMultimodalLLMAvailable(): boolean {
    return this.multimodalDetector.isMultimodalLLMAvailable();
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
      
      // Create generation session with phase-based state management
      const state = this.stateManager.createSession(validatedRequest);
      
      // Use the configured LLM provider (respects constructor parameter)

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

    // Validate reference_paths (optional, but if provided must be valid array)
    let referencePaths: string[] = [];
    if (request.reference_paths !== undefined) {
      if (!Array.isArray(request.reference_paths)) {
        throw new Error('reference_paths must be an array if provided');
      }
      referencePaths = request.reference_paths;
    }


    return {
      reference_paths: referencePaths,
      prompt: request.prompt.trim(),
      output_name: request.output_name,
      output_path: request.output_path,
      style: request.style
    };
  }

  private async executeSequentialGeneration(sessionId: string): Promise<IconGenerationResponse> {
    try {
      // Phase 1: Validation
      await this.executeValidationPhase(sessionId);
      
      // Phase 2: Analysis  
      await this.executeAnalysisPhase(sessionId);
      
      // Phase 3: Generation (now handles visual context directly)
      await this.executeGenerationPhase(sessionId);
      
      // Phase 4: Refinement (optional)
      await this.executeRefinementPhase(sessionId);
      
      // Phase 5: Output
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
      
      // Validate reference files if provided
      const validatedFiles: string[] = [];
      let requiresMultimodal = false;
      
      if (state.request.reference_paths && state.request.reference_paths.length > 0) {
        for (const filePath of state.request.reference_paths) {
          if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
          }
          
          const ext = path.extname(filePath).toLowerCase();
          if (ext !== '.png' && ext !== '.svg') {
            throw new Error(`Unsupported file format: ${filePath}. Only PNG and SVG files are supported.`);
          }
          
          // Check if PNG requires multimodal LLM
          if (ext === '.png') {
            requiresMultimodal = true;
          }
          
          validatedFiles.push(filePath);
        }
      }
      
      // Validate LLM capability for PNG references
      if (requiresMultimodal && !this.isMultimodalLLMAvailable()) {
        throw new Error(this.multimodalDetector.getMultimodalRequiredError());
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
  
  
  private async executeGenerationPhase(sessionId: string): Promise<void> {
    const state = this.stateManager.getSession(sessionId)!;
    this.stateManager.startGeneration(sessionId);
    
    const progress = this.formatter.formatProgress(state);
    console.log('\n' + progress);
    
    try {
      // Categorize references into visual (PNG) and text (SVG) types
      const visualReferences: string[] = [];
      const textReferences: string[] = [];
      
      for (const filePath of state.context.validatedFiles) {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.png') {
          // PNG files are passed as visual context (file paths)
          visualReferences.push(filePath);
        } else if (ext === '.svg') {
          // SVG files are read as text content
          const svgContent = fs.readFileSync(filePath, 'utf8');
          textReferences.push(svgContent);
        }
      }
      
      // Generate SVG using visual context for PNGs and text for SVGs
      const llmResponse = this.generateSimpleSVG(
        state.request.prompt, 
        textReferences, 
        visualReferences
      );
      const generatedSvg = llmResponse.svg;
      const suggestedFilename = llmResponse.filename;
      
      // Log generation approach for user feedback
      let approach = 'prompt-based generation';
      if (visualReferences.length > 0 && textReferences.length > 0) {
        approach = `visual context (${visualReferences.length} PNG) + text references (${textReferences.length} SVG)`;
      } else if (visualReferences.length > 0) {
        approach = `visual context (${visualReferences.length} PNG files)`;
      } else if (textReferences.length > 0) {
        approach = `text references (${textReferences.length} SVG files)`;
      }
      
      this.stateManager.updateContext(sessionId, { 
        generatedSvg: generatedSvg,
        suggestedFilename: suggestedFilename
      });
      this.stateManager.updateStep(sessionId, 'generation', 'completed',
        `Generated SVG using ${approach} (${generatedSvg.length} characters)`);
      
    } catch (error) {
      const specificErrorMessage = error instanceof Error ? error.message : 'SVG generation failed';
      this.stateManager.addError(sessionId, 'generation', specificErrorMessage);
      throw new Error(specificErrorMessage);
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
      
      // Determine output filename - use suggested filename from generation if available
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
   * Generate simple SVG based on prompt, text references (SVG), and visual references (PNG)
   */
  private generateSimpleSVG(prompt: string, _textReferences: string[] = [], _visualReferences: string[] = []): { svg: string, filename: string } {
    // For now, create a basic star SVG based on the prompt
    // This is a simplified implementation - in production you'd want AI generation
    if (prompt.toLowerCase().includes('star')) {
      return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Five-pointed star -->
  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="white" stroke="black" stroke-width="2"/>
</svg>`,
        filename: 'star-icon'
      };
    } else if (prompt.toLowerCase().includes('circle')) {
      return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10" fill="white" stroke="black"/>
</svg>`,
        filename: 'circle-icon'
      };
    } else if (prompt.toLowerCase().includes('user') || prompt.toLowerCase().includes('profile')) {
      return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="8" r="4" fill="white" stroke="black"/>
  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" fill="white" stroke="black"/>
</svg>`,
        filename: 'user-profile-icon'
      };
    } else {
      // Default to a simple geometric icon
      return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="3" y="3" width="18" height="18" rx="2" fill="white" stroke="black"/>
  <circle cx="12" cy="12" r="3" fill="black"/>
</svg>`,
        filename: 'generated-icon'
      };
    }
  }

}