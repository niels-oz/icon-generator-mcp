import { describe, it, expect, beforeAll } from '@jest/globals';
import { MCPServer } from '../../src/server';
import * as path from 'path';
import * as fs from 'fs';

describe('End-to-End Integration', () => {
  let server: MCPServer;
  const testOutputDir = path.join(__dirname, '../test-output');

  beforeAll(() => {
    server = new MCPServer();
    // Ensure test output directory exists
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  it('should handle prompt-only generation (no PNG files)', async () => {
    const request = {
      reference_paths: [],
      prompt: 'Create a simple blue circle icon',
      output_name: 'test-integration-blue-circle',
      output_path: testOutputDir
    };

    const response = await server.handleToolCall('generate_icon', request);
    
    if (!response.success) {
      console.log('Integration test error:', response.error);
    }
    
    expect(response.success).toBe(true);
    expect(response.message).toMatch(/Icon generated successfully/);
    expect(response.processing_time).toBeDefined();
    expect(response.steps).toBeDefined();
    expect(Array.isArray(response.steps)).toBe(true);
  }, 35000); // 35 second timeout for real generation

  it('should handle validation errors gracefully', async () => {
    const request = {
      reference_paths: [],
      prompt: ''
    };

    const response = await server.handleToolCall('generate_icon', request);
    
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.error).toContain('prompt is required');
  });
});