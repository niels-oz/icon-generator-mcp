import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MCPServer } from '../../src/server';
import * as fs from 'fs';
import * as path from 'path';

describe('Web Search Integration', () => {
  let server: MCPServer;
  let createdFiles: string[] = [];

  beforeEach(() => {
    server = new MCPServer();
  });

  afterEach(() => {
    // Clean up created files
    createdFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    createdFiles = [];
  });

  describe('Enhanced MCP Tool Schema', () => {
    it('should include web search fields in tool schema', () => {
      const tools = server.getTools();
      const generateIconTool = tools.find(tool => tool.name === 'generate_icon');
      
      expect(generateIconTool).toBeDefined();
      expect(generateIconTool!.inputSchema.properties).toHaveProperty('search_keyword');
      expect(generateIconTool!.inputSchema.properties).toHaveProperty('auto_search');
      
      expect(generateIconTool!.inputSchema.properties.search_keyword).toMatchObject({
        type: 'string',
        description: expect.stringContaining('keyword')
      });
      
      expect(generateIconTool!.inputSchema.properties.auto_search).toMatchObject({
        type: 'boolean',
        description: expect.stringContaining('automatically search')
      });
    });
  });

  describe('Request Validation', () => {
    it('should accept requests with search_keyword and auto_search', async () => {
      const request = {
        prompt: 'Create a star icon',
        search_keyword: 'star',
        auto_search: true
      };

      // Mock the web search to avoid actual API calls
      const mockSearchResult = jest.fn().mockResolvedValue([]);
      server['webSearchService'].searchSimpleIcons = mockSearchResult;

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response.success).toBe(true);
      expect(mockSearchResult).toHaveBeenCalledWith('star');
    });

    it('should work without search parameters (backward compatibility)', async () => {
      const request = {
        prompt: 'Create a simple circle icon'
      };

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response.success).toBe(true);
      expect(response.output_path).toBeDefined();
      
      if (response.output_path) {
        createdFiles.push(response.output_path);
      }
    });
  });

  describe('Web Search Integration', () => {
    it('should skip web search when auto_search is false', async () => {
      const request = {
        prompt: 'Create a star icon',
        search_keyword: 'star',
        auto_search: false
      };

      const mockSearchResult = jest.fn().mockResolvedValue([]);
      server['webSearchService'].searchSimpleIcons = mockSearchResult;

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response.success).toBe(true);
      expect(mockSearchResult).not.toHaveBeenCalled();
    });

    it('should skip web search when search_keyword is not provided', async () => {
      const request = {
        prompt: 'Create a star icon',
        auto_search: true
      };

      const mockSearchResult = jest.fn().mockResolvedValue([]);
      server['webSearchService'].searchSimpleIcons = mockSearchResult;

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response.success).toBe(true);
      expect(mockSearchResult).not.toHaveBeenCalled();
    });

    it('should combine manual PNG paths with web search results', async () => {
      const manualPngPath = path.join(__dirname, '../fixtures/test.png');
      const webSearchPngPath = '/tmp/star-icon-123.png';

      const request = {
        png_paths: [manualPngPath],
        prompt: 'Create a star icon',
        search_keyword: 'star',
        auto_search: true
      };

      // Mock web search to return a fake PNG path
      const mockSearchResult = jest.fn().mockResolvedValue([webSearchPngPath]);
      server['webSearchService'].searchSimpleIcons = mockSearchResult;

      // Mock the conversion service to track what PNGs were processed
      const mockConvert = jest.fn().mockResolvedValue('<svg>test</svg>');
      server['conversionService'].convertPNGToSVG = mockConvert;

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response.success).toBe(true);
      expect(mockSearchResult).toHaveBeenCalledWith('star');
      expect(mockConvert).toHaveBeenCalledWith(manualPngPath);
      expect(mockConvert).toHaveBeenCalledWith(webSearchPngPath);
      expect(mockConvert).toHaveBeenCalledTimes(2);
    });

    it('should handle web search failures gracefully', async () => {
      const request = {
        prompt: 'Create a star icon',
        search_keyword: 'star',
        auto_search: true
      };

      // Mock web search to fail
      const mockSearchResult = jest.fn().mockRejectedValue(new Error('API Error'));
      server['webSearchService'].searchSimpleIcons = mockSearchResult;

      const response = await server.handleToolCall('generate_icon', request);
      
      // Should still succeed with just the prompt
      expect(response.success).toBe(true);
      expect(response.output_path).toBeDefined();
      
      if (response.output_path) {
        createdFiles.push(response.output_path);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle PNG conversion errors from web search results', async () => {
      const request = {
        prompt: 'Create a star icon',
        search_keyword: 'star',
        auto_search: true
      };

      // Mock web search to return a fake PNG path
      const mockSearchResult = jest.fn().mockResolvedValue(['/fake/path/star.png']);
      server['webSearchService'].searchSimpleIcons = mockSearchResult;

      const response = await server.handleToolCall('generate_icon', request);
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Failed to convert image file');
    });
  });
});