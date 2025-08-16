import { describe, it, expect, beforeEach } from '@jest/globals';
import { MCPServer } from '../src/server';

describe('Filename Generation Fix', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
  });

  describe('generateSimpleSVG method', () => {
    it('should extract keywords for long prompts', async () => {
      const result = await (server as any).generateSimpleSVG('please generate a minimalist dog silhouette icon with black and white flat design elements');
      
      expect(result).toHaveProperty('svg');
      expect(result).toHaveProperty('filename');
      expect(result.filename).toBe('dog-silhouette'); // Should extract meaningful keywords, not "please-generate"
    });

    it('should handle simple prompts', async () => {
      const result = await (server as any).generateSimpleSVG('user profile');
      
      expect(result.filename).toBe('user-profile');
    });

    it('should fallback to generated-icon for empty/filtered prompts', async () => {
      const result = await (server as any).generateSimpleSVG('create a the and');
      
      expect(result.filename).toBe('generated-icon');
    });
  });

  describe('End-to-end filename generation', () => {
    it('should generate semantic filenames for complex prompts', async () => {
      const request = {
        prompt: 'please generate a minimalist dog silhouette icon with black and white flat design elements',
        reference_paths: [],
        style: undefined,
        output_name: undefined,
        output_path: undefined
      };

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response.success).toBe(true);
      expect(response.output_path).toContain('dog-silhouette'); // Should NOT contain "please-generate-a-minimalist-d"
      expect(response.output_path).not.toMatch(/please-generate.*\.svg$/);
    });
  });
});