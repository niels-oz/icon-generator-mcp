import { StyleConfig, getStyleConfig } from './styles/few-shot-examples';

export interface GenerationContext {
  prompt: string;
  instructions: string;
  processing_info: {
    references_processed: number;
    style_applied: string | null;
    analysis_time_ms: number;
  };
}

/**
 * Build context for LLM generation based on user prompt, references, and style
 * This replaces the CLI-based LLM integration with context preparation
 */
export function buildGenerationContext(
  userPrompt: string, 
  svgReferences: string[] = [], 
  styleName?: string
): GenerationContext {
  const startTime = Date.now();
  
  // Get style config if specified
  const styleConfig = styleName ? getStyleConfig(styleName) : undefined;

  let systemPrompt = `You are an expert SVG icon designer. Given SVG references and a user request, generate a clean, optimized SVG icon.`;

  // Add few-shot examples if style config is provided
  if (styleConfig) {
    systemPrompt += `\n\nSTYLE: ${styleConfig.name}
${styleConfig.description}

Here are examples of this style:

${styleConfig.examples.map((example: any, index: number) => `Example ${index + 1}:
Prompt: "${example.prompt}"
Description: ${example.description}
SVG:
${example.svg}
`).join('\n')}

Follow the exact same style, structure, and visual approach as these examples.`;
  }

  // Add reference SVGs if provided
  if (svgReferences.length > 0) {
    systemPrompt += `\n\nReference SVG icons:
${svgReferences.map((svg, index) => `Reference ${index + 1}:
${svg}
`).join('\n')}`;
  }

  systemPrompt += `\n\nUser request: ${userPrompt}

Please generate:
1. A clean SVG icon that fulfills the request
2. A descriptive filename (no extension)

Format your response exactly as:
FILENAME: [suggested-filename]
SVG: [complete SVG code]

Requirements:
- Use proper SVG namespace: xmlns="http://www.w3.org/2000/svg"
- Include viewBox attribute for scalability
- Use clean, optimized SVG code
- No script tags or dangerous elements
- Filename should be descriptive and kebab-case${styleConfig ? `
- CRITICALLY IMPORTANT: Follow the exact style, stroke-width, color scheme, and visual approach from the provided examples` : ''}`;

  const analysisTime = Date.now() - startTime;

  return {
    prompt: systemPrompt,
    instructions: 'Generate an SVG icon based on the above context and return it in the specified format.',
    processing_info: {
      references_processed: svgReferences.length,
      style_applied: styleName || null,
      analysis_time_ms: analysisTime
    }
  };
}