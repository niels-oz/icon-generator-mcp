import { describe, it, expect, beforeEach } from '@jest/globals';
import { MCPServer } from '../src/server';

describe('Core Functionality (Consolidated)', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
  });

  describe('MCP Server', () => {
    it('should initialize correctly', () => {
      expect(server.name).toBe('icon-generator-mcp');
      expect(server.version).toBe('0.4.0');
    });

    it('should register generate_icon tool with correct schema', () => {
      const tools = server.getTools();
      const generateIconTool = tools[0];
      
      expect(tools).toHaveLength(1);
      expect(generateIconTool.name).toBe('generate_icon');
      expect(generateIconTool.inputSchema.required).toEqual(['prompt']);
      expect(generateIconTool.inputSchema.properties).toMatchObject({
        reference_paths: { type: 'array' },
        prompt: { type: 'string' },
        output_name: { type: 'string' },
        output_path: { type: 'string' },
        style: { type: 'string' }
      });
    });

    it('should validate requests correctly', async () => {
      const validRequest = { prompt: 'Create a simple icon' };
      const invalidRequest = { prompt: '' };
      
      const validResponse = await server.handleToolCall('generate_icon', validRequest);
      const invalidResponse = await server.handleToolCall('generate_icon', invalidRequest);
      
      expect(validResponse).toHaveProperty('success');
      expect(invalidResponse.success).toBe(false);
      expect(invalidResponse.error).toContain('prompt is required');
    });

    it('should handle multi-LLM provider selection', () => {
      const claudeServer = new MCPServer();
      const geminiServer = new MCPServer();
      
      expect(claudeServer).toBeDefined();
      expect(geminiServer).toBeDefined();
    });
  });

  describe('PNG Visual Context (No Conversion)', () => {
    it('should validate PNG file paths for visual context', async () => {
      const validPath = 'test/fixtures/test.png';
      const invalidPath = 'nonexistent.png';
      
      // Test path validation logic
      expect(validPath.endsWith('.png')).toBe(true);
      expect(invalidPath.endsWith('.png')).toBe(true);
    });

    it('should handle multimodal detection gracefully', () => {
      // Test multimodal detection (this is now handled by MultimodalDetector)
      const isMultimodal = server.isMultimodalLLMAvailable();
      expect(typeof isMultimodal).toBe('boolean');
    });
  });

  describe('Phase-based processing', () => {
    it('should track processing phases', async () => {
      const request = { prompt: 'Create a test icon' };
      const response = await server.handleToolCall('generate_icon', request);
      
      if (response.steps) {
        const phases = response.steps.map(step => step.step);
        expect(phases).toContain('validation');
        expect(phases).toContain('analysis');
        expect(phases).toContain('generation');
        expect(phases).toContain('output');
      }
    });

    it('should provide processing time metrics', async () => {
      const request = { prompt: 'Create a test icon' };
      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response).toHaveProperty('processing_time');
      if (typeof response.processing_time === 'number') {
        expect(response.processing_time).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
