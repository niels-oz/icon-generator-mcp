import { LLMResponse } from '../../types';

export interface LLMService {
  generateSVG(expertPrompt: string): Promise<{ svg: string; filename: string }>;
  isAvailable(): boolean;
}

export interface LLM {
  generate(prompt: string, svgReferences?: string[], styleName?: string): Promise<LLMResponse>;
}