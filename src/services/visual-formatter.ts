import chalk from 'chalk';
import { GenerationStep, GenerationPhase, StepStatus, GenerationState } from '../types';

export class VisualFormatter {
  private static readonly PHASE_ICONS = {
    validation: '🔍',
    analysis: '📊',
    generation: '🎨',
    refinement: '✨',
    output: '💾'
  };

  private static readonly PHASE_COLORS = {
    validation: chalk.blue,
    analysis: chalk.cyan,
    generation: chalk.magenta,
    refinement: chalk.green,
    output: chalk.blue
  };

  private static readonly STATUS_ICONS = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    failed: '❌',
    skipped: '⏭️'
  };

  private static readonly STATUS_COLORS = {
    pending: chalk.gray,
    in_progress: chalk.yellow,
    completed: chalk.green,
    failed: chalk.red,
    skipped: chalk.gray
  };

  formatStep(step: GenerationStep): string {
    const phaseIcon = VisualFormatter.PHASE_ICONS[step.step];
    const statusIcon = VisualFormatter.STATUS_ICONS[step.status];
    const phaseColor = VisualFormatter.PHASE_COLORS[step.step];
    const statusColor = VisualFormatter.STATUS_COLORS[step.status];

    const phaseText = phaseColor(step.step.toUpperCase());
    const statusText = statusColor(step.status.replace('_', ' ').toUpperCase());
    const timestamp = chalk.gray(step.timestamp.toLocaleTimeString());

    return `${phaseIcon} ${statusIcon} ${phaseText} - ${statusText} ${timestamp}\n   ${chalk.white(step.message)}`;
  }

  formatProgress(state: GenerationState): string {
    const totalSteps = 5; // Number of phases (validation, analysis, generation, refinement, output)
    const completedSteps = state.steps.filter(s => s.status === 'completed').length;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    
    const progressBar = this.createProgressBar(progress);
    const currentPhase = VisualFormatter.PHASE_COLORS[state.currentPhase](state.currentPhase.toUpperCase());

    return `
${chalk.bold.blue('🎯 Icon Generation Progress')}
${progressBar} ${chalk.bold(`${progress}%`)}
${chalk.gray(`Current Phase: ${currentPhase}`)}
${chalk.gray(`Session: ${state.sessionId}`)}
${chalk.gray(`Elapsed: ${this.formatDuration(Date.now() - state.startTime.getTime())}`)}
    `.trim();
  }

  formatGenerationSummary(state: GenerationState): string {
    const header = chalk.bold.blue('📋 Generation Summary');
    const stepsFormatted = state.steps.map(step => this.formatStep(step)).join('\n\n');
    
    let summary = `${header}\n${chalk.gray(`Session: ${state.sessionId}`)}\n\n${stepsFormatted}`;

    // Add context information if available
    if (state.context.validatedFiles.length > 0) {
      summary += `\n\n${chalk.bold('📁 Input Files:')}\n${state.context.validatedFiles.map(f => `   • ${f}`).join('\n')}`;
    }

    if (state.context.errors.length > 0) {
      summary += `\n\n${chalk.bold.red('⚠️ Errors:')}\n${state.context.errors.map(e => `   • ${e}`).join('\n')}`;
    }

    return summary;
  }

  formatPhaseTransition(fromPhase: GenerationPhase, toPhase: GenerationPhase): string {
    const fromIcon = VisualFormatter.PHASE_ICONS[fromPhase];
    const toIcon = VisualFormatter.PHASE_ICONS[toPhase];
    const fromColor = VisualFormatter.PHASE_COLORS[fromPhase];
    const toColor = VisualFormatter.PHASE_COLORS[toPhase];

    return `${fromIcon} ${fromColor(fromPhase)} ${chalk.gray('→')} ${toIcon} ${toColor(toPhase)}`;
  }

  formatFinalResult(state: GenerationState, success: boolean): string {
    const icon = success ? '🎉' : '💥';
    const status = success ? chalk.green.bold('SUCCESS') : chalk.red.bold('FAILED');
    const duration = this.formatDuration(Date.now() - state.startTime.getTime());

    let result = `
${icon} ${status} ${icon}
${chalk.gray(`Duration: ${duration}`)}
    `.trim();

    if (success && state.context.outputPath) {
      result += `\n${chalk.bold.green('📁 Saved to:')} ${chalk.underline(state.context.outputPath)}`;
    }

    if (!success && state.context.errors.length > 0) {
      result += `\n${chalk.bold.red('❌ Final Error:')} ${state.context.errors[state.context.errors.length - 1]}`;
    }

    return result;
  }

  private createProgressBar(percentage: number, width = 20): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  // Helper method for creating boxed output
  formatBox(title: string, content: string, color: typeof chalk.blue = chalk.blue): string {
    const lines = content.split('\n');
    const maxLength = Math.max(title.length, ...lines.map(line => this.stripAnsi(line).length));
    const width = Math.min(maxLength + 4, 80);
    
    const border = '─'.repeat(width - 2);
    const paddedTitle = ` ${title} `.padEnd(width - 2);
    
    let result = color(`┌${border}┐\n`);
    result += color(`│${paddedTitle}│\n`);
    result += color(`├${border}┤\n`);
    
    lines.forEach(line => {
      const paddedLine = ` ${line} `.padEnd(width - 2);
      result += color('│') + paddedLine.substring(0, width - 2) + color('│\n');
    });
    
    result += color(`└${border}┘`);
    
    return result;
  }

  private stripAnsi(text: string): string {
    // Simple ANSI escape code removal for length calculation
    return text.replace(/\u001b\[[0-9;]*m/g, '');
  }
}