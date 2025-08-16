import { MCPServer } from '../src/server';
import * as fs from 'fs';
import { TEST_PATHS, TEST_PROMPTS, TEST_LLM_RESPONSES } from './test-constants';

describe('Multimodal LLM Detection and Handling', () => {
  let server: MCPServer;
  const testPngPath = TEST_PATHS.OUTPUT.TEMP_PNG;
  const testSvgPath = TEST_PATHS.FIXTURES.SVG_FILE;

  beforeEach(() => {
    server = new MCPServer();
    
    // Create temporary PNG file for testing
    fs.writeFileSync(testPngPath, 'dummy png content for multimodal testing');
  });

  afterEach(() => {
    // Clean up temporary PNG file
    if (fs.existsSync(testPngPath)) {
      fs.unlinkSync(testPngPath);
    }
  });

  describe('Multimodal Capability Detection', () => {
    it('should detect multimodal LLM availability', () => {
      const hasMultimodal = server.isMultimodalLLMAvailable();
      expect(typeof hasMultimodal).toBe('boolean');
    });

    it('should provide clear error when PNG used with non-multimodal LLM', async () => {
      // Mock the multimodal detection to return false
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        reference_paths: [testPngPath],
        prompt: TEST_PROMPTS.SIMPLE
      };

      const response = await server.handleToolCall('prepare_icon_context', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain(TEST_LLM_RESPONSES.ERROR_MESSAGES.PNG_NOT_SUPPORTED);
      expect(response.error).toContain('Claude Code');
      expect(response.error).toContain('Gemini Pro Vision');
      expect(response.error).toContain('GPT-4 Vision');
      expect(response.error).toContain('Using SVG reference files instead');
    });

    it('should allow PNG files when multimodal LLM is available', async () => {
      // Mock the multimodal detection to return true
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(true);

      const request = {
        reference_paths: [testPngPath],
        prompt: TEST_PROMPTS.SIMPLE
      };

      const response = await server.handleToolCall('prepare_icon_context', request);

      expect(response).toHaveProperty('expert_prompt');
    });
  });

  describe('Mixed Reference Type Handling', () => {
    it('should handle mixed PNG and SVG references correctly', async () => {
      // Mock the multimodal detection to return true
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(true);

      const request = {
        reference_paths: [testPngPath, testSvgPath],
        prompt: TEST_PROMPTS.SIMPLE
      };

      const response = await server.handleToolCall('prepare_icon_context', request);

      expect(response).toHaveProperty('expert_prompt');
      
      // Should handle both types appropriately
      if (response.steps) {
        const generationStep = response.steps.find((s: any) => s.step === 'generation');
        if (generationStep) {
          expect(generationStep.message).toContain('visual context');
          expect(generationStep.message).toContain('text references');
        }
      }
    });

    it('should reject PNG in mixed references when non-multimodal', async () => {
      // Mock the multimodal detection to return false
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        reference_paths: [testPngPath, testSvgPath],
        prompt: TEST_PROMPTS.SIMPLE
      };

      const response = await server.handleToolCall('prepare_icon_context', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain(TEST_LLM_RESPONSES.ERROR_MESSAGES.PNG_NOT_SUPPORTED);
    });

    it('should allow SVG-only references regardless of LLM type', async () => {
      // Test with non-multimodal LLM
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        reference_paths: [testSvgPath],
        prompt: TEST_PROMPTS.SIMPLE
      };

      const response = await server.handleToolCall('prepare_icon_context', request);

      expect(response).toHaveProperty('expert_prompt');
    });
  });

  describe('Fallback Handling', () => {
    it('should work with prompt-only regardless of LLM type', async () => {
      // Test with non-multimodal LLM
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        prompt: TEST_PROMPTS.SIMPLE
      };

      const response = await server.handleToolCall('prepare_icon_context', request);

      expect(response).toHaveProperty('expert_prompt');
    });

    it('should provide comprehensive error message with helpful alternatives', async () => {
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        reference_paths: [testPngPath],
        prompt: TEST_PROMPTS.SIMPLE
      };

      const response = await server.handleToolCall('prepare_icon_context', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('You can still use this tool by');
      expect(response.error).toContain('Converting PNG to SVG');
      expect(response.error).toContain('Using SVG reference files');
      expect(response.error).toContain('prompt-only generation');
    });
  });
});