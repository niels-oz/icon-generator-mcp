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
      const llmResponse = await this.generateSimpleSVG(
        state.request.prompt, 
        textReferences, 
        visualReferences,
        state.request.style
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
   * Generate SVG using real LLM with expert prompt engineering
   */
  private async generateSimpleSVG(prompt: string, textReferences: string[] = [], visualReferences: string[] = [], style?: string): Promise<{ svg: string, filename: string }> {
    try {
      // Use expert prompt engineering from context-builder
      const { buildGenerationContext } = await import('./context-builder');
      const context = buildGenerationContext(prompt, textReferences, style);
      
      // Generate SVG using the expert prompt with Claude (this MCP host)
      console.log('Using expert prompt for real AI generation...');
      
      // Use the expert prompt to generate SVG content
      // Since we're running in Claude Code, we can leverage Claude's capabilities
      const aiResponse = await this.generateSVGWithAI(context.prompt, prompt);
      
      return aiResponse;
      
    } catch (error) {
      throw new Error(`SVG generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate SVG using real AI with expert prompt
   */
  private async generateSVGWithAI(expertPrompt: string, userPrompt: string): Promise<{ svg: string, filename: string }> {
    // Extract meaningful keywords for semantic filename
    const stopWords = ['create', 'make', 'generate', 'icon', 'the', 'and', 'with', 'for', 'in', 'of', 'a', 'an', 'beautiful', 'minimalist', 'please', 'help', 'design', 'elements', 'modern', 'application', 'interface'];
    
    const keywords = userPrompt.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !stopWords.includes(word)
      )
      .slice(0, 2)
      .join('-');
    
    const filename = keywords || 'generated-icon';
    
    // Generate real SVG using the expert prompt intelligently
    // Parse the expert prompt to understand what the user wants
    const result = await this.processExpertPrompt(expertPrompt, userPrompt);
    
    return { svg: result.svg, filename };
  }

  /**
   * Process the expert prompt using real AI generation
   */
  private async processExpertPrompt(expertPrompt: string, userPrompt: string): Promise<{ svg: string }> {
    // This is where we need to call Claude directly with the expert prompt
    // Since we're running inside Claude Code MCP, we need to find a way to call the host LLM
    
    // TODO: Implement actual Claude/LLM API call here
    // const response = await this.callClaudeAPI(expertPrompt);
    // return this.parseSVGResponse(response);
    
    throw new Error(`REAL LLM CALL NEEDED: Must implement actual Claude API call for expert prompt. Cannot use hardcoded patterns for: "${userPrompt}"`);
  }
  }

}