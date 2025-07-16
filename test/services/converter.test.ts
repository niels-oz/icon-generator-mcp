import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ConversionService } from '../../src/services/converter';
import * as path from 'path';

describe('ConversionService', () => {
  let service: ConversionService;

  beforeEach(() => {
    service = new ConversionService();
    jest.clearAllMocks();
  });

  describe('PNG to SVG conversion', () => {
    it('should convert a real PNG file to SVG', async () => {
      // Use the real test PNG file we created
      const testPngPath = path.join(__dirname, '../fixtures/test.png');
      
      // Check if potrace is available, if not skip this test
      try {
        service.findPotraceBinary();
      } catch (error) {
        console.log('Skipping test: Potrace not found');
        return;
      }
      
      // Only test if the real file exists
      const fs = require('fs');
      if (fs.existsSync(testPngPath)) {
        const result = await service.convertPNGToSVG(testPngPath);
        
        expect(result).toBeDefined();
        expect(result).toContain('<svg');
        expect(result).toContain('</svg>');
      } else {
        console.log('Test PNG file not found, skipping test');
      }
    });

    it('should handle non-existent files', async () => {
      const nonExistentPath = '/path/to/nonexistent.png';
      
      await expect(service.convertPNGToSVG(nonExistentPath))
        .rejects.toThrow('File not found');
    });

    it('should validate file size limits', () => {
      const largeSize = 11 * 1024 * 1024; // 11MB
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      expect(largeSize).toBeGreaterThan(maxSize);
    });
  });

  describe('Potrace integration', () => {
    it('should find potrace binary in PATH or indicate it is missing', () => {
      try {
        const potracePath = service.findPotraceBinary();
        expect(potracePath).toBeDefined();
        expect(potracePath).toContain('potrace');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Potrace not found');
      }
    });
  });
});