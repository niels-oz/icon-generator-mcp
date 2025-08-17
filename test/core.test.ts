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
      expect(server.version).toBe('0.5.0');
    });

    it('should register two tools with correct schema', () => {
      const tools = server.getTools();
      const createPromptTool = tools[0];
      const saveIconTool = tools[1];
      
      expect(tools).toHaveLength(2);
      expect(createPromptTool.name).toBe('create_icon_prompt');
      expect(createPromptTool.inputSchema.required).toEqual(['prompt']);
      expect(saveIconTool.name).toBe('save_generated_icon');
      expect(saveIconTool.inputSchema.required).toEqual(['svg', 'filename']);
    });
  });

  describe('Request Validation', () => {
    it('should validate requests correctly', async () => {
      const validRequest = { prompt: TEST_PROMPTS.SIMPLE };
      const invalidRequest = { prompt: '' };
      
      const validResponse = await server.handleToolCall('create_icon_prompt', validRequest);
      const invalidResponse = await server.handleToolCall('create_icon_prompt', invalidRequest);
      
      expect(validResponse).toHaveProperty('expert_prompt');
      expect(validResponse).toHaveProperty('suggested_filename');
      expect(invalidResponse.success).toBe(false);
      expect(invalidResponse.error).toContain('prompt is required');
    });

    it('should return expert prompt and next_action', async () => {
      const request = { prompt: TEST_PROMPTS.SIMPLE };
      const response = await server.handleToolCall('create_icon_prompt', request);
      
      expect(response).toHaveProperty('expert_prompt');
      expect(response).toHaveProperty('suggested_filename');
      expect(response).toHaveProperty('next_action');
      expect(response.type).toBe('prompt_created');
    });
  });

  describe('Tool Call Handling', () => {
    it('should return error for unknown tools', async () => {
      const response = await server.handleToolCall('unknown_tool', {});
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Unknown tool');
    });

    it('should test save_generated_icon tool', async () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const request = { svg: svgContent, filename: 'test-icon' };
      const response = await server.handleToolCall('save_generated_icon', request);
      
      expect(response.success).toBe(true);
      expect(response.type).toBe('icon_saved');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('output_path');
    });
  });
});