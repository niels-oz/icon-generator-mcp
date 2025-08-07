import { LLM } from './types';
import { ClaudeService } from './claude';
import { GeminiService } from './gemini';

export type LLMProvider = 'claude' | 'gemini';

export function getLLMProvider(provider: LLMProvider = 'claude'): LLM {
  switch (provider) {
    case 'gemini':
      return new GeminiService();
    case 'claude':
    default:
      return new ClaudeService();
  }
}
