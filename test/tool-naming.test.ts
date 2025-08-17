import { describe, it, expect, beforeEach } from '@jest/globals';
import { MCPServer } from '../src/server';
import { TEST_PROMPTS } from './test-constants';

describe('Tool Naming Improvements', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
  });

  describe('Tool Registration', () => {
    it('should register create_icon_prompt tool', () => {
      const tools = server.getTools();
      const createPromptTool = tools.find(tool => tool.name === 'create_icon_prompt');
      
      expect(createPromptTool).toBeDefined();
      expect(createPromptTool!.name).toBe('create_icon_prompt');
      expect(createPromptTool!.description).toContain('Creates an expert prompt for AI icon generation');
      expect(createPromptTool!.description).toContain('Call this first');
    });

    it('should register save_generated_icon tool', () => {
      const tools = server.getTools();
      const saveIconTool = tools.find(tool => tool.name === 'save_generated_icon');
      
      expect(saveIconTool).toBeDefined();
      expect(saveIconTool!.name).toBe('save_generated_icon');
      expect(saveIconTool!.description).toContain('Saves a generated SVG icon to file');
      expect(saveIconTool!.description).toContain('Call this after generating');
    });

    it('should have exactly two tools registered', () => {
      const tools = server.getTools();
      expect(tools).toHaveLength(2);
    });

    it('should not register old tool names', () => {
      const tools = server.getTools();
      const toolNames = tools.map(tool => tool.name);
      
      expect(toolNames).not.toContain('prepare_icon_context');
      expect(toolNames).not.toContain('save_icon');
    });
  });

  describe('create_icon_prompt Response Format', () => {
    it('should return prompt_created type with next_action', async () => {
      const request = { prompt: TEST_PROMPTS.SIMPLE };
      const response = await server.handleToolCall('create_icon_prompt', request);

      expect(response.type).toBe('prompt_created');
      expect(response).toHaveProperty('expert_prompt');
      expect(response).toHaveProperty('suggested_filename');
      expect(response).toHaveProperty('next_action');
    });

    it('should include proper next_action workflow guidance', async () => {
      const request = { prompt: 'cat on pillow' };
      const response = await server.handleToolCall('create_icon_prompt', request);

      expect(response.next_action).toEqual({
        description: 'Generate SVG with this prompt, then call save_generated_icon',
        tool_name: 'save_generated_icon',
        required_params: ['svg', 'filename'],
        workflow_step: '2 of 2',
        example_usage: {
          svg: expect.stringContaining('<svg'),
          filename: expect.any(String)
        }
      });
    });

    it('should have suggested_filename at top level (not in metadata)', async () => {
      const request = { prompt: 'cat on pillow' };
      const response = await server.handleToolCall('create_icon_prompt', request);

      expect(response).toHaveProperty('suggested_filename');
      expect(response.suggested_filename).toBe('cat-pillow');
      expect(response).not.toHaveProperty('metadata');
      expect(response).not.toHaveProperty('instructions');
    });

    it('should validate required prompt parameter', async () => {
      const request = { prompt: '' };
      const response = await server.handleToolCall('create_icon_prompt', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('prompt is required');
    });
  });

  describe('save_generated_icon Response Format', () => {
    it('should return icon_saved type', async () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const request = { svg: svgContent, filename: 'test-icon' };
      const response = await server.handleToolCall('save_generated_icon', request);

      expect(response.type).toBe('icon_saved');
      expect(response.success).toBe(true);
      expect(response).toHaveProperty('output_path');
      expect(response).toHaveProperty('message');
    });

    it('should validate required parameters', async () => {
      const request = { svg: '', filename: 'test' };
      const response = await server.handleToolCall('save_generated_icon', request);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('Tool Call Error Handling', () => {
    it('should return error for unknown tools', async () => {
      const response = await server.handleToolCall('unknown_tool', {});
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Unknown tool: unknown_tool');
      expect(response.error).toContain('Available tools: create_icon_prompt, save_generated_icon');
    });
  });

  describe('Workflow Integration', () => {
    it('should complete full workflow with new tool names', async () => {
      // Step 1: Create prompt
      const promptRequest = { prompt: 'cat on pillow', style: 'black-white-flat' };
      const promptResponse = await server.handleToolCall('create_icon_prompt', promptRequest);

      expect(promptResponse.type).toBe('prompt_created');
      expect(promptResponse).toHaveProperty('expert_prompt');
      expect(promptResponse).toHaveProperty('suggested_filename');

      // Step 2: Save icon (simulating LLM generated SVG)
      const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const saveRequest = {
        svg: mockSvg,
        filename: promptResponse.suggested_filename
      };
      const saveResponse = await server.handleToolCall('save_generated_icon', saveRequest);

      expect(saveResponse.type).toBe('icon_saved');
      expect(saveResponse.success).toBe(true);
      expect(saveResponse).toHaveProperty('output_path');
    });
  });
});