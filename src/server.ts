import { IconGenerationRequest, IconGenerationResponse, GenerationPhase, TOOL_NAMES, PromptCreatedResponse, IconSavedResponse, ValidationFailedResponse } from './types';
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
        name: TOOL_NAMES.CREATE_ICON_PROMPT,
        description: 'Creates an expert prompt for AI icon generation. Call this first to get generation instructions.\n\nWORKFLOW: This is step 1 of 2\n1. Call this tool with your icon request\n2. Use the returned expert_prompt to generate SVG\n3. Call save_generated_icon with the generated SVG\n\nExample: create_icon_prompt({prompt: "cat on pillow", style: "black-white-flat"})',
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
            style: { 
              type: 'string',
              description: 'Optional style preset for consistent icon generation (e.g., "black-white-flat")'
            },
          },
          required: ['prompt']
        }
      },
      {
        name: TOOL_NAMES.SAVE_GENERATED_ICON,
        description: 'Saves a generated SVG icon to file. Call this after generating SVG with the prompt.\n\nWORKFLOW: This is step 2 of 2\n1. Generate SVG using the expert_prompt from create_icon_prompt\n2. Call this tool with the generated SVG content\n\nExample: save_generated_icon({svg: "<svg>...</svg>", filename: "cat-pillow"})',
        inputSchema: {
          type: 'object',
          properties: {
            svg: {
              type: 'string',
              description: 'The SVG content to save'
            },
            filename: {
              type: 'string', 
              description: 'Suggested filename (without extension)'
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
          required: ['svg', 'filename']
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

  async handleToolCall(toolName: string, request: any): Promise<any> {
    if (toolName === TOOL_NAMES.CREATE_ICON_PROMPT) {
      return await this.handleCreateIconPrompt(request);
    } else if (toolName === TOOL_NAMES.SAVE_GENERATED_ICON) {
      return await this.handleSaveGeneratedIcon(request);
    } else {
      return {
        success: false,
        message: 'Tool not found',
        error: `Unknown tool: ${toolName}. Available tools: ${TOOL_NAMES.CREATE_ICON_PROMPT}, ${TOOL_NAMES.SAVE_GENERATED_ICON}`
      };
    }
  }

  /**
   * Create expert prompt for icon generation
   */
  async handleCreateIconPrompt(request: any): Promise<PromptCreatedResponse | ValidationFailedResponse> {
    try {
      // Validate request first
      const validatedRequest = this.validateContextRequest(request);
      
      // Create generation session with phase-based state management
      const state = this.stateManager.createSession(validatedRequest);
      
      // Execute context preparation with phase tracking
      const result = await this.executeContextPreparation(state.sessionId);
      
      return {
        type: 'prompt_created',
        expert_prompt: result.expert_prompt,
        suggested_filename: result.suggested_filename,
        next_action: {
          description: `Generate SVG with this prompt, then call ${TOOL_NAMES.SAVE_GENERATED_ICON}`,
          tool_name: TOOL_NAMES.SAVE_GENERATED_ICON,
          required_params: ['svg', 'filename'],
          workflow_step: '2 of 2',
          example_usage: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>',
            filename: result.suggested_filename
          }
        }
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Context preparation failed';
      return {
        type: 'validation_failed',
        success: false,
        message: 'Context preparation failed',
        error: errorMessage
      };
    }
  }

  /**
   * Save generated SVG icon to file
   */
  async handleSaveGeneratedIcon(request: any): Promise<IconSavedResponse | ValidationFailedResponse> {
    try {
      // Validate save request
      if (!request.svg || typeof request.svg !== 'string') {
        throw new Error('svg content is required');
      }
      if (!request.filename || typeof request.filename !== 'string') {
        throw new Error('filename is required');
      }

      // Determine final filename
      const outputFilename = request.output_name || request.filename;
      
      // Save using file writer service
      const saveResult = await this.fileWriterService.saveGeneratedIcon(
        outputFilename,
        request.output_path,
        request.svg
      );
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save icon');
      }
      
      return {
        type: 'icon_saved',
        success: true,
        output_path: saveResult.outputPath!,
        message: `Icon saved successfully: ${path.basename(saveResult.outputPath!)}`
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      return {
        type: 'validation_failed',
        success: false,
        message: 'Failed to save icon',
        error: errorMessage
      };
    }
  }

  private validateContextRequest(request: any): any {
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
      style: request.style
    };
  }

  private async executeContextPreparation(sessionId: string): Promise<any> {
    const state = this.stateManager.getSession(sessionId)!;
    
    // Phase 1: Validation
    await this.executeValidationPhase(sessionId);
    
    // Phase 2: Analysis  
    await this.executeAnalysisPhase(sessionId);
    
    // Phase 3: Context Building (replacement for generation)
    await this.executeContextBuilding(sessionId);
    
    const contextState = this.stateManager.getSession(sessionId)!;
    return {
      expert_prompt: (contextState.context as any).expertPrompt,
      suggested_filename: (contextState.context as any).suggestedFilename,
      references_processed: contextState.context.validatedFiles.length
    };
  }

  private async executeValidationPhase(sessionId: string): Promise<void> {
    const state = this.stateManager.getSession(sessionId)!;
    this.stateManager.startValidation(sessionId);
    
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
  
  private async executeContextBuilding(sessionId: string): Promise<void> {
    const state = this.stateManager.getSession(sessionId)!;
    this.stateManager.startGeneration(sessionId);
    
    try {
      // Categorize references into visual (PNG) and text (SVG) types
      const textReferences: string[] = [];
      
      for (const filePath of state.context.validatedFiles) {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.svg') {
          // SVG files are read as text content
          const svgContent = fs.readFileSync(filePath, 'utf8');
          textReferences.push(svgContent);
        }
        // PNG files are handled by multimodal LLM directly, not converted
      }
      
      // Build expert prompt using context builder
      const { buildGenerationContext } = await import('./context-builder');
      const context = buildGenerationContext(state.request.prompt, textReferences, state.request.style);
      
      // Generate suggested filename
      const stopWords = ['create', 'make', 'generate', 'icon', 'the', 'and', 'with', 'for', 'in', 'of', 'a', 'an', 'beautiful', 'minimalist', 'please', 'help', 'design', 'elements', 'modern', 'application', 'interface'];
      
      const keywords = state.request.prompt.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && 
          !stopWords.includes(word)
        )
        .slice(0, 2)
        .join('-');
      
      const suggestedFilename = keywords || 'generated-icon';
      
      this.stateManager.updateContext(sessionId, { 
        expertPrompt: context.prompt,
        suggestedFilename: suggestedFilename
      } as any);
      this.stateManager.updateStep(sessionId, 'generation', 'completed',
        `Built expert prompt context (${context.prompt.length} characters)`);
      
    } catch (error) {
      const specificErrorMessage = error instanceof Error ? error.message : 'Context building failed';
      this.stateManager.addError(sessionId, 'generation', specificErrorMessage);
      throw new Error(specificErrorMessage);
    }
  }

}