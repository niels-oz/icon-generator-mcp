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
  synonyms: string[];
  status: 'supported' | 'experimental' | 'deprecated';
  priority: number;
}

export const STYLE_CONFIGS: Record<string, StyleConfig> = {
  'black-white-flat': {
    name: 'Black & White Flat',
    description: 'Simple flat icons with black outlines on white background, minimal details, clean geometric shapes',
    promptTemplate: 'Create a {topic} icon in black and white with simple flat design. {content}. Use only black outlines on white background, minimal details, clean geometric shapes.',
    synonyms: ['monochrome', 'black & white icons', 'line art', 'binary color', 'contrast icons', 'stark flat', 'black-white-flat', 'black white flat'],
    status: 'supported',
    priority: 1,
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
  },
  'material-design': {
    name: 'Material Design',
    description: 'Bold geometric shapes with filled forms, no outlines, minimal detail',
    promptTemplate: 'Create a {topic} icon in Material Design. {content}. Solid black fill, no strokes. 24x24 viewBox, 20x20 safe area. Geometric primitives only. 2dp corner radius on outer shape.',
    synonyms: ['material-design', 'material design', 'google icons', 'material you', 'material symbols', 'material', 'google material', 'md icons'],
    status: 'supported',
    priority: 2,
    examples: [
      {
        prompt: 'Create a heart icon in Material Design. Classic heart shape for favorites. Solid black fill, no strokes. 24x24 viewBox, 20x20 safe area. Geometric primitives only. 2dp corner radius on outer shape.',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
  <path d="M12 20 
           C8 16, 4 12, 4 8 
           C4 5, 6 3, 9 3 
           C10.5 3, 12 4, 12 6
           C12 4, 13.5 3, 15 3
           C18 3, 20 5, 20 8
           C20 12, 16 16, 12 20 Z" />
</svg>`,
        description: 'Symmetric curved path forming heart, centered in 20x20 area'
      },
      {
        prompt: 'Create a settings icon in Material Design. Gear with teeth for configuration. Solid black fill, no strokes. 24x24 viewBox, 20x20 safe area. Geometric primitives only. 2dp corner radius on outer shape.',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
  <circle cx="12" cy="12" r="8.925" />
  <rect x="8.75" y="-1" width="6.5" height="8" />
  <rect x="8.75" y="17" width="6.5" height="8" />
  <rect x="8.75" y="-1" width="6.5" height="8" transform="rotate(60 12 12)" />
  <rect x="8.75" y="-1" width="6.5" height="8" transform="rotate(120 12 12)" />
  <rect x="8.75" y="-1" width="6.5" height="8" transform="rotate(240 12 12)" />
  <rect x="8.75" y="-1" width="6.5" height="8" transform="rotate(300 12 12)" />
  <circle cx="12" cy="12" r="3.5" fill="white" />
</svg>`,
        description: 'Circle center with 6 rectangular teeth at 60° intervals, white center hole'
      },
      {
        prompt: 'Create a user icon in Material Design. Person silhouette with head and shoulders. Solid black fill, no strokes. 24x24 viewBox, 20x20 safe area. Geometric primitives only. 2dp corner radius on outer shape.',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
  <circle cx="12" cy="8" r="4" />
  <rect x="4" y="14" width="16" height="6" rx="8" />
  <rect x="4" y="17" width="16" height="3" />
</svg>`,
        description: 'Circle (head) above two-part body (curved shoulders + straight torso)'
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