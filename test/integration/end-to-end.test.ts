import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { MCPServer } from '../../src/server';
import * as path from 'path';

describe('End-to-End Integration', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
  });

  it('should handle a complete icon generation request', async () => {
    const testPngPath = path.join(__dirname, '../fixtures/test.png');
    
    const request = {
      png_paths: [testPngPath],
      prompt: 'Create a simple test icon'
    };

    const response = await server.handleToolCall('generate_icon', request);
    
    expect(response.success).toBe(true);
    expect(response.message).toContain('Icon generated successfully');
    expect(response.message).toContain('Create a simple test icon');
    expect(response.processing_time).toBeDefined();
  });

  it('should handle validation errors gracefully', async () => {
    const request = {
      png_paths: [],
      prompt: ''
    };

    const response = await server.handleToolCall('generate_icon', request);
    
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.processing_time).toBeDefined();
  });

  it('should handle unknown tools', async () => {
    const response = await server.handleToolCall('unknown_tool', {});
    
    expect(response.success).toBe(false);
    expect(response.error).toContain('Unknown tool');
  });
});