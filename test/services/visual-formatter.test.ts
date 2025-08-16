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
  let mockState: GenerationState;

  beforeEach(() => {
    // Mock Date.now() to return consistent timestamps for snapshots
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-08-16T10:00:00Z').getTime());
    formatter = new VisualFormatter();
    
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
      steps: [
        {
          step: 'validation' as GenerationPhase,
          status: 'completed' as StepStatus,
          message: 'Validated 2 input files and prompt',
          timestamp: new Date('2025-08-16T10:00:00Z'),
          details: undefined
        }
      ],
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

  describe('Core Formatting Behaviors', () => {
    it('should format a single step correctly', () => {
      const step = mockState.steps[0];
      const result = formatter.formatStep(step);
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('🔍'); // validation icon
      expect(result).toContain('✅'); // completed icon
      expect(result).toContain('VALIDATION');
      expect(result).toContain('COMPLETED');
      expect(result).toContain('Validated 2 input files and prompt');
    });

    it('should format the overall progress display', () => {
      const stateWith3Completed = {
        ...mockState,
        steps: [
          { ...mockState.steps[0], step: 'validation' as GenerationPhase, status: 'completed' as StepStatus },
          { ...mockState.steps[0], step: 'analysis' as GenerationPhase, status: 'completed' as StepStatus },
          { ...mockState.steps[0], step: 'generation' as GenerationPhase, status: 'completed' as StepStatus }
        ]
      };

      const result = formatter.formatProgress(stateWith3Completed);
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('🎯 Icon Generation Progress');
      expect(result).toContain('60%'); // 3/5 phases = 60%
      expect(result).toContain('Session: test-session-123');
    });

    it('should format the final generation summary for a successful run', () => {
      const result = formatter.formatGenerationSummary(mockState);
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('📋 Generation Summary');
      expect(result).toContain('Session: test-session-123');
      expect(result).toContain('📁 Input Files:');
      expect(result).toContain('/test/file1.png');
      expect(result).toContain('/test/file2.svg');
    });

    it('should format the final generation summary for a failed run', () => {
      const failedState = {
        ...mockState,
        context: {
          ...mockState.context,
          errors: ['File not found', 'LLM generation failed']
        }
      };

      const result = formatter.formatGenerationSummary(failedState);
      
      expect(result).toMatchSnapshot();
      expect(result).toContain('⚠️ Errors:');
      expect(result).toContain('File not found');
      expect(result).toContain('LLM generation failed');
    });

    it('should format the final result message (success and failure)', () => {
      // Test successful result
      const successState = {
        ...mockState,
        context: { ...mockState.context, outputPath: '/test/output/star-icon.svg' }
      };

      const successResult = formatter.formatFinalResult(successState, true);
      expect(successResult).toMatchSnapshot();
      expect(successResult).toContain('🎉');
      expect(successResult).toContain('SUCCESS');
      expect(successResult).toContain('📁 Saved to:');

      // Test failed result
      const failedState = {
        ...mockState,
        context: { ...mockState.context, errors: ['Critical error'] }
      };

      const failedResult = formatter.formatFinalResult(failedState, false);
      expect(failedResult).toMatchSnapshot();
      expect(failedResult).toContain('💥');
      expect(failedResult).toContain('FAILED');
      expect(failedResult).toContain('❌ Final Error:');
      expect(failedResult).toContain('Critical error');
    });
  });
});