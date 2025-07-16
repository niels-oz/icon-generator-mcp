import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { FileWriterService } from '../../src/services/file-writer';
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

describe('FileWriterService', () => {
  let service: FileWriterService;

  beforeEach(() => {
    service = new FileWriterService();
    jest.clearAllMocks();
    // Reset all mock implementations
    mockFs.existsSync.mockReset();
    mockFs.writeFileSync.mockReset();
    mockFs.accessSync.mockReset();
  });

  describe('output path generation', () => {
    it('should generate output path in same directory as reference PNG', () => {
      const referencePath = '/Users/user/project/icons/source.png';
      const filename = 'red-circle-icon';

      const outputPath = service.generateOutputPath(filename, referencePath);

      expect(outputPath).toBe('/Users/user/project/icons/red-circle-icon.svg');
    });

    it('should sanitize filename to remove invalid characters', () => {
      const referencePath = '/Users/user/project/source.png';
      const filename = 'my<icon>with:invalid|chars';

      const outputPath = service.generateOutputPath(filename, referencePath);

      expect(outputPath).toBe('/Users/user/project/my-icon-with-invalid-chars.svg');
    });

    it('should handle filename with existing .svg extension', () => {
      const referencePath = '/Users/user/project/source.png';
      const filename = 'red-circle-icon.svg';

      const outputPath = service.generateOutputPath(filename, referencePath);

      expect(outputPath).toBe('/Users/user/project/red-circle-icon.svg');
    });

    it('should handle empty filename with fallback', () => {
      const referencePath = '/Users/user/project/source.png';
      const filename = '';

      const outputPath = service.generateOutputPath(filename, referencePath);

      expect(outputPath).toBe('/Users/user/project/generated-icon.svg');
    });
  });

  describe('name conflict resolution', () => {
    it('should return original path if no conflict exists', () => {
      const filePath = '/Users/user/project/icon.svg';
      mockFs.existsSync.mockReturnValue(false);

      const resolvedPath = service.resolveNameConflicts(filePath);

      expect(resolvedPath).toBe('/Users/user/project/icon.svg');
    });

    it('should append -2 if original file exists', () => {
      const filePath = '/Users/user/project/icon.svg';
      mockFs.existsSync
        .mockReturnValueOnce(true)  // original exists
        .mockReturnValueOnce(false); // -2 doesn't exist

      const resolvedPath = service.resolveNameConflicts(filePath);

      expect(resolvedPath).toBe('/Users/user/project/icon-2.svg');
    });

    it('should find next available index when multiple conflicts exist', () => {
      const filePath = '/Users/user/project/icon.svg';
      mockFs.existsSync
        .mockReturnValueOnce(true)  // original exists
        .mockReturnValueOnce(true)  // -2 exists
        .mockReturnValueOnce(true)  // -3 exists
        .mockReturnValueOnce(false); // -4 doesn't exist

      const resolvedPath = service.resolveNameConflicts(filePath);

      expect(resolvedPath).toBe('/Users/user/project/icon-4.svg');
    });

    it('should handle complex filename with multiple dots', () => {
      const filePath = '/Users/user/project/my.complex.icon.svg';
      mockFs.existsSync
        .mockReturnValueOnce(true)  // original exists
        .mockReturnValueOnce(false); // -2 doesn't exist

      const resolvedPath = service.resolveNameConflicts(filePath);

      expect(resolvedPath).toBe('/Users/user/project/my.complex.icon-2.svg');
    });
  });

  describe('file writing', () => {
    it('should write SVG content to file successfully', async () => {
      const outputPath = '/Users/user/project/icon.svg';
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle/></svg>';
      
      mockFs.accessSync.mockReturnValue(undefined); // Directory is writable

      await service.saveGeneratedSVG(outputPath, svgContent);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        outputPath,
        svgContent,
        'utf8'
      );
    });

    it('should check directory write permissions before writing', async () => {
      const outputPath = '/Users/user/project/icon.svg';
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle/></svg>';
      
      mockFs.accessSync.mockReturnValue(undefined); // Directory is writable

      await service.saveGeneratedSVG(outputPath, svgContent);

      expect(mockFs.accessSync).toHaveBeenCalledWith(
        '/Users/user/project',
        fs.constants.W_OK
      );
    });

    it('should throw error if directory is not writable', async () => {
      const outputPath = '/Users/user/project/icon.svg';
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle/></svg>';
      
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(service.saveGeneratedSVG(outputPath, svgContent))
        .rejects.toThrow('Cannot write to directory');
    });

    it('should handle file writing errors gracefully', async () => {
      const outputPath = '/Users/user/project/icon.svg';
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle/></svg>';
      
      mockFs.accessSync.mockReturnValue(undefined);
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });

      await expect(service.saveGeneratedSVG(outputPath, svgContent))
        .rejects.toThrow('Failed to write SVG file');
    });
  });

  describe('complete file output workflow', () => {
    it('should handle complete save workflow with conflict resolution', async () => {
      const referencePath = '/Users/user/project/source.png';
      const suggestedName = 'red-circle-icon';
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle fill="red"/></svg>';

      // Mock PNG reference exists, no conflicts, directory writable
      mockFs.existsSync
        .mockReturnValueOnce(true)  // Reference PNG exists
        .mockReturnValueOnce(false); // No conflict with output file
      mockFs.accessSync.mockReturnValue(undefined);

      const result = await service.saveGeneratedIcon(
        suggestedName,
        referencePath,
        svgContent
      );

      expect(result.outputPath).toBe('/Users/user/project/red-circle-icon.svg');
      expect(result.success).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/Users/user/project/red-circle-icon.svg',
        svgContent,
        'utf8'
      );
    });

    it('should handle conflicts and write to resolved path', async () => {
      const referencePath = '/Users/user/project/source.png';
      const suggestedName = 'red-circle-icon';
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle fill="red"/></svg>';

      // Mock PNG reference exists, then file conflicts
      mockFs.existsSync
        .mockReturnValueOnce(true)  // Reference PNG exists
        .mockReturnValueOnce(true)  // Original output exists (conflict)
        .mockReturnValueOnce(false); // -2 doesn't exist
      mockFs.accessSync.mockReturnValue(undefined);

      const result = await service.saveGeneratedIcon(
        suggestedName,
        referencePath,
        svgContent
      );

      expect(result.outputPath).toBe('/Users/user/project/red-circle-icon-2.svg');
      expect(result.success).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/Users/user/project/red-circle-icon-2.svg',
        svgContent,
        'utf8'
      );
    });

    it('should return error result when save fails', async () => {
      const referencePath = '/Users/user/project/source.png';
      const suggestedName = 'red-circle-icon';
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle fill="red"/></svg>';

      // Mock PNG reference exists, no conflicts, but directory not writable
      mockFs.existsSync
        .mockReturnValueOnce(true)  // Reference PNG exists
        .mockReturnValueOnce(false); // No conflict with output file
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await service.saveGeneratedIcon(
        suggestedName,
        referencePath,
        svgContent
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot write to directory');
    });
  });

  describe('filename sanitization', () => {
    it('should sanitize various invalid characters', () => {
      const testCases = [
        { input: 'my<icon>', expected: 'my-icon' },
        { input: 'icon:with|special', expected: 'icon-with-special' },
        { input: 'icon"with\'quotes', expected: 'icon-with-quotes' },
        { input: 'icon?with*wildcards', expected: 'icon-with-wildcards' },
        { input: 'icon\\with/slashes', expected: 'icon-with-slashes' },
        { input: 'icon with spaces', expected: 'icon-with-spaces' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = service.sanitizeFilename(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle filename with only invalid characters', () => {
      const result = service.sanitizeFilename('<>:|"*?/\\');
      expect(result).toBe('generated-icon');
    });

    it('should preserve valid characters', () => {
      const result = service.sanitizeFilename('my-valid_filename.with.dots');
      expect(result).toBe('my-valid_filename.with.dots');
    });
  });

  describe('directory validation', () => {
    it('should validate that reference path exists', () => {
      const referencePath = '/Users/user/project/source.png';
      mockFs.existsSync.mockReturnValue(true);

      const isValid = service.validateReferencePath(referencePath);

      expect(isValid).toBe(true);
    });

    it('should reject non-existent reference path', () => {
      const referencePath = '/Users/user/project/missing.png';
      mockFs.existsSync.mockReturnValue(false);

      const isValid = service.validateReferencePath(referencePath);

      expect(isValid).toBe(false);
    });

    it('should extract directory from reference path correctly', () => {
      const referencePath = '/Users/user/project/icons/source.png';
      
      const directory = service.extractDirectory(referencePath);

      expect(directory).toBe('/Users/user/project/icons');
    });
  });
});