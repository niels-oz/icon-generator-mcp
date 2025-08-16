import { buildGenerationContext } from '../../src/context-builder';
import { TEST_PROMPTS, TEST_SVG_CONTENT } from '../test-constants';

describe('Context Builder Service', () => {
  describe('Core Prompt Construction Behaviors', () => {
    it('should build a basic generation context for a simple prompt', () => {
      const context = buildGenerationContext(TEST_PROMPTS.SIMPLE);
      
      expect(context.prompt).toContain('You are an expert SVG icon designer');
      expect(context.prompt).toContain(TEST_PROMPTS.SIMPLE);
      expect(context.prompt).toContain('FILENAME: [suggested-filename]');
      expect(context.prompt).toContain('SVG: [complete SVG code]');
      expect(context.prompt).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(context.prompt).toContain('viewBox attribute');
      expect(context.prompt).toContain('No script tags or dangerous elements');
      expect(context.instructions).toBe('Generate an SVG icon based on the above context and return it in the specified format.');
      expect(context.processing_info.references_processed).toBe(0);
      expect(context.processing_info.style_applied).toBe(null);
      expect(context.processing_info.analysis_time_ms).toBeGreaterThanOrEqual(0);
    });

    it('should correctly add SVG reference content to the context', () => {
      const svgReferences = [TEST_SVG_CONTENT.SIMPLE_CIRCLE, TEST_SVG_CONTENT.SIMPLE_RECT];
      
      const context = buildGenerationContext(TEST_PROMPTS.SIMPLE, svgReferences);
      
      expect(context.prompt).toContain('Reference SVG icons:');
      expect(context.prompt).toContain('Reference 1:');
      expect(context.prompt).toContain('Reference 2:');
      expect(context.prompt).toContain('<circle cx="12" cy="12" r="10"/>');
      expect(context.prompt).toContain('<rect x="2" y="2" width="20" height="20"/>');
      expect(context.processing_info.references_processed).toBe(2);
    });

    it('should correctly add style-based few-shot examples to the context', () => {
      const context = buildGenerationContext(TEST_PROMPTS.SIMPLE, [], 'black-white-flat');
      
      expect(context.prompt).toContain('STYLE: Black & White Flat');
      expect(context.prompt).toContain('Here are examples of this style:');
      expect(context.prompt).toContain('Follow the exact same style');
      expect(context.prompt).toContain('CRITICALLY IMPORTANT: Follow the exact style');
      expect(context.processing_info.style_applied).toBe('black-white-flat');
    });

    it('should handle a combination of prompt, SVG references, and style', () => {
      const svgReferences = [TEST_SVG_CONTENT.SIMPLE_CIRCLE];
      
      const context = buildGenerationContext(
        TEST_PROMPTS.COMPLEX, 
        svgReferences, 
        'black-white-flat'
      );
      
      // Should include all components in proper order
      expect(context.prompt.indexOf('You are an expert')).toBeLessThan(context.prompt.indexOf('STYLE:'));
      expect(context.prompt.indexOf('STYLE:')).toBeLessThan(context.prompt.indexOf('Reference SVG'));
      expect(context.prompt.indexOf('Reference SVG')).toBeLessThan(context.prompt.indexOf('User request:'));
      
      // Should contain all expected content
      expect(context.prompt).toContain('STYLE: Black & White Flat');
      expect(context.prompt).toContain('Reference SVG icons:');
      expect(context.prompt).toContain(TEST_PROMPTS.COMPLEX);
      expect(context.prompt).toContain('<circle cx="12" cy="12" r="10"/>');
      
      // Processing info should reflect all inputs
      expect(context.processing_info.references_processed).toBe(1);
      expect(context.processing_info.style_applied).toBe('black-white-flat');
    });

    it('should include critical instructions and formatting requirements', () => {
      const context = buildGenerationContext(TEST_PROMPTS.SIMPLE);
      
      // Verify required instructions are present
      expect(context.prompt).toContain('Please generate:');
      expect(context.prompt).toContain('1. A clean SVG icon');
      expect(context.prompt).toContain('2. A descriptive filename');
      expect(context.prompt).toContain('Requirements:');
      expect(context.prompt).toContain('Use proper SVG namespace');
      expect(context.prompt).toContain('Include viewBox attribute');
      expect(context.prompt).toContain('Use clean, optimized SVG code');
      expect(context.prompt).toContain('No script tags or dangerous elements');
      expect(context.prompt).toContain('Filename should be descriptive and kebab-case');
    });

    it('should correctly categorize visual (PNG) and text (SVG) references', () => {
      // This test validates that context builder is ready for the visual context architecture
      // Even though context-builder currently only handles SVG text references,
      // this test ensures the interface is consistent with the visual context paradigm
      
      const svgReferences = [TEST_SVG_CONTENT.SIMPLE_STAR];
      const context = buildGenerationContext(TEST_PROMPTS.SIMPLE, svgReferences);
      
      // SVG content should be included as text
      expect(context.prompt).toContain('Reference SVG icons:');
      expect(context.prompt).toContain('<polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/>');
      
      // Note: PNG visual context handling is done at the server level, not in context-builder
      // This test validates that SVG text references are properly handled
      expect(context.processing_info.references_processed).toBe(1);
    });
  });
});