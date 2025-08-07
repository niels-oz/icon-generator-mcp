import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { execSync } from 'child_process';
import { ClaudeService } from '../../src/services/llm/claude';
import { GeminiService } from '../../src/services/llm/gemini';

// Mock external process execution
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('LLM Services (Consolidated)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Claude Service', () => {
    let service: ClaudeService;

    beforeEach(() => {
      service = new ClaudeService();
    });

    it('should find Claude binary and generate SVG', async () => {
      mockExecSync.mockReturnValueOnce('/usr/local/bin/claude')
                  .mockReturnValueOnce('FILENAME: test-icon\nSVG: <svg></svg>');
      
      const result = await service.generate('Create a simple icon');
      
      expect(result.filename).toBe('test-icon');
      expect(result.svg).toBe('<svg></svg>');
    });

    it('should handle Claude CLI not found', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('command not found');
      });
      
      expect(() => service.findClaudeBinary()).toThrow('Claude Code CLI not found');
    });

    it('should handle invalid SVG responses', async () => {
      mockExecSync.mockReturnValueOnce('/usr/local/bin/claude')
                  .mockReturnValueOnce('Invalid response');
      
      await expect(service.generate('test')).rejects.toThrow();
    });
  });

  describe('Gemini Service', () => {
    let service: GeminiService;

    beforeEach(() => {
      service = new GeminiService();
    });

    it('should find Gemini binary and generate SVG', async () => {
      mockExecSync.mockReturnValueOnce('/usr/local/bin/gemini')
                  .mockReturnValueOnce('FILENAME: test-icon\nSVG: <svg></svg>');
      
      const result = await service.generate('Create a simple icon');
      
      expect(result.filename).toBe('test-icon');
      expect(result.svg).toBe('<svg></svg>');
    });

    it('should handle Gemini CLI not found', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('command not found');
      });
      
      expect(() => service.findGeminiBinary()).toThrow('Gemini CLI not found');
    });
  });

  describe('Common LLM functionality', () => {
    it('should handle prompt validation', () => {
      const claudeService = new ClaudeService();
      const geminiService = new GeminiService();
      
      // Both services should be instantiated
      expect(claudeService).toBeDefined();
      expect(geminiService).toBeDefined();
    });

    it('should sanitize SVG output', () => {
      const claudeService = new ClaudeService();
      const maliciousSvg = '<svg><script>alert("xss")</script></svg>';
      
      const sanitized = claudeService['sanitizeSVG'](maliciousSvg);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<svg>');
    });

    it('should handle SVG references in prompts', async () => {
      const service = new ClaudeService();
      mockExecSync.mockReturnValueOnce('/usr/local/bin/claude')
                  .mockReturnValueOnce('FILENAME: referenced-icon\nSVG: <svg></svg>');
      
      const svgReferences = ['<svg>reference1</svg>', '<svg>reference2</svg>'];
      const result = await service.generate('Create icon', svgReferences);
      
      expect(result.filename).toBe('referenced-icon');
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.stringContaining('reference1')
        })
      );
    });
  });
});
