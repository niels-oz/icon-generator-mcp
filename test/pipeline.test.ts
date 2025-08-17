import { MCPServer } from '../src/server';
import * as fs from 'fs';
import { TEST_PATHS, TEST_PROMPTS } from './test-constants';

describe('Generation Pipeline Integration', () => {
  let server: MCPServer;
  const testPngPath = TEST_PATHS.OUTPUT.TEMP_PNG;
  const testSvgPath = TEST_PATHS.FIXTURES.SVG_FILE;

  beforeEach(() => {
    server = new MCPServer();
    
    // Create temporary PNG file for testing
    fs.writeFileSync(testPngPath, 'dummy png content for pipeline testing');
  });

  afterEach(() => {
    // Clean up temporary PNG file
    if (fs.existsSync(testPngPath)) {
      fs.unlinkSync(testPngPath);
    }
  });

  describe('Two-Tool Architecture', () => {
    it('should prepare context for a simple prompt', async () => {
      const request = {
        prompt: TEST_PROMPTS.SIMPLE
      };

      const response = await server.handleToolCall('create_icon_prompt', request);

      expect(response).toHaveProperty('expert_prompt');
      expect(response).toHaveProperty('suggested_filename');
      expect(response.type).toBe('prompt_created');
      expect(response.suggested_filename).toBeDefined();
    });

    it('should handle SVG references in context preparation', async () => {
      const request = {
        prompt: TEST_PROMPTS.SIMPLE,
        reference_paths: [testSvgPath]
      };

      const response = await server.handleToolCall('create_icon_prompt', request);

      expect(response).toHaveProperty('expert_prompt');
      expect(response).toHaveProperty('next_action');
    });

    it('should save icons with proper file operations', async () => {
      const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const request = {
        svg: mockSvg,
        filename: 'test-pipeline-icon'
      };

      const response = await server.handleToolCall('save_generated_icon', request);

      expect(response.success).toBe(true);
      expect(response.type).toBe('icon_saved');
      expect(response).toHaveProperty('output_path');
      expect(response.output_path).toContain('test-pipeline-icon');
    });

    it('should handle validation errors gracefully', async () => {
      const request = {
        prompt: '',  // Invalid empty prompt
      };

      const response = await server.handleToolCall('create_icon_prompt', request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('prompt is required');
    });

    it('should handle file validation errors', async () => {
      const request = {
        prompt: TEST_PROMPTS.SIMPLE,
        reference_paths: ['/nonexistent/file.png']
      };

      const response = await server.handleToolCall('create_icon_prompt', request);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should test complete workflow with both tools', async () => {
      // Step 1: Create prompt
      const contextResponse = await server.handleToolCall('create_icon_prompt', {
        prompt: TEST_PROMPTS.SIMPLE
      });

      expect(contextResponse).toHaveProperty('expert_prompt');
      expect(contextResponse).toHaveProperty('suggested_filename');
      
      // Step 2: Save icon
      const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const saveResponse = await server.handleToolCall('save_generated_icon', {
        svg: mockSvg,
        filename: contextResponse.suggested_filename
      });
      
      expect(saveResponse.success).toBe(true);
      expect(saveResponse.type).toBe('icon_saved');
      expect(saveResponse).toHaveProperty('output_path');
    });

  });
});