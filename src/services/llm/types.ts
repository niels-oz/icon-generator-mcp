import { LLMResponse } from '../../types';

export interface LLM {
  generate(prompt: string, svgReferences?: string[], styleName?: string): Promise<LLMResponse>;
}
