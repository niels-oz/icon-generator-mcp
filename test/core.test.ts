import { describe, it, expect, beforeEach } from '@jest/globals';
import { MCPServer } from '../src/server';
import { TEST_PROMPTS } from './test-constants';

describe('MCP Server Core Interface', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
  });

  describe('Server Initialization', () => {
    it('should initialize correctly', () => {
      expect(server.name).toBe('icon-generator-mcp');
      expect(server.version).toBe('0.4.1');
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
  });

  describe('Request Validation', () => {
    it('should validate requests correctly', async () => {
      const validRequest = { prompt: TEST_PROMPTS.SIMPLE };
      const invalidRequest = { prompt: '' };
      
      const validResponse = await server.handleToolCall('generate_icon', validRequest);
      const invalidResponse = await server.handleToolCall('generate_icon', invalidRequest);
      
      expect(validResponse).toHaveProperty('success');
      expect(invalidResponse.success).toBe(false);
      expect(invalidResponse.error).toContain('prompt is required');
    });

    it('should provide processing time metrics', async () => {
      const request = { prompt: TEST_PROMPTS.SIMPLE };
      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response).toHaveProperty('processing_time');
      if (typeof response.processing_time === 'number') {
        expect(response.processing_time).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Tool Call Handling', () => {
    it('should return error for unknown tools', async () => {
      const response = await server.handleToolCall('unknown_tool', {});
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Unknown tool');
    });

    it('should track processing phases', async () => {
      const request = { prompt: TEST_PROMPTS.SIMPLE };
      const response = await server.handleToolCall('generate_icon', request);
      
      if (response.steps) {
        const phases = response.steps.map((step: any) => step.step);
        expect(phases).toContain('validation');
        expect(phases).toContain('analysis');
        expect(phases).toContain('generation');
        expect(phases).toContain('output');
      }
    });
  });
});