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

  it('should handle context preparation for simple prompts', async () => {
    const request = {
      prompt: 'Create a simple blue circle icon',
      style: 'black-white-flat'
    };

    const response = await server.handleToolCall('create_icon_prompt', request);
    
    expect(response).toHaveProperty('expert_prompt');
    expect(response).toHaveProperty('suggested_filename');
    expect(response.type).toBe('prompt_created');
    expect(response.suggested_filename).toBeDefined();
  });

  it('should handle validation errors gracefully', async () => {
    const request = {
      prompt: ''
    };

    const response = await server.handleToolCall('create_icon_prompt', request);
    
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.error).toContain('prompt is required');
  });
});