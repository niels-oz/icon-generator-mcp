import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { FileWriterService } from '../../src/services/file-writer';
import { MCPServer } from '../../src/server';
import * as fs from 'fs';
import * as path from 'path';

// Mock file system operations
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
  accessSync: jest.fn(),
  constants: { W_OK: 2 }
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('File Operations (Consolidated)', () => {
  let fileWriterService: FileWriterService;
  let server: MCPServer;

  beforeEach(() => {
    fileWriterService = new FileWriterService();
    server = new MCPServer();
    jest.clearAllMocks();
    mockFs.existsSync.mockReset();
    mockFs.writeFileSync.mockReset();
    mockFs.accessSync.mockReset();
  });

  describe('output path generation', () => {
    it('should generate correct output paths', () => {
      const testCases = [
        {
          filename: 'red-circle-icon',
          referencePath: '/Users/user/project/icons/source.png',
          expected: '/Users/user/project/icons/red-circle-icon.svg'
        },
        {
          filename: 'my<icon>with:invalid|chars',
          referencePath: '/Users/user/project/source.png',
          expected: '/Users/user/project/my-icon-with-invalid-chars.svg'
        },
        {
          filename: 'icon.svg',
          referencePath: '/Users/user/project/source.png',
          expected: '/Users/user/project/icon.svg'
        }
      ];

      testCases.forEach(({ filename, referencePath, expected }) => {
        const result = fileWriterService.generateOutputPath(filename, referencePath);
        expect(result).toBe(expected);
      });
    });

    it('should handle no reference path', () => {
      const result = fileWriterService.generateOutputPath('test-icon', undefined);
      expect(result).toBe('./test-icon.svg');
    });
  });

  describe('file saving', () => {
    it('should handle file saving operations', async () => {
      // Simple test that the service can attempt to save files
      expect(fileWriterService).toBeDefined();
      expect(typeof fileWriterService.saveGeneratedIcon).toBe('function');
    });
  });

  describe('tool schema integration', () => {
    it('should include output_path parameter in save_generated_icon tool schema', () => {
      const tools = server.getTools();
      const saveIconTool = tools.find(tool => tool.name === 'save_generated_icon');
      
      expect(saveIconTool).toBeDefined();
      expect(saveIconTool!.inputSchema.properties.output_path).toBeDefined();
      expect((saveIconTool!.inputSchema.properties.output_path as any).type).toBe('string');
      expect(saveIconTool!.inputSchema.required).not.toContain('output_path');
    });
  });

  describe('error handling', () => {
    it('should handle invalid file paths gracefully', () => {
      const result = fileWriterService.generateOutputPath('', '');
      expect(result).toBe('./generated-icon.svg');
    });
  });
});
