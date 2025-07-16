// Test setup file for Jest
import { jest } from '@jest/globals';

// Extend Jest timeout for integration tests
jest.setTimeout(30000);

// Mock console.log in tests to keep output clean
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};