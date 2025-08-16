import { describe, it, expect, beforeEach } from '@jest/globals';
import { MCPServer } from '../src/server';

describe('Filename Generation Fix', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
  });

  describe('prepare_icon_context filename generation', () => {
    it('should extract keywords for long prompts', async () => {
      const response = await server.handleToolCall('prepare_icon_context', {
        prompt: 'please generate a minimalist dog silhouette icon with black and white flat design elements'
      });
      
      expect(response).toHaveProperty('metadata');
      expect(response.metadata.suggested_filename).toBe('dog-silhouette'); // Should extract meaningful keywords, not "please-generate"
    });

    it('should handle simple prompts', async () => {
      const response = await server.handleToolCall('prepare_icon_context', {
        prompt: 'user profile'
      });
      
      expect(response.metadata.suggested_filename).toBe('user-profile');
    });

    it('should fallback to generated-icon for empty/filtered prompts', async () => {
      const response = await server.handleToolCall('prepare_icon_context', {
        prompt: 'create a the and'
      });
      
      expect(response.metadata.suggested_filename).toBe('generated-icon');
    });
  });

  describe('End-to-end filename generation', () => {
    it('should generate semantic filenames for complex prompts', async () => {
      const contextResponse = await server.handleToolCall('prepare_icon_context', {
        prompt: 'please generate a minimalist dog silhouette icon with black and white flat design elements'
      });
      
      expect(contextResponse.metadata.suggested_filename).toBe('dog-silhouette'); // Should NOT contain "please-generate-a-minimalist-d"
      expect(contextResponse.metadata.suggested_filename).not.toMatch(/please-generate/);
      
      // Test full workflow with save_icon
      const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const saveResponse = await server.handleToolCall('save_icon', {
        svg: mockSvg,
        filename: contextResponse.metadata.suggested_filename
      });
      
      expect(saveResponse.success).toBe(true);
      expect(saveResponse.output_path).toContain('dog-silhouette');
    });
  });
});