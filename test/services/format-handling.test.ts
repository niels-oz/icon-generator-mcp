import { describe, it, expect, beforeEach } from '@jest/globals';
import { MCPServer } from '../../src/server';
import * as fs from 'fs';
import * as path from 'path';

describe('Format Handling', () => {
  let server: MCPServer;
  
  beforeEach(() => {
    server = new MCPServer();
  });

  describe('convertImageToSVG', () => {
    it('should handle SVG files directly', async () => {
      // Create a temporary SVG file
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';
      const tempSvgPath = path.join(require('os').tmpdir(), 'test-icon.svg');
      fs.writeFileSync(tempSvgPath, svgContent);
      
      try {
        const result = await server['convertImageToSVG'](tempSvgPath);
        expect(result).toBe(svgContent);
      } finally {
        fs.unlinkSync(tempSvgPath);
      }
    });

    it('should handle PNG files via conversion', async () => {
      const pngPath = path.join(__dirname, '../fixtures/test.png');
      
      // Mock the conversion service
      const mockConvert = jest.fn().mockResolvedValue('<svg>converted</svg>');
      server['conversionService'].convertPNGToSVG = mockConvert;
      
      const result = await server['convertImageToSVG'](pngPath);
      
      expect(mockConvert).toHaveBeenCalledWith(pngPath);
      expect(result).toBe('<svg>converted</svg>');
    });

    it('should reject unsupported formats', async () => {
      const jpgPath = '/tmp/test.jpg';
      
      await expect(server['convertImageToSVG'](jpgPath))
        .rejects.toThrow('Unsupported image format: .jpg. Only SVG and PNG are supported.');
    });

    it('should handle files without extensions', async () => {
      const noExtPath = '/tmp/test';
      
      await expect(server['convertImageToSVG'](noExtPath))
        .rejects.toThrow('Unsupported image format: . Only SVG and PNG are supported.');
    });
  });

  describe('Web Search Format Integration', () => {
    it('should handle mixed SVG and PNG results from web search', async () => {
      const request = {
        prompt: 'Create a star icon',
        search_keyword: 'star',
        auto_search: true
      };

      // Mock web search to return both SVG and PNG files
      const mockSearchResult = jest.fn().mockResolvedValue([
        '/tmp/star-icon.svg',
        '/tmp/star-outline.png'
      ]);
      server['webSearchService'].searchSimpleIcons = mockSearchResult;

      // Mock the conversion service
      const mockConvert = jest.fn().mockResolvedValue('<svg>converted-png</svg>');
      server['conversionService'].convertPNGToSVG = mockConvert;

      // Create temporary files
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';
      const svgPath = '/tmp/star-icon.svg';
      const pngPath = '/tmp/star-outline.png';
      
      fs.writeFileSync(svgPath, svgContent);
      fs.writeFileSync(pngPath, 'fake-png-data');

      try {
        const response = await server.handleToolCall('generate_icon', request);
        
        expect(response.success).toBe(true);
        expect(mockSearchResult).toHaveBeenCalledWith('star');
        expect(mockConvert).toHaveBeenCalledWith(pngPath);
        expect(mockConvert).toHaveBeenCalledTimes(1); // Only PNG should be converted
      } finally {
        fs.unlinkSync(svgPath);
        fs.unlinkSync(pngPath);
      }
    });
  });
});