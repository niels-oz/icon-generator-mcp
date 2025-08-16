import { VisualFormatter } from '../../src/services/visual-formatter';
import { GenerationStep, GenerationState, GenerationPhase, StepStatus } from '../../src/types';
import chalk from 'chalk';

// Mock chalk to ensure consistent snapshot output
jest.mock('chalk', () => {
  const mockChalk = {
    blue: Object.assign(jest.fn((text) => `[BLUE]${text}[/BLUE]`), { bold: jest.fn((text) => `[BLUE_BOLD]${text}[/BLUE_BOLD]`) }),
    cyan: jest.fn((text) => `[CYAN]${text}[/CYAN]`),
    magenta: jest.fn((text) => `[MAGENTA]${text}[/MAGENTA]`),
    green: Object.assign(jest.fn((text) => `[GREEN]${text}[/GREEN]`), { bold: jest.fn((text) => `[GREEN_BOLD]${text}[/GREEN_BOLD]`) }),
    red: Object.assign(jest.fn((text) => `[RED]${text}[/RED]`), { bold: jest.fn((text) => `[RED_BOLD]${text}[/RED_BOLD]`) }),
    yellow: jest.fn((text) => `[YELLOW]${text}[/YELLOW]`),
    gray: jest.fn((text) => `[GRAY]${text}[/GRAY]`),
    white: jest.fn((text) => `[WHITE]${text}[/WHITE]`),
    underline: jest.fn((text) => `[UNDERLINE]${text}[/UNDERLINE]`),
    bold: Object.assign(
      jest.fn((text) => `[BOLD]${text}[/BOLD]`),
      {
        blue: jest.fn((text) => `[BOLD_BLUE]${text}[/BOLD_BLUE]`),
        green: jest.fn((text) => `[BOLD_GREEN]${text}[/BOLD_GREEN]`),
        red: jest.fn((text) => `[BOLD_RED]${text}[/BOLD_RED]`),
      }
    )
  };
  return mockChalk;
});

describe('Visual Formatter Service', () => {
  let formatter: VisualFormatter;
  let mockStep: GenerationStep;
  let mockState: GenerationState;

  beforeEach(() => {
    // Mock Date.now() to return consistent timestamps for snapshots
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-08-16T10:00:00Z').getTime());
    formatter = new VisualFormatter();
    
    mockStep = {
      step: 'validation' as GenerationPhase,
      status: 'completed' as StepStatus,
      message: 'Validated 2 input files and prompt',
      timestamp: new Date('2025-08-16T10:00:00Z'),
      details: undefined
    };

    mockState = {
      sessionId: 'test-session-123',
      request: {
        prompt: 'Create a star icon',
        reference_paths: ['/test/file1.png', '/test/file2.svg'],
        output_name: undefined,
        output_path: undefined,
        style: undefined
      },
      currentPhase: 'validation' as GenerationPhase,
      startTime: new Date('2025-08-16T09:59:00Z'),
      steps: [mockStep],
      context: {
        validatedFiles: ['/test/file1.png', '/test/file2.svg'],
        svgReferences: [],
        errors: [],
        generatedSvg: undefined,
        suggestedFilename: undefined,
        outputPath: undefined
      }
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Step Formatting', () => {
    it('should format a completed validation step correctly', () => {
      const result = formatter.formatStep(mockStep);
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('🔍'); // validation icon
      expect(result).toContain('✅'); // completed icon
      expect(result).toContain('[BLUE]VALIDATION[/BLUE]');
      expect(result).toContain('[GREEN]COMPLETED[/GREEN]');
      expect(result).toContain('Validated 2 input files and prompt');
    });

    it('should format different phase types correctly', () => {
      const phases: Array<{ phase: GenerationPhase; icon: string; color: string }> = [
        { phase: 'validation', icon: '🔍', color: '[BLUE]' },
        { phase: 'analysis', icon: '📊', color: '[CYAN]' },
        { phase: 'generation', icon: '🎨', color: '[MAGENTA]' },
        { phase: 'refinement', icon: '✨', color: '[GREEN]' },
        { phase: 'output', icon: '💾', color: '[BLUE]' }
      ];

      phases.forEach(({ phase, icon, color }) => {
        const step = { ...mockStep, step: phase };
        const result = formatter.formatStep(step);
        
        expect(result).toContain(icon);
        expect(result).toContain(color);
      });
    });

    it('should format different status types correctly', () => {
      const statuses: Array<{ status: StepStatus; icon: string; color: string }> = [
        { status: 'pending', icon: '⏳', color: '[GRAY]' },
        { status: 'in_progress', icon: '🔄', color: '[YELLOW]' },
        { status: 'completed', icon: '✅', color: '[GREEN]' },
        { status: 'failed', icon: '❌', color: '[RED]' },
        { status: 'skipped', icon: '⏭️', color: '[GRAY]' }
      ];

      statuses.forEach(({ status, icon, color }) => {
        const step = { ...mockStep, status };
        const result = formatter.formatStep(step);
        
        expect(result).toContain(icon);
        expect(result).toContain(color);
      });
    });

    it('should handle underscore in status names', () => {
      const step = { ...mockStep, status: 'in_progress' as StepStatus };
      const result = formatter.formatStep(step);
      
      expect(result).toContain('IN PROGRESS');
      expect(result).not.toContain('IN_PROGRESS');
    });
  });

  describe('Progress Formatting', () => {
    it('should format progress with correct percentage calculation', () => {
      const stateWith3Completed = {
        ...mockState,
        steps: [
          { ...mockStep, step: 'validation' as GenerationPhase, status: 'completed' as StepStatus },
          { ...mockStep, step: 'analysis' as GenerationPhase, status: 'completed' as StepStatus },
          { ...mockStep, step: 'generation' as GenerationPhase, status: 'completed' as StepStatus }
        ]
      };

      const result = formatter.formatProgress(stateWith3Completed);
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('🎯 Icon Generation Progress');
      expect(result).toContain('60%'); // 3/5 phases = 60%
      expect(result).toContain('Current Phase: [BLUE]VALIDATION[/BLUE]');
      expect(result).toContain('Session: test-session-123');
    });

    it('should create progress bar with correct filled/empty ratio', () => {
      // Access private method through type assertion for testing
      const progressBar = (formatter as any).createProgressBar(60, 20);
      
      expect(progressBar).toContain('[GREEN]'); // filled portion
      expect(progressBar).toContain('[GRAY]'); // empty portion
    });

    it('should format duration correctly', () => {
      const formatDuration = (formatter as any).formatDuration.bind(formatter);
      
      expect(formatDuration(30000)).toBe('30s');
      expect(formatDuration(90000)).toBe('1m 30s');
      expect(formatDuration(125000)).toBe('2m 5s');
    });
  });

  describe('Generation Summary Formatting', () => {
    it('should format basic summary correctly', () => {
      const result = formatter.formatGenerationSummary(mockState);
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('📋 Generation Summary');
      expect(result).toContain('Session: test-session-123');
      expect(result).toContain('Validated 2 input files and prompt');
    });

    it('should include input files when present', () => {
      const result = formatter.formatGenerationSummary(mockState);
      
      expect(result).toContain('📁 Input Files:');
      expect(result).toContain('/test/file1.png');
      expect(result).toContain('/test/file2.svg');
    });

    it('should include errors when present', () => {
      const stateWithErrors = {
        ...mockState,
        context: {
          ...mockState.context,
          errors: ['File not found', 'Invalid format']
        }
      };

      const result = formatter.formatGenerationSummary(stateWithErrors);
      
      expect(result).toContain('⚠️ Errors:');
      expect(result).toContain('File not found');
      expect(result).toContain('Invalid format');
    });

    it('should not include input files section when no files', () => {
      const stateNoFiles = {
        ...mockState,
        context: { ...mockState.context, validatedFiles: [] }
      };

      const result = formatter.formatGenerationSummary(stateNoFiles);
      
      expect(result).not.toContain('📁 Input Files:');
    });
  });

  describe('Phase Transition Formatting', () => {
    it('should format phase transitions correctly', () => {
      const result = formatter.formatPhaseTransition('validation', 'analysis');
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('🔍'); // validation icon
      expect(result).toContain('📊'); // analysis icon
      expect(result).toContain('[BLUE]validation[/BLUE]');
      expect(result).toContain('[CYAN]analysis[/CYAN]');
      expect(result).toContain('→');
    });

    it('should handle all valid phase transitions', () => {
      const transitions: Array<[GenerationPhase, GenerationPhase]> = [
        ['validation', 'analysis'],
        ['analysis', 'generation'],
        ['generation', 'refinement'],
        ['refinement', 'output']
      ];

      transitions.forEach(([from, to]) => {
        const result = formatter.formatPhaseTransition(from, to);
        expect(result).toContain('→');
        expect(result.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Final Result Formatting', () => {
    it('should format successful result correctly', () => {
      const successState = {
        ...mockState,
        context: { ...mockState.context, outputPath: '/test/output/star-icon.svg' }
      };

      const result = formatter.formatFinalResult(successState, true);
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('🎉');
      expect(result).toContain('[GREEN_BOLD]SUCCESS[/GREEN_BOLD]');
      expect(result).toContain('📁 Saved to:');
      expect(result).toContain('[UNDERLINE]/test/output/star-icon.svg[/UNDERLINE]');
    });

    it('should format failed result correctly', () => {
      const failedState = {
        ...mockState,
        context: { ...mockState.context, errors: ['Generation failed', 'Critical error'] }
      };

      const result = formatter.formatFinalResult(failedState, false);
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('💥');
      expect(result).toContain('[RED_BOLD]FAILED[/RED_BOLD]');
      expect(result).toContain('❌ Final Error:');
      expect(result).toContain('Critical error'); // Should show last error
    });

    it('should include duration in all results', () => {
      const result = formatter.formatFinalResult(mockState, true);
      
      expect(result).toContain('Duration:');
      expect(result).toMatch(/\d+s/); // Should contain duration in seconds
    });
  });

  describe('Box Formatting Helper', () => {
    it('should create properly formatted boxes', () => {
      const result = formatter.formatBox('Test Title', 'Line 1\nLine 2\nLonger line 3');
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('┌');
      expect(result).toContain('┐');
      expect(result).toContain('└');
      expect(result).toContain('┘');
      expect(result).toContain('Test Title');
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Longer line 3');
    });

    it('should handle single line content', () => {
      const result = formatter.formatBox('Simple', 'Just one line');
      
      expect(result).toContain('Just one line');
      expect(result).toContain('Simple');
    });

    it('should handle empty content', () => {
      const result = formatter.formatBox('Empty', '');
      
      expect(result).toContain('Empty');
      expect(result).toContain('┌');
      expect(result).toContain('┘');
    });
  });

  describe('ANSI Stripping', () => {
    it('should strip ANSI codes for length calculation', () => {
      const stripAnsi = (formatter as any).stripAnsi.bind(formatter);
      
      expect(stripAnsi('\u001b[31mRed text\u001b[0m')).toBe('Red text');
      expect(stripAnsi('Normal text')).toBe('Normal text');
      expect(stripAnsi('\u001b[1;32mBold green\u001b[0m text')).toBe('Bold green text');
    });
  });
});