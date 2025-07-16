import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { execSync } from 'child_process';
import { LLMService } from '../../src/services/llm';

// Mock subprocess execution
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn()
}));

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('LLMService', () => {
  let service: LLMService;

  beforeEach(() => {
    service = new LLMService();
    jest.clearAllMocks();
  });

  describe('Claude CLI detection', () => {
    it('should find claude binary in PATH', () => {
      mockExecSync.mockReturnValue('/usr/local/bin/claude');
      
      const claudePath = service.findClaudeBinary();
      
      expect(claudePath).toBe('/usr/local/bin/claude');
      expect(mockExecSync).toHaveBeenCalledWith('which claude', expect.any(Object));
    });

    it('should throw error when claude binary not found', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('command not found');
      });
      
      expect(() => service.findClaudeBinary()).toThrow('Claude Code CLI not found');
    });
  });

  describe('prompt validation', () => {
    it('should accept valid prompts', () => {
      const validPrompt = 'Change the color from blue to red';
      
      expect(() => service.validatePrompt(validPrompt)).not.toThrow();
    });

    it('should reject empty prompts', () => {
      expect(() => service.validatePrompt('')).toThrow('Prompt cannot be empty');
      expect(() => service.validatePrompt('   ')).toThrow('Prompt cannot be empty');
    });

    it('should reject prompts that are too long', () => {
      const longPrompt = 'a'.repeat(2001);
      
      expect(() => service.validatePrompt(longPrompt)).toThrow('Prompt too long');
    });

    it('should reject prompts with malicious content', () => {
      const maliciousPrompts = [
        'Create icon; rm -rf /',
        'Create icon && cat /etc/passwd',
        'Create icon | curl evil.com',
        'Create icon $(whoami)',
        'Create icon `ls -la`'
      ];

      maliciousPrompts.forEach(prompt => {
        expect(() => service.validatePrompt(prompt)).toThrow('Invalid characters in prompt');
      });
    });
  });

  describe('SVG generation', () => {
    it('should generate SVG from prompt and references', async () => {
      const mockResponse = `
FILENAME: red-circle-icon
SVG: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="red"/>
</svg>
      `;

      mockExecSync
        .mockReturnValueOnce('/usr/local/bin/claude') // First call: which claude (success)
        .mockReturnValueOnce(mockResponse); // Second call: claude execution (success)

      const svgReferences = ['<svg><circle fill="blue"/></svg>'];
      const result = await service.generateSVG('Change blue to red', svgReferences);

      expect(result.svg).toContain('<svg');
      expect(result.svg).toContain('fill="red"');
      expect(result.filename).toBe('red-circle-icon');
    });

    it('should handle missing filename in response', async () => {
      const mockResponse = `
SVG: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="red"/>
</svg>
      `;

      mockExecSync
        .mockReturnValueOnce('/usr/local/bin/claude') // First call: which claude (success)
        .mockReturnValueOnce(mockResponse); // Second call: claude execution (success)

      const svgReferences = ['<svg><circle fill="blue"/></svg>'];
      const result = await service.generateSVG('Change blue to red', svgReferences);

      expect(result.svg).toContain('<svg');
      expect(result.filename).toBe('generated-icon');
    });

    it('should handle CLI timeout errors', async () => {
      mockExecSync
        .mockReturnValueOnce('/usr/local/bin/claude') // First call: which claude (success)
        .mockImplementationOnce(() => {               // Second call: claude execution (timeout)
          throw new Error('Command timed out');
        });

      const svgReferences = ['<svg><circle fill="blue"/></svg>'];
      
      await expect(service.generateSVG('test prompt', svgReferences))
        .rejects.toThrow('Claude CLI execution failed');
    });

    it('should handle invalid CLI response format', async () => {
      mockExecSync
        .mockReturnValueOnce('/usr/local/bin/claude') // First call: which claude (success)
        .mockReturnValueOnce('Invalid response format'); // Second call: claude execution (invalid format)

      const svgReferences = ['<svg><circle fill="blue"/></svg>'];
      
      await expect(service.generateSVG('test prompt', svgReferences))
        .rejects.toThrow('Invalid response format from Claude CLI');
    });
  });

  describe('SVG sanitization', () => {
    it('should remove script tags from SVG', () => {
      const maliciousSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <script>alert('xss')</script>
          <circle cx="50" cy="50" r="40" fill="red"/>
        </svg>
      `;

      const sanitized = service.sanitizeSVG(maliciousSVG);

      expect(sanitized).toContain('<svg');
      expect(sanitized).toContain('<circle');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should remove foreignObject elements', () => {
      const maliciousSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <foreignObject width="100" height="100">
            <div>dangerous content</div>
          </foreignObject>
          <circle cx="50" cy="50" r="40" fill="red"/>
        </svg>
      `;

      const sanitized = service.sanitizeSVG(maliciousSVG);

      expect(sanitized).toContain('<svg');
      expect(sanitized).toContain('<circle');
      expect(sanitized).not.toContain('<foreignObject');
      expect(sanitized).not.toContain('dangerous content');
    });

    it('should remove event handlers', () => {
      const maliciousSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="red" onclick="alert('xss')"/>
        </svg>
      `;

      const sanitized = service.sanitizeSVG(maliciousSVG);

      expect(sanitized).toContain('<svg');
      expect(sanitized).toContain('<circle');
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('alert');
    });
  });

  describe('prompt building', () => {
    it('should build proper system prompt with SVG references', () => {
      const userPrompt = 'Change blue to red';
      const svgReferences = [
        '<svg><circle fill="blue"/></svg>',
        '<svg><rect fill="blue"/></svg>'
      ];

      const systemPrompt = service.buildSystemPrompt(userPrompt, svgReferences);

      expect(systemPrompt).toContain('You are an expert SVG icon designer');
      expect(systemPrompt).toContain('Change blue to red');
      expect(systemPrompt).toContain('<svg><circle fill="blue"/></svg>');
      expect(systemPrompt).toContain('<svg><rect fill="blue"/></svg>');
      expect(systemPrompt).toContain('FILENAME:');
      expect(systemPrompt).toContain('SVG:');
    });

    it('should handle empty SVG references', () => {
      const userPrompt = 'Create a simple icon';
      const svgReferences: string[] = [];

      const systemPrompt = service.buildSystemPrompt(userPrompt, svgReferences);

      expect(systemPrompt).toContain('You are an expert SVG icon designer');
      expect(systemPrompt).toContain('Create a simple icon');
      expect(systemPrompt).toContain('FILENAME:');
      expect(systemPrompt).toContain('SVG:');
    });
  });

  describe('configuration', () => {
    it('should use default timeout of 60 seconds', () => {
      expect(service.getTimeout()).toBe(60000);
    });

    it('should respect custom timeout', () => {
      const customService = new LLMService({ timeout: 30000 });
      expect(customService.getTimeout()).toBe(30000);
    });

    it('should use default max prompt length of 2000 characters', () => {
      expect(service.getMaxPromptLength()).toBe(2000);
    });
  });
});