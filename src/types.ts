// Core types for the icon generator MCP server with phase-based generation pipeline

export interface IconGenerationRequest {
  reference_paths?: string[];
  prompt: string;
  output_name?: string;
  output_path?: string;
  style?: string;
}

export interface IconGenerationResponse {
  success: boolean;
  generation_context?: any; // Context prepared for LLM generation
  output_path?: string;
  message: string;
  processing_time?: number;
  error?: string;
  steps?: GenerationStep[];
}


export interface LLMResponse {
  svg: string;
  filename: string;
}

// Phase-based processing building blocks for icon generation
export interface GenerationStep {
  step: GenerationPhase;
  status: StepStatus;
  message: string;
  timestamp: Date;
  details?: any;
}

export type GenerationPhase = 
  | 'validation'
  | 'analysis'
  | 'generation'
  | 'refinement'
  | 'output';

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface GenerationState {
  sessionId: string;
  request: IconGenerationRequest;
  steps: GenerationStep[];
  currentPhase: GenerationPhase;
  startTime: Date;
  context: GenerationContext;
}

export interface GenerationContext {
  validatedFiles: string[];
  svgReferences: string[];
  generatedSvg?: string;
  suggestedFilename?: string;
  outputPath?: string;
  generationContext?: any; // Context prepared for LLM
  errors: string[];
}

// New types for improved tool naming and workflow guidance

export interface NextAction {
  description: string;
  tool_name: string;
  required_params: string[];
  workflow_step: string;
  example_usage: {
    svg: string;
    filename: string;
  };
}

export interface PromptCreatedResponse {
  type: 'prompt_created';
  expert_prompt: string;
  suggested_filename: string;
  next_action: NextAction;
}

export interface IconSavedResponse {
  type: 'icon_saved';
  success: boolean;
  output_path: string;
  message: string;
}

export interface ValidationFailedResponse {
  type: 'validation_failed';
  success: false;
  error: string;
  message: string;
}

export type ToolResponse = PromptCreatedResponse | IconSavedResponse | ValidationFailedResponse;

// Tool name constants for type safety
export const TOOL_NAMES = {
  CREATE_ICON_PROMPT: 'create_icon_prompt',
  SAVE_GENERATED_ICON: 'save_generated_icon'
} as const;

export type ToolName = typeof TOOL_NAMES[keyof typeof TOOL_NAMES];