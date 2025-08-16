import { MCPServer } from '../src/server';
import * as fs from 'fs';
import { TEST_PATHS, TEST_PROMPTS } from './test-constants';

describe('Generation Pipeline Integration', () => {
  let server: MCPServer;
  const testPngPath = TEST_PATHS.OUTPUT.TEMP_PNG;
  const testSvgPath = TEST_PATHS.FIXTURES.SVG_FILE;

  beforeEach(() => {
    server = new MCPServer();
    
    // Create temporary PNG file for testing
    fs.writeFileSync(testPngPath, 'dummy png content for pipeline testing');
  });

  afterEach(() => {
    // Clean up temporary PNG file
    if (fs.existsSync(testPngPath)) {
      fs.unlinkSync(testPngPath);
    }
  });

  describe('5-Phase Pipeline Architecture', () => {
    it('should run the full 5-phase pipeline for a simple prompt', async () => {
      const request = {
        prompt: TEST_PROMPTS.SIMPLE
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(true);
      if (response.steps) {
        expect(response.steps).toHaveLength(5);
        const phaseNames = response.steps.map((s: any) => s.step);
        expect(phaseNames).toEqual(['validation', 'analysis', 'generation', 'refinement', 'output']);
      }
    });

    it('should not include the conversion phase', async () => {
      const request = {
        prompt: TEST_PROMPTS.SIMPLE
      };

      const response = await server.handleToolCall('generate_icon', request);

      if (response.steps) {
        const phaseNames = response.steps.map((s: any) => s.step);
        expect(phaseNames).not.toContain('conversion');
        expect(phaseNames).toHaveLength(5);
      }
    });

    it('should handle SVG references correctly through the pipeline', async () => {
      const request = {
        prompt: TEST_PROMPTS.SIMPLE,
        reference_paths: [testSvgPath]
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(true);
      
      if (response.steps) {
        // Validation should process the SVG file
        const validationStep = response.steps.find((s: any) => s.step === 'validation');
        if (validationStep) {
          expect(validationStep.message).toContain('Validated 1 input files');
        }
      }
    });

    it('should handle PNG references as visual context without conversion', async () => {
      // Mock multimodal LLM as available for this test
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(true);

      const request = {
        prompt: TEST_PROMPTS.SIMPLE,
        reference_paths: [testPngPath]
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(true);
      
      if (response.steps) {
        // Should not contain any conversion-related messages
        const allMessages = response.steps.map((s: any) => s.message).join(' ');
        expect(allMessages).not.toContain('converting');
        expect(allMessages).not.toContain('potrace');
        expect(allMessages).not.toContain('conversion');
        
        // Generation should use visual context approach
        const generationStep = response.steps.find((s: any) => s.step === 'generation');
        if (generationStep) {
          expect(generationStep.message).toContain('visual context');
        }
      }
    });

    it('should handle mixed PNG and SVG references', async () => {
      // Mock multimodal LLM as available for this test
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(true);

      const request = {
        prompt: TEST_PROMPTS.SIMPLE,
        reference_paths: [testPngPath, testSvgPath]
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(true);
      
      if (response.steps) {
        // Validation should process both files
        const validationStep = response.steps.find((s: any) => s.step === 'validation');
        if (validationStep) {
          expect(validationStep.message).toContain('Validated 2 input files');
        }
        
        // Generation should use mixed approach
        const generationStep = response.steps.find((s: any) => s.step === 'generation');
        if (generationStep) {
          expect(generationStep.message).toContain('visual context');
          expect(generationStep.message).toContain('text references');
        }
      }
    });

    it('should stop the pipeline and report an error if validation fails', async () => {
      const request = {
        prompt: TEST_PROMPTS.SIMPLE,
        reference_paths: ['/nonexistent/file.png']
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('File not found');
    });

    it('should produce a successful result with all expected outputs', async () => {
      const request = {
        prompt: TEST_PROMPTS.SIMPLE,
        output_name: 'test-pipeline-icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Icon generated successfully');
      if (response.output_path) {
        expect(response.output_path).toContain('test-pipeline-icon');
        expect(typeof response.processing_time).toBe('number');
        
        // Verify the generated file exists
        expect(fs.existsSync(response.output_path)).toBe(true);
        
        // Clean up generated file
        fs.unlinkSync(response.output_path);
      }
      
      if (response.steps) {
        expect(response.steps).toHaveLength(5);
      }
    });

    it('should handle errors gracefully and stop the pipeline', async () => {
      // Test with invalid prompt
      const request = {
        prompt: ''
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('prompt is required');
    });
  });
});