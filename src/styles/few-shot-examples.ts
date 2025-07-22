export interface FewShotExample {
  prompt: string;
  svg: string;
  description: string;
}

export interface StyleConfig {
  name: string;
  description: string;
  examples: FewShotExample[];
  promptTemplate: string;
}

export const STYLE_CONFIGS: Record<string, StyleConfig> = {
  'black-white-flat': {
    name: 'Black & White Flat',
    description: 'Simple flat icons with black outlines on white background, minimal details, clean geometric shapes',
    promptTemplate: 'Create a {topic} icon in black and white with simple flat design. {content}. Use only black outlines on white background, minimal details, clean geometric shapes.',
    examples: [
      {
        prompt: 'Create a code review icon in black and white with simple flat design. Show a document with code lines and a checkmark overlay. Use only black outlines on white background, minimal details, clean geometric shapes.',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- Document background -->
  <rect x="3" y="2" width="14" height="18" rx="1" fill="white" stroke="black"/>
  
  <!-- Code lines -->
  <line x1="6" y1="6" x2="12" y2="6" stroke="black" stroke-width="1"/>
  <line x1="6" y1="8" x2="10" y2="8" stroke="black" stroke-width="1"/>
  <line x1="6" y1="10" x2="13" y2="10" stroke="black" stroke-width="1"/>
  <line x1="6" y1="12" x2="9" y2="12" stroke="black" stroke-width="1"/>
  <line x1="6" y1="14" x2="11" y2="14" stroke="black" stroke-width="1"/>
  <line x1="6" y1="16" x2="8" y2="16" stroke="black" stroke-width="1"/>
  
  <!-- Checkmark circle -->
  <circle cx="18" cy="6" r="4" fill="white" stroke="black" stroke-width="2"/>
  
  <!-- Checkmark -->
  <path d="m16 6 1.5 1.5 3-3" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
        description: 'Document with code lines and checkmark overlay'
      },
      {
        prompt: 'Create a code review icon in black and white with simple flat design. Show a magnifying glass examining code or document lines. Use only black outlines on white background, geometric shapes, no gradients or shadows.',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Document/Code background -->
  <rect x="2" y="3" width="14" height="18" rx="2" fill="white" stroke="black"/>
  
  <!-- Code lines -->
  <line x1="4" y1="6" x2="12" y2="6" stroke="black" stroke-width="1.5"/>
  <line x1="4" y1="9" x2="14" y2="9" stroke="black" stroke-width="1.5"/>
  <line x1="4" y1="12" x2="10" y2="12" stroke="black" stroke-width="1.5"/>
  <line x1="4" y1="15" x2="13" y2="15" stroke="black" stroke-width="1.5"/>
  <line x1="4" y1="18" x2="8" y2="18" stroke="black" stroke-width="1.5"/>
  
  <!-- Magnifying glass -->
  <circle cx="17" cy="13" r="4" fill="white" stroke="black" stroke-width="2"/>
  <line x1="20" y1="16" x2="22" y2="18" stroke="black" stroke-width="2"/>
</svg>`,
        description: 'Magnifying glass examining code/document lines'
      },
      {
        prompt: 'Create a code review icon in black and white with simple flat design. Show two overlapping documents representing before/after or comparison. Use only black outlines on white background, simple geometric forms.',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Back document -->
  <rect x="3" y="4" width="12" height="16" rx="1" fill="white" stroke="black"/>
  <line x1="5" y1="7" x2="13" y2="7" stroke="black"/>
  <line x1="5" y1="9" x2="11" y2="9" stroke="black"/>
  <line x1="5" y1="11" x2="13" y2="11" stroke="black"/>
  <line x1="5" y1="13" x2="9" y2="13" stroke="black"/>
  
  <!-- Front document -->
  <rect x="9" y="2" width="12" height="16" rx="1" fill="white" stroke="black"/>
  <line x1="11" y1="5" x2="19" y2="5" stroke="black"/>
  <line x1="11" y1="7" x2="17" y2="7" stroke="black"/>
  <line x1="11" y1="9" x2="19" y2="9" stroke="black"/>
  <line x1="11" y1="11" x2="15" y2="11" stroke="black"/>
  
  <!-- Comparison arrow -->
  <path d="m7 16 2-2-2-2" stroke="black" fill="none"/>
</svg>`,
        description: 'Two overlapping documents with comparison arrow'
      }
    ]
  }
};

export function getStyleConfig(styleName: string): StyleConfig | undefined {
  return STYLE_CONFIGS[styleName];
}

export function getAllStyleNames(): string[] {
  return Object.keys(STYLE_CONFIGS);
}