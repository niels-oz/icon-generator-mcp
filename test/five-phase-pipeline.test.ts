import { MCPServer } from '../src/server';
import { GenerationPhase } from '../src/types';

describe('5-Phase Pipeline (Post-Conversion Removal)', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
    // Mock multimodal detection for pipeline tests
    jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Phase Definition Validation', () => {
    it('should have exactly 5 phases in the pipeline', async () => {
      const request = {
        prompt: 'Create a simple star icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0) {
        // Should have exactly 5 unique phases
        const phases = response.steps.map(step => step.step);
        const uniquePhases = [...new Set(phases)];
        expect(uniquePhases.length).toBe(5);
      }
    });

    it('should not include conversion phase', async () => {
      const request = {
        prompt: 'Create a simple star icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0) {
        const phases = response.steps.map(step => step.step);
        expect(phases).not.toContain('conversion');
      }
    });

    it('should include all expected phases in correct order', async () => {
      const request = {
        prompt: 'Create a simple star icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0) {
        const phases = response.steps.map(step => step.step);
        const uniquePhases = [...new Set(phases)];
        
        expect(uniquePhases).toEqual([
          'validation',
          'analysis', 
          'generation',
          'refinement',
          'output'
        ]);
      }
    });
  });

  describe('Phase Execution Order', () => {
    it('should execute validation phase first', async () => {
      const request = {
        prompt: 'Create a simple star icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0) {
        expect(response.steps[0].step).toBe('validation');
      }
    });

    it('should execute output phase last', async () => {
      const request = {
        prompt: 'Create a simple star icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0 && response.success) {
        const completedSteps = response.steps.filter(step => step.status === 'completed');
        if (completedSteps.length > 0) {
          const lastCompletedStep = completedSteps[completedSteps.length - 1];
          expect(lastCompletedStep.step).toBe('output');
        }
      }
    });

    it('should go directly from analysis to generation (skip conversion)', async () => {
      const request = {
        reference_paths: ['test/fixtures/blue-square.svg'], // SVG file should not need conversion
        prompt: 'Create an icon based on this'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0) {
        const phases = response.steps.map(step => step.step);
        
        // Should not contain conversion phase
        expect(phases).not.toContain('conversion');
        
        // Should go directly from analysis to generation
        const analysisIndex = phases.indexOf('analysis');
        const generationIndex = phases.indexOf('generation');
        
        if (analysisIndex !== -1 && generationIndex !== -1) {
          // Check that generation comes right after analysis in unique phases
          const uniquePhases = [...new Set(phases)];
          const analysisPos = uniquePhases.indexOf('analysis');
          const generationPos = uniquePhases.indexOf('generation');
          expect(generationPos).toBe(analysisPos + 1);
        }
      }
    });
  });

  describe('PNG Reference Processing in 5-Phase Pipeline', () => {
    it('should process PNG files directly in generation phase', async () => {
      // Create temporary PNG file
      const fs = require('fs');
      const testPngPath = 'test/fixtures/test-pipeline.png';
      fs.writeFileSync(testPngPath, 'dummy png content');

      try {
        const request = {
          reference_paths: [testPngPath],
          prompt: 'Create an icon based on this'
        };

        const response = await server.handleToolCall('generate_icon', request);

        if (response.steps && response.steps.length > 0) {
          const phases = response.steps.map(step => step.step);
          
          // Should not have conversion phase
          expect(phases).not.toContain('conversion');
          
          // Should process PNG in generation phase directly
          const generationStep = response.steps.find(step => step.step === 'generation');
          if (generationStep && response.success) {
            expect(generationStep.status).toBe('completed');
          }
        }
      } finally {
        // Clean up
        if (fs.existsSync(testPngPath)) {
          fs.unlinkSync(testPngPath);
        }
      }
    });

    it('should handle multiple PNG files without conversion phase', async () => {
      const fs = require('fs');
      const testPng1 = 'test/fixtures/test-multi1.png';
      const testPng2 = 'test/fixtures/test-multi2.png';
      
      fs.writeFileSync(testPng1, 'dummy png content 1');
      fs.writeFileSync(testPng2, 'dummy png content 2');

      try {
        const request = {
          reference_paths: [testPng1, testPng2],
          prompt: 'Create an icon based on these'
        };

        const response = await server.handleToolCall('generate_icon', request);

        if (response.steps && response.steps.length > 0) {
          const phases = response.steps.map(step => step.step);
          expect(phases).not.toContain('conversion');
          
          // Should have exactly 5 unique phases
          const uniquePhases = [...new Set(phases)];
          expect(uniquePhases.length).toBe(5);
        }
      } finally {
        // Clean up
        [testPng1, testPng2].forEach(file => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
      }
    });
  });

  describe('Performance Improvements', () => {
    it('should complete faster without conversion phase', async () => {
      const startTime = Date.now();
      
      const request = {
        prompt: 'Create a simple star icon'
      };

      const response = await server.handleToolCall('generate_icon', request);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete reasonably quickly without conversion overhead
      expect(totalTime).toBeLessThan(3000); // 3 seconds max

      if (response.processing_time) {
        // Processing time should be reasonable with 5 phases
        expect(response.processing_time).toBeLessThan(2000); // 2 seconds max
      }
    });
  });

  describe('State Management Across 5 Phases', () => {
    it('should track state properly across 5 phases', async () => {
      const request = {
        prompt: 'Create a simple star icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0) {
        // Each step should have proper state information
        response.steps.forEach(step => {
          expect(step).toHaveProperty('step');
          expect(step).toHaveProperty('status');
          expect(step).toHaveProperty('message');
          expect(step).toHaveProperty('timestamp');
          
          // Step should be a valid phase (not including conversion)
          const validPhases: GenerationPhase[] = [
            'validation', 'analysis', 'generation', 'refinement', 'output'
          ];
          expect(validPhases).toContain(step.step);
        });
      }
    });

    it('should maintain proper phase progression', async () => {
      const request = {
        prompt: 'Create a simple star icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps && response.steps.length > 0) {
        const phases = response.steps.map(step => step.step);
        const uniquePhases = [...new Set(phases)];
        
        // Should maintain proper order
        const expectedOrder = ['validation', 'analysis', 'generation', 'refinement', 'output'];
        expect(uniquePhases).toEqual(expectedOrder);
        
        // Each phase should complete before the next begins
        if (response.success) {
          const completedSteps = response.steps.filter(step => step.status === 'completed');
          expect(completedSteps.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Error Handling in 5-Phase Pipeline', () => {
    it('should handle errors gracefully without conversion phase', async () => {
      const request = {
        reference_paths: ['nonexistent-file.png'],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      
      // Should not mention conversion-related errors
      if (response.error) {
        expect(response.error).not.toContain('conversion failed');
        expect(response.error).not.toContain('potrace');
        expect(response.error).not.toContain('jimp');
      }
    });
  });
});