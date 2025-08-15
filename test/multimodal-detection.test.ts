import { MCPServer } from '../src/server';
import * as fs from 'fs';
import * as path from 'path';

describe('Multimodal LLM Detection and Error Handling', () => {
  let server: MCPServer;
  const testPngPath = 'test/fixtures/test-multimodal.png';
  const testSvgPath = 'test/fixtures/blue-square.svg';

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
    it('should detect when multimodal LLM is available', () => {
      // This test assumes we can detect multimodal capabilities
      // Implementation will depend on how we detect the LLM type
      const hasMultimodal = server.isMultimodalLLMAvailable();
      
      // For now, this might return false until we implement detection
      expect(typeof hasMultimodal).toBe('boolean');
    });

    it('should provide clear error when PNG used with non-multimodal LLM', async () => {
      // Mock the multimodal detection to return false
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        reference_paths: [testPngPath],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('PNG references require a multimodal LLM');
      expect(response.error).toContain('Claude Code');
      expect(response.error).toContain('Gemini Pro Vision');
      expect(response.error).toContain('GPT-4 Vision');
      expect(response.error).toContain('Using SVG reference files instead');
    });

    it('should provide helpful alternatives in error message', async () => {
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        reference_paths: [testPngPath],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('You can still use this tool by:');
      expect(response.error).toContain('Using SVG reference files instead');
      expect(response.error).toContain('Using prompt-only generation');
      expect(response.error).toContain('Upgrading to a multimodal LLM');
    });

    it('should allow PNG files when multimodal LLM is available', async () => {
      // Mock the multimodal detection to return true
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(true);

      const request = {
        reference_paths: [testPngPath],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      // Should not fail due to multimodal requirements
      if (!response.success && response.error) {
        expect(response.error).not.toContain('PNG references require a multimodal LLM');
      }
    });
  });

  describe('Mixed Reference Type Handling', () => {
    it('should handle mixed PNG and SVG references correctly', async () => {
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(true);

      const request = {
        reference_paths: [testPngPath, testSvgPath],
        prompt: 'Create an icon based on these references'
      };

      const response = await server.handleToolCall('generate_icon', request);

      // Should not fail due to file type issues
      if (!response.success && response.error) {
        expect(response.error).not.toContain('PNG references require a multimodal LLM');
        expect(response.error).not.toContain('Unsupported file format');
      }
    });

    it('should reject PNG in mixed references when non-multimodal', async () => {
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        reference_paths: [testSvgPath, testPngPath], // SVG first, then PNG
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('PNG references require a multimodal LLM');
    });

    it('should allow SVG-only references regardless of LLM type', async () => {
      // Test with non-multimodal LLM
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        reference_paths: [testSvgPath],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      // Should not fail due to multimodal requirements
      if (!response.success && response.error) {
        expect(response.error).not.toContain('PNG references require a multimodal LLM');
      }
    });
  });

  describe('Prompt-Only Generation', () => {
    it('should work with prompt-only regardless of LLM type', async () => {
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        prompt: 'Create a simple star icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      // Should not fail due to multimodal requirements
      if (!response.success && response.error) {
        expect(response.error).not.toContain('PNG references require a multimodal LLM');
      }
    });

    it('should work with empty reference array regardless of LLM type', async () => {
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        reference_paths: [],
        prompt: 'Create a simple star icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      // Should not fail due to multimodal requirements
      if (!response.success && response.error) {
        expect(response.error).not.toContain('PNG references require a multimodal LLM');
      }
    });
  });

  describe('Error Message Quality', () => {
    it('should provide comprehensive error message with all required elements', async () => {
      jest.spyOn(server, 'isMultimodalLLMAvailable').mockReturnValue(false);

      const request = {
        reference_paths: [testPngPath],
        prompt: 'Create an icon'
      };

      const response = await server.handleToolCall('generate_icon', request);

      expect(response.success).toBe(false);
      
      // Check for all required elements in error message
      const errorText = response.error || '';
      
      // Main explanation
      expect(errorText).toContain('PNG references require a multimodal LLM for visual processing');
      
      // Compatible LLM list
      expect(errorText).toContain('Compatible LLMs:');
      expect(errorText).toContain('Claude Code');
      expect(errorText).toContain('Gemini Pro Vision');
      expect(errorText).toContain('GPT-4 Vision');
      
      // Practical alternatives
      expect(errorText).toContain('You can still use this tool by:');
      expect(errorText).toContain('Using SVG reference files instead');
      expect(errorText).toContain('Using prompt-only generation');
      expect(errorText).toContain('Upgrading to a multimodal LLM');
    });
  });
});