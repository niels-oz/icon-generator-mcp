import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { execSync } from 'child_process';
import { GeminiService } from '../../../src/services/llm/gemini';

jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    service = new GeminiService();
    jest.clearAllMocks();
  });

  describe('Gemini CLI detection', () => {
    it('should find gemini binary in PATH', () => {
      mockExecSync.mockReturnValue('/usr/local/bin/gemini');
      const geminiPath = service.findGeminiBinary();
      expect(geminiPath).toBe('/usr/local/bin/gemini');
      expect(mockExecSync).toHaveBeenCalledWith('which gemini', expect.any(Object));
    });

    it('should throw error when gemini binary not found', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('command not found');
      });
      expect(() => service.findGeminiBinary()).toThrow('Gemini CLI not found');
    });
  });

  describe('SVG generation', () => {
    it('should generate SVG from prompt', async () => {
      const mockResponse = `
        FILENAME: test-icon
        SVG: <svg></svg>
      `;
      mockExecSync.mockReturnValueOnce('/usr/local/bin/gemini').mockReturnValueOnce(mockResponse);

      const result = await service.generate('a test icon');

      expect(result.svg).toBe('<svg></svg>');
      expect(result.filename).toBe('test-icon');
    });
  });
});
