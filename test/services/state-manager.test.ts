import { StateManager } from '../../src/services/state-manager';
import { GenerationState, GenerationPhase, StepStatus, IconGenerationRequest } from '../../src/types';

describe('State Manager Service', () => {
  let stateManager: StateManager;
  let mockRequest: IconGenerationRequest;

  beforeEach(() => {
    stateManager = new StateManager();
    mockRequest = {
      prompt: 'Create a star icon',
      reference_paths: ['/test/file1.png', '/test/file2.svg'],
      output_name: 'star-icon',
      output_path: '/test/output',
      style: 'black-white-flat'
    };
  });

  describe('Session Creation', () => {
    it('should create a new session with correct initial state', () => {
      const state = stateManager.createSession(mockRequest);

      expect(state.sessionId).toBeDefined();
      expect(state.sessionId).toMatch(/^icon-gen-\d+-[a-z0-9]+$/);
      expect(state.request).toEqual(mockRequest);
      expect(state.currentPhase).toBe('validation');
      expect(state.startTime).toBeInstanceOf(Date);
      expect(state.context.validatedFiles).toEqual([]);
      expect(state.context.errors).toEqual([]);
    });

    it('should initialize all 5 phases as pending', () => {
      const state = stateManager.createSession(mockRequest);

      expect(state.steps).toHaveLength(5);
      
      const expectedPhases: GenerationPhase[] = ['validation', 'analysis', 'generation', 'refinement', 'output'];
      expectedPhases.forEach((phase, index) => {
        expect(state.steps[index].step).toBe(phase);
        expect(state.steps[index].status).toBe('pending');
        expect(state.steps[index].message).toContain(phase.charAt(0).toUpperCase() + phase.slice(1));
        expect(state.steps[index].timestamp).toBeInstanceOf(Date);
      });
    });

    it('should generate unique session IDs', () => {
      const state1 = stateManager.createSession(mockRequest);
      const state2 = stateManager.createSession(mockRequest);

      expect(state1.sessionId).not.toBe(state2.sessionId);
    });

    it('should store sessions internally', () => {
      const state = stateManager.createSession(mockRequest);
      const retrieved = stateManager.getSession(state.sessionId);

      expect(retrieved).toBe(state);
    });
  });

  describe('Session Retrieval', () => {
    it('should retrieve existing session', () => {
      const state = stateManager.createSession(mockRequest);
      const retrieved = stateManager.getSession(state.sessionId);

      expect(retrieved).toBe(state);
    });

    it('should return undefined for non-existent session', () => {
      const retrieved = stateManager.getSession('non-existent-id');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('Step Updates', () => {
    let sessionId: string;

    beforeEach(() => {
      const state = stateManager.createSession(mockRequest);
      sessionId = state.sessionId;
    });

    it('should update step status and message', () => {
      stateManager.updateStep(sessionId, 'validation', 'completed', 'Validation successful');

      const state = stateManager.getSession(sessionId);
      const validationStep = state!.steps.find(s => s.step === 'validation');

      expect(validationStep!.status).toBe('completed');
      expect(validationStep!.message).toBe('Validation successful');
      expect(validationStep!.timestamp).toBeInstanceOf(Date);
    });

    it('should update current phase when status is in_progress', () => {
      stateManager.updateStep(sessionId, 'analysis', 'in_progress', 'Starting analysis');

      const state = stateManager.getSession(sessionId);
      
      expect(state!.currentPhase).toBe('analysis');
    });

    it('should not change current phase for other statuses', () => {
      stateManager.updateStep(sessionId, 'analysis', 'completed', 'Analysis complete');

      const state = stateManager.getSession(sessionId);
      
      expect(state!.currentPhase).toBe('validation'); // Should remain validation
    });

    it('should handle step details', () => {
      const details = { filesProcessed: 2, errors: [] };
      stateManager.updateStep(sessionId, 'validation', 'completed', 'Done', details);

      const state = stateManager.getSession(sessionId);
      const validationStep = state!.steps.find(s => s.step === 'validation');

      expect(validationStep!.details).toEqual(details);
    });

    it('should handle invalid session ID gracefully', () => {
      expect(() => {
        stateManager.updateStep('invalid-id', 'validation', 'completed', 'Test');
      }).not.toThrow();
    });

    it('should handle invalid phase gracefully', () => {
      expect(() => {
        stateManager.updateStep(sessionId, 'invalid-phase' as GenerationPhase, 'completed', 'Test');
      }).not.toThrow();
    });
  });

  describe('Phase Transitions', () => {
    let sessionId: string;

    beforeEach(() => {
      const state = stateManager.createSession(mockRequest);
      sessionId = state.sessionId;
    });

    it('should transition from validation to analysis', () => {
      stateManager.transitionPhase(sessionId, 'validation', 'analysis');

      const state = stateManager.getSession(sessionId);
      const validationStep = state!.steps.find(s => s.step === 'validation');
      const analysisStep = state!.steps.find(s => s.step === 'analysis');

      expect(validationStep!.status).toBe('completed');
      expect(validationStep!.message).toContain('validation phase completed');
      expect(analysisStep!.status).toBe('in_progress');
      expect(analysisStep!.message).toContain('Starting analysis');
      expect(state!.currentPhase).toBe('analysis');
    });

    it('should handle complete phase progression', () => {
      const phases: Array<[GenerationPhase, GenerationPhase]> = [
        ['validation', 'analysis'],
        ['analysis', 'generation'],
        ['generation', 'refinement'],
        ['refinement', 'output']
      ];

      phases.forEach(([from, to]) => {
        stateManager.transitionPhase(sessionId, from, to);
        
        const state = stateManager.getSession(sessionId);
        expect(state!.currentPhase).toBe(to);
      });
    });

    it('should handle invalid session ID gracefully', () => {
      expect(() => {
        stateManager.transitionPhase('invalid-id', 'validation', 'analysis');
      }).not.toThrow();
    });
  });

  describe('Specialized Phase Starters', () => {
    let sessionId: string;

    beforeEach(() => {
      const state = stateManager.createSession(mockRequest);
      sessionId = state.sessionId;
    });

    it('should start validation phase correctly', () => {
      stateManager.startValidation(sessionId);

      const state = stateManager.getSession(sessionId);
      const validationStep = state!.steps.find(s => s.step === 'validation');

      expect(validationStep!.status).toBe('in_progress');
      expect(state!.currentPhase).toBe('validation');
    });

    it('should start analysis phase correctly', () => {
      stateManager.startAnalysis(sessionId);

      const state = stateManager.getSession(sessionId);
      const analysisStep = state!.steps.find(s => s.step === 'analysis');

      expect(analysisStep!.status).toBe('in_progress');
      expect(state!.currentPhase).toBe('analysis');
    });

    it('should start generation phase correctly', () => {
      stateManager.startGeneration(sessionId);

      const state = stateManager.getSession(sessionId);
      const generationStep = state!.steps.find(s => s.step === 'generation');

      expect(generationStep!.status).toBe('in_progress');
      expect(state!.currentPhase).toBe('generation');
    });

    it('should start output phase correctly', () => {
      stateManager.startOutput(sessionId);

      const state = stateManager.getSession(sessionId);
      const outputStep = state!.steps.find(s => s.step === 'output');

      expect(outputStep!.status).toBe('in_progress');
      expect(state!.currentPhase).toBe('output');
    });

    it('should skip phase correctly', () => {
      stateManager.skipPhase(sessionId, 'refinement', 'Skipping refinement for basic generation');

      const state = stateManager.getSession(sessionId);
      const refinementStep = state!.steps.find(s => s.step === 'refinement');

      expect(refinementStep!.status).toBe('skipped');
      expect(refinementStep!.message).toBe('Skipped: Skipping refinement for basic generation');
    });
  });

  describe('Context Management', () => {
    let sessionId: string;

    beforeEach(() => {
      const state = stateManager.createSession(mockRequest);
      sessionId = state.sessionId;
    });

    it('should update context with additional data', () => {
      const contextUpdate = {
        validatedFiles: ['/test/file1.png'],
        generatedSvg: '<svg>test</svg>'
      };

      stateManager.updateContext(sessionId, contextUpdate);

      const state = stateManager.getSession(sessionId);
      
      expect(state!.context.validatedFiles).toEqual(['/test/file1.png']);
      expect(state!.context.generatedSvg).toBe('<svg>test</svg>');
    });

    it('should merge context updates', () => {
      stateManager.updateContext(sessionId, { validatedFiles: ['/file1.png'] });
      stateManager.updateContext(sessionId, { generatedSvg: '<svg>test</svg>' });

      const state = stateManager.getSession(sessionId);
      
      expect(state!.context.validatedFiles).toEqual(['/file1.png']);
      expect(state!.context.generatedSvg).toBe('<svg>test</svg>');
    });
  });

  describe('Error Handling', () => {
    let sessionId: string;

    beforeEach(() => {
      const state = stateManager.createSession(mockRequest);
      sessionId = state.sessionId;
    });

    it('should add errors to session context', () => {
      stateManager.addError(sessionId, 'validation', 'File not found');
      stateManager.addError(sessionId, 'generation', 'LLM error');

      const state = stateManager.getSession(sessionId);
      
      expect(state!.context.errors).toEqual(['validation: File not found', 'generation: LLM error']);
    });

    it('should update step status to failed when adding error', () => {
      stateManager.addError(sessionId, 'validation', 'Validation failed');

      const state = stateManager.getSession(sessionId);
      const validationStep = state!.steps.find(s => s.step === 'validation');

      expect(validationStep!.status).toBe('failed');
      expect(validationStep!.message).toBe('Failed: Validation failed');
    });
  });

  describe('Session Utilities', () => {
    let sessionId: string;

    beforeEach(() => {
      const state = stateManager.createSession(mockRequest);
      sessionId = state.sessionId;
    });

    it('should calculate processing time', (done) => {
      // Wait a small amount to ensure time passes
      setTimeout(() => {
        const processingTime = stateManager.getProcessingTime(sessionId);
        expect(processingTime).toBeGreaterThan(0);
        done();
      }, 10);
    });

    it('should return all steps', () => {
      stateManager.updateStep(sessionId, 'validation', 'completed', 'Done');
      
      const steps = stateManager.getAllSteps(sessionId);
      
      expect(steps).toHaveLength(5);
      expect(steps[0].step).toBe('validation');
      expect(steps[0].status).toBe('completed');
    });

    it('should handle session cleanup', () => {
      stateManager.cleanupSession(sessionId);
      
      const retrieved = stateManager.getSession(sessionId);
      expect(retrieved).toBeUndefined();
    });

    it('should handle utilities for non-existent sessions', () => {
      expect(stateManager.getProcessingTime('invalid-id')).toBe(0);
      expect(stateManager.getAllSteps('invalid-id')).toEqual([]);
      expect(() => stateManager.cleanupSession('invalid-id')).not.toThrow();
    });
  });

  describe('Session ID Generation', () => {
    it('should generate valid session IDs', () => {
      const state1 = stateManager.createSession(mockRequest);
      const state2 = stateManager.createSession(mockRequest);

      expect(state1.sessionId).toMatch(/^icon-gen-\d+-[a-z0-9]+$/);
      expect(state2.sessionId).toMatch(/^icon-gen-\d+-[a-z0-9]+$/);
      expect(state1.sessionId).not.toBe(state2.sessionId);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal request', () => {
      const minimalRequest: IconGenerationRequest = {
        prompt: 'Simple icon',
        reference_paths: [],
        output_name: undefined,
        output_path: undefined,
        style: undefined
      };

      const state = stateManager.createSession(minimalRequest);
      
      expect(state.request.prompt).toBe('Simple icon');
      expect(state.request.reference_paths).toEqual([]);
      expect(state.steps).toHaveLength(5);
    });

    it('should handle empty prompt gracefully', () => {
      const emptyRequest: IconGenerationRequest = {
        prompt: '',
        reference_paths: [],
        output_name: undefined,
        output_path: undefined,
        style: undefined
      };

      const state = stateManager.createSession(emptyRequest);
      
      expect(state.request.prompt).toBe('');
      expect(state.steps).toHaveLength(5);
    });
  });
});