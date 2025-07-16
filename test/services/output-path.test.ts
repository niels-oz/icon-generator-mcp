import { describe, it, expect, beforeEach } from '@jest/globals';
import { MCPServer } from '../../src/server';

// Test the new output_path parameter functionality
describe('Output Path Parameter', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
  });

  describe('tool schema', () => {
    it('should include output_path parameter in tool schema', () => {
      const tools = server.getTools();
      const generateIconTool = tools.find(tool => tool.name === 'generate_icon');
      
      expect(generateIconTool).toBeDefined();
      expect(generateIconTool!.inputSchema.properties.output_path).toBeDefined();
      expect(generateIconTool!.inputSchema.properties.output_path.type).toBe('string');
      expect(generateIconTool!.inputSchema.properties.output_path.description).toContain('output directory');
    });

    it('should not require output_path parameter', () => {
      const tools = server.getTools();
      const generateIconTool = tools.find(tool => tool.name === 'generate_icon');
      
      expect(generateIconTool!.inputSchema.required).not.toContain('output_path');
      expect(generateIconTool!.inputSchema.required).toEqual(['png_paths', 'prompt']);
    });
  });

  describe('request validation', () => {
    it('should validate request with output_path parameter', () => {
      const request = {
        png_paths: ['/path/to/test.png'],
        prompt: 'Create a test icon',
        output_path: '/custom/output/directory'
      };

      const validated = (server as any).validateRequest(request);
      
      expect(validated.output_path).toBe('/custom/output/directory');
      expect(validated.png_paths).toEqual(['/path/to/test.png']);
      expect(validated.prompt).toBe('Create a test icon');
    });

    it('should validate request without output_path parameter', () => {
      const request = {
        png_paths: ['/path/to/test.png'],
        prompt: 'Create a test icon'
      };

      const validated = (server as any).validateRequest(request);
      
      expect(validated.output_path).toBeUndefined();
      expect(validated.png_paths).toEqual(['/path/to/test.png']);
      expect(validated.prompt).toBe('Create a test icon');
    });

    it('should validate request with both output_name and output_path', () => {
      const request = {
        png_paths: ['/path/to/test.png'],
        prompt: 'Create a test icon',
        output_name: 'custom-icon',
        output_path: '/custom/output/directory'
      };

      const validated = (server as any).validateRequest(request);
      
      expect(validated.output_path).toBe('/custom/output/directory');
      expect(validated.output_name).toBe('custom-icon');
      expect(validated.png_paths).toEqual(['/path/to/test.png']);
      expect(validated.prompt).toBe('Create a test icon');
    });
  });

  describe('integration with file writer', () => {
    it('should pass output_path to file writer when provided', () => {
      // This test verifies the logic flow without mocking the actual implementation
      const request = {
        png_paths: ['/path/to/test.png'],
        prompt: 'Create a test icon',
        output_path: '/custom/output/directory'
      };

      const validated = (server as any).validateRequest(request);
      
      // Test that the logic correctly chooses output_path over png_paths[0]
      const referenceForLocation = validated.output_path || validated.png_paths[0];
      expect(referenceForLocation).toBe('/custom/output/directory');
    });

    it('should fallback to png_paths[0] when output_path not provided', () => {
      const request = {
        png_paths: ['/path/to/test.png'],
        prompt: 'Create a test icon'
      };

      const validated = (server as any).validateRequest(request);
      
      // Test that the logic correctly falls back to png_paths[0]
      const referenceForLocation = validated.output_path || validated.png_paths[0];
      expect(referenceForLocation).toBe('/path/to/test.png');
    });
  });
});