import { 
  GenerationState, 
  GenerationStep, 
  GenerationPhase, 
  StepStatus, 
  IconGenerationRequest 
} from '../types';

export class StateManager {
  private sessions = new Map<string, GenerationState>();

  createSession(request: IconGenerationRequest): GenerationState {
    const sessionId = this.generateSessionId();
    
    const state: GenerationState = {
      sessionId,
      request,
      steps: [],
      currentPhase: 'validation',
      startTime: new Date(),
      context: {
        validatedFiles: [],
        svgReferences: [],
        errors: []
      }
    };

    // Initialize all steps as pending
    const phases: GenerationPhase[] = ['validation', 'analysis', 'generation', 'refinement', 'output'];
    phases.forEach(phase => {
      state.steps.push({
        step: phase,
        status: 'pending',
        message: `${phase.charAt(0).toUpperCase() + phase.slice(1)} phase pending`,
        timestamp: new Date()
      });
    });

    this.sessions.set(sessionId, state);
    return state;
  }

  getSession(sessionId: string): GenerationState | undefined {
    return this.sessions.get(sessionId);
  }

  updateStep(sessionId: string, phase: GenerationPhase, status: StepStatus, message: string, details?: any): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;

    const stepIndex = state.steps.findIndex(step => step.step === phase);
    if (stepIndex >= 0) {
      state.steps[stepIndex] = {
        step: phase,
        status,
        message,
        timestamp: new Date(),
        details
      };
    }

    // Update current phase if moving forward
    if (status === 'in_progress') {
      state.currentPhase = phase;
    }
  }

  transitionPhase(sessionId: string, fromPhase: GenerationPhase, toPhase: GenerationPhase): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;

    // Mark current phase as completed
    this.updateStep(sessionId, fromPhase, 'completed', `${fromPhase} phase completed successfully`);
    
    // Start next phase
    this.updateStep(sessionId, toPhase, 'in_progress', `Starting ${toPhase} phase...`);
    
    state.currentPhase = toPhase;
  }

  addError(sessionId: string, phase: GenerationPhase, error: string): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;

    state.context.errors.push(`${phase}: ${error}`);
    this.updateStep(sessionId, phase, 'failed', `Failed: ${error}`);
  }

  skipPhase(sessionId: string, phase: GenerationPhase, reason: string): void {
    this.updateStep(sessionId, phase, 'skipped', `Skipped: ${reason}`);
  }

  updateContext(sessionId: string, updates: Partial<GenerationState['context']>): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;

    state.context = { ...state.context, ...updates };
  }

  isPhaseComplete(sessionId: string, phase: GenerationPhase): boolean {
    const state = this.sessions.get(sessionId);
    if (!state) return false;

    const step = state.steps.find(s => s.step === phase);
    return step?.status === 'completed' || step?.status === 'skipped';
  }

  isPhaseFailed(sessionId: string, phase: GenerationPhase): boolean {
    const state = this.sessions.get(sessionId);
    if (!state) return false;

    const step = state.steps.find(s => s.step === phase);
    return step?.status === 'failed';
  }

  getAllSteps(sessionId: string): GenerationStep[] {
    const state = this.sessions.get(sessionId);
    return state?.steps || [];
  }

  getCurrentPhase(sessionId: string): GenerationPhase | undefined {
    const state = this.sessions.get(sessionId);
    return state?.currentPhase;
  }

  getProcessingTime(sessionId: string): number {
    const state = this.sessions.get(sessionId);
    if (!state) return 0;

    return Date.now() - state.startTime.getTime();
  }

  cleanupSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `icon-gen-${timestamp}-${random}`;
  }

  // Helper methods for common phase transitions
  startValidation(sessionId: string): void {
    this.updateStep(sessionId, 'validation', 'in_progress', 'Validating inputs and dependencies...');
  }

  startAnalysis(sessionId: string): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;
    
    // Update current phase without overriding validation message
    state.currentPhase = 'analysis';
    this.updateStep(sessionId, 'analysis', 'in_progress', 'Analyzing input files...');
  }

  startGeneration(sessionId: string): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;
    
    // Update current phase without overriding analysis message
    state.currentPhase = 'generation';
    this.updateStep(sessionId, 'generation', 'in_progress', 'Generating SVG with visual context...');
  }

  startRefinement(sessionId: string): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;
    
    // Update current phase without overriding generation message
    state.currentPhase = 'refinement';
    this.updateStep(sessionId, 'refinement', 'in_progress', 'Refining generated SVG...');
  }

  startOutput(sessionId: string): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;
    
    // Update current phase without overriding refinement message
    state.currentPhase = 'output';
    this.updateStep(sessionId, 'output', 'in_progress', 'Saving output file...');
  }
}