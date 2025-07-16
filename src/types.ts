// Core types for the icon generator MCP server

export interface IconGenerationRequest {
  png_paths: string[];
  prompt: string;
  output_name?: string;
  output_path?: string;
}

export interface IconGenerationResponse {
  success: boolean;
  output_path?: string;
  message: string;
  processing_time?: number;
  error?: string;
}

export interface ConversionResult {
  svg: string;
  filename: string;
}

export interface LLMResponse {
  svg: string;
  filename: string;
}