// Core types for the icon generator MCP server with Sequential Thinking architecture

export interface IconGenerationRequest {
  png_paths: string[];
  prompt: string;
  output_name?: string;
  output_path?: string;
  style?: string;
}

export interface IconGenerationResponse {
  success: boolean;
  output_path?: string;
  message: string;
  processing_time?: number;
  error?: string;
  steps?: GenerationStep[];
}

export interface ConversionResult {
  svg: string;
  filename: string;
}

export interface LLMResponse {
  svg: string;
  filename: string;
}

// Sequential Thinking building blocks for icon generation
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
  | 'conversion'
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
  errors: string[];
}