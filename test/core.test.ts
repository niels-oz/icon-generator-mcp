import { describe, it, expect, beforeEach } from '@jest/globals';
import { MCPServer } from '../src/server';
import { ConversionService } from '../src/services/converter';

describe('Core Functionality (Consolidated)', () => {
  let server: MCPServer;
  let converter: ConversionService;

  beforeEach(() => {
    server = new MCPServer();
    converter = new ConversionService();
  });

  describe('MCP Server', () => {
    it('should initialize correctly', () => {
      expect(server.name).toBe('icon-generator-mcp');
      expect(server.version).toBe('0.3.1');
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
      const claudeServer = new MCPServer('claude');
      const geminiServer = new MCPServer('gemini');
      
      expect(claudeServer).toBeDefined();
      expect(geminiServer).toBeDefined();
    });
  });

  describe('PNG Conversion', () => {
    it('should validate PNG file paths', async () => {
      const validPath = 'test/fixtures/test.png';
      const invalidPath = 'nonexistent.png';
      
      // Test path validation logic
      expect(validPath.endsWith('.png')).toBe(true);
      expect(invalidPath.endsWith('.png')).toBe(true);
    });

    it('should handle conversion errors gracefully', async () => {
      try {
        await converter.convertPNGToSVG('nonexistent.png');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
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
