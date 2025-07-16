import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { MCPServer } from '../../src/server';
import * as path from 'path';
import { execSync } from 'child_process';
import * as fs from 'fs';
import Jimp from 'jimp';

// Mock external dependencies
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
  accessSync: jest.fn(),
  statSync: jest.fn(),
  unlinkSync: jest.fn(),
  constants: { W_OK: 2 }
}));

jest.mock('jimp', () => ({
  read: jest.fn(),
  default: {
    read: jest.fn()
  }
}));

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockFs = fs as jest.Mocked<typeof fs>;
const mockJimp = Jimp as jest.Mocked<typeof Jimp>;

describe('End-to-End Integration', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
    jest.clearAllMocks();
    
    // Reset all mock implementations
    mockExecSync.mockReset();
    mockFs.existsSync.mockReset();
    mockFs.writeFileSync.mockReset();
    mockFs.accessSync.mockReset();
    mockFs.statSync.mockReset();
    mockFs.unlinkSync.mockReset();
  });

  it('should handle a complete icon generation request', async () => {
    const testPngPath = path.join(__dirname, '../fixtures/test.png');
    
    const request = {
      png_paths: [testPngPath],
      prompt: 'Create a simple test icon'
    };

    // Mock PNG file exists and file operations
    mockFs.existsSync
      .mockReturnValueOnce(true)  // PNG file exists (for conversion)
      .mockReturnValueOnce(false) // Temp file cleanup check
      .mockReturnValueOnce(true)  // PNG file exists (for file writer validation)
      .mockReturnValueOnce(false); // No conflict with output file
    mockFs.statSync.mockReturnValue({ size: 1024 } as any); // File size check
    mockFs.accessSync.mockReturnValue(undefined);
    
    // Mock Jimp image processing
    const mockImage = {
      writeAsync: jest.fn()
    };
    (mockJimp.read as any).mockResolvedValue(mockImage);
    
    // Mock Potrace conversion (via execSync)
    mockExecSync
      .mockReturnValueOnce('/usr/local/bin/potrace') // which potrace
      .mockReturnValueOnce(`<?xml version="1.0" standalone="no"?>
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="#000000"/>
        </svg>`) // potrace conversion
      .mockReturnValueOnce('/usr/local/bin/claude') // which claude
      .mockReturnValueOnce(`
FILENAME: simple-test-icon
SVG: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
      `); // claude generation

    const response = await server.handleToolCall('generate_icon', request);
    
    expect(response.success).toBe(true);
    expect(response.message).toContain('Icon generated successfully');
    expect(response.message).toContain('simple-test-icon.svg');
    expect(response.processing_time).toBeDefined();
  });

  it('should handle prompt-only generation (no PNG files)', async () => {
    const request = {
      png_paths: [],
      prompt: 'Create a simple blue circle icon'
    };

    // Mock no PNG files, but directory writable
    mockFs.existsSync.mockReturnValueOnce(false); // No conflict with output file
    mockFs.accessSync.mockReturnValue(undefined);
    
    // Mock Claude generation directly (no PNG conversion needed)
    mockExecSync
      .mockReturnValueOnce('/usr/local/bin/claude') // which claude
      .mockReturnValueOnce(`
FILENAME: blue-circle-icon
SVG: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
      `); // claude generation

    const response = await server.handleToolCall('generate_icon', request);
    
    expect(response.success).toBe(true);
    expect(response.message).toContain('Icon generated successfully');
    expect(response.message).toContain('blue-circle-icon.svg');
    expect(response.output_path).toBe('./blue-circle-icon.svg');
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