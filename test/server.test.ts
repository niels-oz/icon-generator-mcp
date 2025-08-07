import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { MCPServer } from '../src/server';

describe('MCPServer', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
  });

  describe('initialization', () => {
    it('should create a server instance', () => {
      expect(server).toBeDefined();
    });

    it('should have the correct name and version', () => {
      expect(server.name).toBe('icon-generator-mcp');
      expect(server.version).toBe('0.2.0');
    });
  });

  describe('tool registration', () => {
    it('should register the generate_icon tool', () => {
      const tools = server.getTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('generate_icon');
    });

    it('should have correct tool schema', () => {
      const tools = server.getTools();
      const generateIconTool = tools[0];
      
      expect(generateIconTool.inputSchema).toMatchObject({
        type: 'object',
        properties: {
          png_paths: { type: 'array', items: { type: 'string' } },
          prompt: { type: 'string' },
          output_name: { type: 'string' }
        },
        required: ['prompt']
      });
    });
  });

  describe('request handling', () => {
    it('should handle valid generate_icon requests', async () => {
      const request = {
        png_paths: ['test.png'],
        prompt: 'Create a simple icon'
      };

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('message');
    });

    it('should handle prompt-only requests (empty png_paths)', async () => {
      const request = {
        png_paths: [],
        prompt: 'Create a simple blue circle icon'
      };

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('output_path');
    });

    it('should handle prompt-only requests (missing png_paths)', async () => {
      const request = {
        prompt: 'Create a simple red square icon'
      };

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('output_path');
    });

    it('should validate required parameters', async () => {
      const request = {
        png_paths: [],
        prompt: ''
      };

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('prompt is required');
    });

    it('should fail when both png_paths and prompt are empty', async () => {
      const request = {
        png_paths: [],
        prompt: ''
      };

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('prompt is required');
    });

    it('should handle unknown tools', async () => {
      const response = await server.handleToolCall('unknown_tool', {});
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Unknown tool');
    });
  });
});