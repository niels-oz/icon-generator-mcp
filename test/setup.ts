/**
 * Jest setup configuration for icon-generator tests
 */
import { jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

// Control console output based on VERBOSE_TESTS environment variable
const shouldMockConsole = !process.env.VERBOSE_TESTS;

if (shouldMockConsole) {
  // Mock console methods to reduce noise in CI/CD environments
  const originalConsole = console;
  
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: originalConsole.error, // Keep errors for debugging
    debug: jest.fn(),
    dir: jest.fn(), // Mock dir to reduce regression test output
  };
} else {
  // In verbose mode, keep original console but add a marker
  console.log('🔍 VERBOSE_TESTS enabled - full console output active');
}

// Configure jest environment with longer timeout for complex tests
jest.setTimeout(process.env.CI ? 60000 : 30000);

// Ensure test output directory exists
const testOutputDir = path.join(process.cwd(), 'test/test-output');
if (!fs.existsSync(testOutputDir)) {
  fs.mkdirSync(testOutputDir, { recursive: true });
}

// Export utility for tests to check if verbose mode is enabled
(global as any).isVerboseTestMode = () => Boolean(process.env.VERBOSE_TESTS);