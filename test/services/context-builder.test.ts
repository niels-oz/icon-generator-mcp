import { buildGenerationContext, GenerationContext } from '../../src/context-builder';

describe('Context Builder Service', () => {
  describe('Basic Prompt Construction', () => {
    it('should build basic context for prompt-only generation', () => {
      const context = buildGenerationContext('Create a simple star icon');
      
      expect(context.prompt).toContain('You are an expert SVG icon designer');
      expect(context.prompt).toContain('Create a simple star icon');
      expect(context.prompt).toContain('FILENAME: [suggested-filename]');
      expect(context.prompt).toContain('SVG: [complete SVG code]');
      expect(context.instructions).toBe('Generate an SVG icon based on the above context and return it in the specified format.');
      expect(context.processing_info.references_processed).toBe(0);
      expect(context.processing_info.style_applied).toBe(null);
      expect(context.processing_info.analysis_time_ms).toBeGreaterThanOrEqual(0);
    });

    it('should include SVG requirements in prompt', () => {
      const context = buildGenerationContext('Test prompt');
      
      expect(context.prompt).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(context.prompt).toContain('viewBox attribute');
      expect(context.prompt).toContain('No script tags or dangerous elements');
      expect(context.prompt).toContain('kebab-case');
    });
  });

  describe('SVG Reference Processing', () => {
    it('should include SVG references in the prompt', () => {
      const svgReferences = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20"/></svg>'
      ];
      
      const context = buildGenerationContext('Create an icon', svgReferences);
      
      expect(context.prompt).toContain('Reference SVG icons:');
      expect(context.prompt).toContain('Reference 1:');
      expect(context.prompt).toContain('Reference 2:');
      expect(context.prompt).toContain('<circle cx="12" cy="12" r="10"/>');
      expect(context.prompt).toContain('<rect x="2" y="2" width="20" height="20"/>');
      expect(context.processing_info.references_processed).toBe(2);
    });

    it('should handle empty SVG references array', () => {
      const context = buildGenerationContext('Create an icon', []);
      
      expect(context.prompt).not.toContain('Reference SVG icons:');
      expect(context.processing_info.references_processed).toBe(0);
    });

    it('should handle single SVG reference', () => {
      const svgRef = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><star/></svg>';
      const context = buildGenerationContext('Create a star', [svgRef]);
      
      expect(context.prompt).toContain('Reference 1:');
      expect(context.prompt).not.toContain('Reference 2:');
      expect(context.prompt).toContain('<star/>');
      expect(context.processing_info.references_processed).toBe(1);
    });
  });

  describe('Style Configuration Integration', () => {
    it('should include style information when style is specified', () => {
      const context = buildGenerationContext('Create an icon', [], 'black-white-flat');
      
      expect(context.prompt).toContain('STYLE: Black & White Flat');
      expect(context.prompt).toContain('Here are examples of this style:');
      expect(context.prompt).toContain('Follow the exact same style');
      expect(context.prompt).toContain('CRITICALLY IMPORTANT: Follow the exact style');
      expect(context.processing_info.style_applied).toBe('black-white-flat');
    });

    it('should not include style information when no style specified', () => {
      const context = buildGenerationContext('Create an icon');
      
      expect(context.prompt).not.toContain('STYLE:');
      expect(context.prompt).not.toContain('Here are examples of this style:');
      expect(context.prompt).not.toContain('CRITICALLY IMPORTANT: Follow the exact style');
      expect(context.processing_info.style_applied).toBe(null);
    });

    it('should handle undefined style gracefully', () => {
      const context = buildGenerationContext('Create an icon', [], undefined);
      
      expect(context.processing_info.style_applied).toBe(null);
      expect(context.prompt).not.toContain('STYLE:');
    });
  });

  describe('Combined Context Building', () => {
    it('should combine prompt, references, and style correctly', () => {
      const svgReferences = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/></svg>'
      ];
      
      const context = buildGenerationContext(
        'Create a user profile icon', 
        svgReferences, 
        'black-white-flat'
      );
      
      // Should include all components
      expect(context.prompt).toContain('You are an expert SVG icon designer');
      expect(context.prompt).toContain('STYLE: Black & White Flat');
      expect(context.prompt).toContain('Reference SVG icons:');
      expect(context.prompt).toContain('Create a user profile icon');
      expect(context.prompt).toContain('<circle cx="12" cy="12" r="5"/>');
      
      // Processing info should reflect all inputs
      expect(context.processing_info.references_processed).toBe(1);
      expect(context.processing_info.style_applied).toBe('black-white-flat');
      expect(context.processing_info.analysis_time_ms).toBeGreaterThanOrEqual(0);
    });

    it('should maintain proper prompt structure with all components', () => {
      const context = buildGenerationContext(
        'Test prompt', 
        ['<svg>test</svg>'], 
        'black-white-flat'
      );
      
      const promptSections = context.prompt.split('\n\n');
      expect(promptSections.length).toBeGreaterThan(3); // Should have multiple sections
      
      // Verify order of sections
      expect(context.prompt.indexOf('You are an expert')).toBeLessThan(context.prompt.indexOf('STYLE:'));
      expect(context.prompt.indexOf('STYLE:')).toBeLessThan(context.prompt.indexOf('Reference SVG'));
      expect(context.prompt.indexOf('Reference SVG')).toBeLessThan(context.prompt.indexOf('User request:'));
    });
  });

  describe('Performance and Timing', () => {
    it('should measure analysis time correctly', () => {
      const startTime = Date.now();
      const context = buildGenerationContext('Test prompt');
      const endTime = Date.now();
      
      expect(context.processing_info.analysis_time_ms).toBeGreaterThanOrEqual(0);
      expect(context.processing_info.analysis_time_ms).toBeLessThanOrEqual(endTime - startTime + 10); // Small buffer for test timing
    });

    it('should handle large numbers of references efficiently', () => {
      const manyReferences = Array(50).fill('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><test/></svg>');
      
      const startTime = Date.now();
      const context = buildGenerationContext('Test prompt', manyReferences);
      const endTime = Date.now();
      
      expect(context.processing_info.references_processed).toBe(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(context.prompt).toContain('Reference 50:');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty prompt gracefully', () => {
      const context = buildGenerationContext('');
      
      expect(context.prompt).toContain('User request: ');
      expect(context.instructions).toBeDefined();
      expect(context.processing_info).toBeDefined();
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'Create an icon '.repeat(100);
      const context = buildGenerationContext(longPrompt);
      
      expect(context.prompt).toContain(longPrompt);
      expect(context.processing_info.analysis_time_ms).toBeGreaterThanOrEqual(0);
    });

    it('should handle special characters in prompts', () => {
      const specialPrompt = 'Create an icon with "quotes", <brackets>, & ampersands';
      const context = buildGenerationContext(specialPrompt);
      
      expect(context.prompt).toContain(specialPrompt);
    });

    it('should handle empty SVG references in array', () => {
      const referencesWithEmpty = ['<svg>valid</svg>', '', '<svg>another</svg>'];
      const context = buildGenerationContext('Test', referencesWithEmpty);
      
      expect(context.prompt).toContain('Reference 1:');
      expect(context.prompt).toContain('Reference 2:');
      expect(context.prompt).toContain('Reference 3:');
      expect(context.processing_info.references_processed).toBe(3);
    });
  });
});