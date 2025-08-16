import { StateManager } from '../../src/services/state-manager';
import { GenerationState, GenerationPhase, IconGenerationRequest } from '../../src/types';
import { TEST_PROMPTS } from '../test-constants';

describe('State Manager Service', () => {
  let stateManager: StateManager;
  let mockRequest: IconGenerationRequest;

  beforeEach(() => {
    stateManager = new StateManager();
    mockRequest = {
      prompt: TEST_PROMPTS.SIMPLE,
      reference_paths: ['/test/file1.png', '/test/file2.svg'],
      output_name: 'star-icon',
      output_path: '/test/output',
      style: 'black-white-flat'
    };
  });

  describe('Core State Machine Logic', () => {
    it('should create a session with a valid initial state', () => {
      const state = stateManager.createSession(mockRequest);

      expect(state.sessionId).toBeDefined();
      expect(state.sessionId).toMatch(/^icon-gen-\d+-[a-z0-9]+$/);
      expect(state.request).toEqual(mockRequest);
      expect(state.currentPhase).toBe('validation');
      expect(state.startTime).toBeInstanceOf(Date);
      expect(state.context.validatedFiles).toEqual([]);
      expect(state.context.errors).toEqual([]);
      expect(state.steps).toHaveLength(5);
      
      // Verify all phases are initialized as pending
      const expectedPhases = ['validation', 'analysis', 'generation', 'refinement', 'output'];
      expectedPhases.forEach((phase, index) => {
        expect(state.steps[index].step).toBe(phase);
        expect(state.steps[index].status).toBe('pending');
      });
    });

    it('should update a step status and message correctly', () => {
      const state = stateManager.createSession(mockRequest);
      
      stateManager.updateStep(state.sessionId, 'validation', 'completed', 'Validation successful');

      const updatedState = stateManager.getSession(state.sessionId);
      const validationStep = updatedState!.steps.find(s => s.step === 'validation');

      expect(validationStep!.status).toBe('completed');
      expect(validationStep!.message).toBe('Validation successful');
      expect(validationStep!.timestamp).toBeInstanceOf(Date);
    });

    it('should transition between phases, marking the previous as complete', () => {
      const state = stateManager.createSession(mockRequest);
      
      stateManager.transitionPhase(state.sessionId, 'validation', 'analysis');

      const updatedState = stateManager.getSession(state.sessionId);
      const validationStep = updatedState!.steps.find(s => s.step === 'validation');
      const analysisStep = updatedState!.steps.find(s => s.step === 'analysis');

      expect(validationStep!.status).toBe('completed');
      expect(validationStep!.message).toContain('validation phase completed');
      expect(analysisStep!.status).toBe('in_progress');
      expect(analysisStep!.message).toContain('Starting analysis');
      expect(updatedState!.currentPhase).toBe('analysis');
    });

    it('should add an error to the context and mark the step as failed', () => {
      const state = stateManager.createSession(mockRequest);
      
      stateManager.addError(state.sessionId, 'validation', 'File not found');

      const updatedState = stateManager.getSession(state.sessionId);
      const validationStep = updatedState!.steps.find(s => s.step === 'validation');

      expect(updatedState!.context.errors).toContain('validation: File not found');
      expect(validationStep!.status).toBe('failed');
      expect(validationStep!.message).toBe('Failed: File not found');
    });

    it('should skip a phase with a reason', () => {
      const state = stateManager.createSession(mockRequest);
      
      stateManager.skipPhase(state.sessionId, 'refinement', 'Basic generation complete');

      const updatedState = stateManager.getSession(state.sessionId);
      const refinementStep = updatedState!.steps.find(s => s.step === 'refinement');

      expect(refinementStep!.status).toBe('skipped');
      expect(refinementStep!.message).toBe('Skipped: Basic generation complete');
    });

    it('should update the context with new data', () => {
      const state = stateManager.createSession(mockRequest);
      
      stateManager.updateContext(state.sessionId, {
        validatedFiles: ['/test/file1.png'],
        generatedSvg: '<svg>test</svg>'
      });

      const updatedState = stateManager.getSession(state.sessionId);
      
      expect(updatedState!.context.validatedFiles).toEqual(['/test/file1.png']);
      expect(updatedState!.context.generatedSvg).toBe('<svg>test</svg>');
    });

    it('should correctly report total processing time', () => {
      const state = stateManager.createSession(mockRequest);
      
      // Simulate some processing time
      const processingTime = stateManager.getProcessingTime(state.sessionId);
      
      expect(processingTime).toBeGreaterThanOrEqual(0);
      expect(typeof processingTime).toBe('number');
    });

    it('should clean up a session successfully', () => {
      const state = stateManager.createSession(mockRequest);
      
      stateManager.cleanupSession(state.sessionId);
      
      const retrieved = stateManager.getSession(state.sessionId);
      expect(retrieved).toBeUndefined();
    });
  });
});