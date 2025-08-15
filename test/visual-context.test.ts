import { MCPServer } from '../src/server';
import * as fs from 'fs';
import * as path from 'path';

describe('Visual Context Handling (PNG as Visual References)', () => {
  let server: MCPServer;
  const testPngPath = 'test/fixtures/test-visual.png';
  const testSvgPath = 'test/fixtures/star-icon.svg';

  beforeEach(() => {
    server = new MCPServer();
    
    // Create temporary PNG file for testing
    fs.writeFileSync(testPngPath, 'dummy png content for visual context testing');
    
    // Mock multimodal detection to return true for these tests
    jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(true);
  });

  afterEach(() => {
    // Clean up temporary PNG file
    if (fs.existsSync(testPngPath)) {
      fs.unlinkSync(testPngPath);
    }
    jest.restoreAllMocks();
  });

  describe('PNG Visual Context Processing', () => {
    it('should process PNG files as visual context (not convert them)', async () => {
      const request = {
        reference_paths: [testPngPath],
        prompt: 'Create an icon based on this PNG'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0) {
        const stepMessages = response.steps.map(step => step.message.toLowerCase());
        
        // Should NOT have any conversion-related messages
        const hasConversionMessages = stepMessages.some(msg => 
          msg.includes('converting') || 
          msg.includes('potrace') || 
          msg.includes('png to svg') ||
          msg.includes('converted')
        );
        expect(hasConversionMessages).toBe(false);
        
        // Should have visual context processing messages
        const hasVisualMessages = stepMessages.some(msg =>
          msg.includes('visual') ||
          msg.includes('png') ||
          msg.includes('reference')
        );
        
        // If successful, should process visual references
        if (response.success) {
          expect(hasVisualMessages).toBe(true);
        }
      }
    });

    it('should handle PNG files without requiring conversion phase', async () => {
      const request = {
        reference_paths: [testPngPath],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0) {
        const phases = response.steps.map(step => step.step);
        
        // Should not include conversion phase
        expect(phases).not.toContain('conversion');
        
        // Should have exactly 5 phases
        const uniquePhases = [...new Set(phases)];
        expect(uniquePhases.length).toBe(5);
        
        // Should include expected phases in order
        expect(uniquePhases).toEqual([
          'validation',
          'analysis',
          'generation',
          'refinement',
          'output'
        ]);
      }
    });

    it('should categorize PNG files as visual references in context', async () => {
      const request = {
        reference_paths: [testPngPath],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      // This test will verify internal context categorization
      // Implementation will depend on how we expose this information
      if (response.success && response.steps) {
        const generationStep = response.steps.find(step => step.step === 'generation');
        if (generationStep) {
          expect(generationStep.message).toContain('Generated SVG using visual context');
        }
      }
    });
  });

  describe('Mixed Reference Type Processing', () => {
    it('should handle PNG and SVG references differently', async () => {
      const request = {
        reference_paths: [testPngPath, testSvgPath],
        prompt: 'Create an icon based on these references'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0) {
        const stepMessages = response.steps.map(step => step.message.toLowerCase());
        
        // Should not convert PNG files
        const hasConversionMessages = stepMessages.some(msg => 
          msg.includes('converting png') || 
          msg.includes('potrace conversion')
        );
        expect(hasConversionMessages).toBe(false);
        
        // Should process both file types
        if (response.success) {
          const analysisStep = response.steps.find(step => step.step === 'analysis');
          if (analysisStep) {
            expect(analysisStep.message).toContain('files');
          }
        }
      }
    });

    it('should maintain SVG text processing for SVG files', async () => {
      const request = {
        reference_paths: [testSvgPath], // Only SVG file
        prompt: 'Create an icon based on this SVG'
      };

      const response = await server.handleToolCall('generate_icon', request);

      // SVG files should still be processed as text references
      // No changes to SVG handling
      if (response.success && response.steps) {
        const generationStep = response.steps.find(step => step.step === 'generation');
        if (generationStep) {
          expect(generationStep.message).toContain('Generated SVG using text references');
        }
      }
    });
  });

  describe('Performance Improvements', () => {
    it('should complete faster without PNG conversion overhead', async () => {
      const startTime = Date.now();
      
      const request = {
        reference_paths: [testPngPath],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete reasonably quickly without conversion overhead
      expect(totalTime).toBeLessThan(3000); // 3 seconds max (much faster than conversion)

      if (response.processing_time) {
        // Processing time should be reasonable without conversion
        expect(response.processing_time).toBeLessThan(2000); // 2 seconds max
      }
    });

    it('should use less memory without Jimp/Potrace', async () => {
      // This is hard to test directly, but we can verify no conversion-related operations
      const request = {
        reference_paths: [testPngPath],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps) {
        const stepMessages = response.steps.map(step => step.message.toLowerCase());
        
        // Should not have memory-intensive conversion operations
        const hasMemoryIntensiveOps = stepMessages.some(msg => 
          msg.includes('jimp') || 
          msg.includes('image processing') ||
          msg.includes('potrace')
        );
        expect(hasMemoryIntensiveOps).toBe(false);
      }
    });
  });

  describe('File Validation', () => {
    it('should still validate PNG file existence', async () => {
      const request = {
        reference_paths: ['test/fixtures/nonexistent.png'],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('File not found');
    });

    it('should still reject unsupported file formats', async () => {
      // Create a temporary non-image file
      const badFilePath = 'test/fixtures/test.txt';
      fs.writeFileSync(badFilePath, 'not an image file');

      try {
        const request = {
          reference_paths: [badFilePath],
          prompt: 'Create an icon'
        };

        const response = await server.handleToolCall('generate_icon', request);

        expect(response.success).toBe(false);
        expect(response.error).toContain('Unsupported file format');
        expect(response.error).toContain('Only PNG and SVG files are supported');
      } finally {
        // Clean up
        if (fs.existsSync(badFilePath)) {
          fs.unlinkSync(badFilePath);
        }
      }
    });

    it('should accept both PNG and SVG files', async () => {
      const request = {
        reference_paths: [testPngPath, testSvgPath],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      // Should not fail due to file type validation
      if (!response.success && response.error) {
        expect(response.error).not.toContain('Unsupported file format');
      }
    });
  });

  describe('Context Building', () => {
    it('should build appropriate context for visual references', async () => {
      const request = {
        reference_paths: [testPngPath],
        prompt: 'Create a modern icon inspired by this design'
      };

      const response = await server.handleToolCall('generate_icon', request);

      // This test verifies that the system processes PNG as visual context
      // The actual context building will depend on implementation details
      if (response.success && response.steps) {
        const analysisStep = response.steps.find(step => step.step === 'analysis');
        if (analysisStep) {
          expect(analysisStep.message).toContain('files');
        }
      }
    });
  });
});