/**
 * Centralized test constants to avoid magic strings across test files
 */

// Test file paths
export const TEST_PATHS = {
  FIXTURES: {
    PNG_FILE: 'test/fixtures/test.png',
    SVG_FILE: 'test/fixtures/blue-square.svg', 
    MONSTERA_PNG: 'test/fixtures/monstera-leaf.png',
    USER_SVG: 'test/fixtures/star-icon.svg',
    INVALID_FILE: 'test/fixtures/nonexistent.txt'
  },
  OUTPUT: {
    BASE_DIR: 'test/test-output',
    TEMP_PNG: 'test/test-output/temp-test.png',
    TEMP_SVG: 'test/test-output/temp-test.svg'
  }
} as const;

// Test prompts
export const TEST_PROMPTS = {
  SIMPLE: 'Create a simple star icon',
  COMPLEX: 'Create a detailed user profile icon with modern styling',
  STAR: 'Create a five-pointed star icon',
  CIRCLE: 'Create a simple circle icon',
  MONSTERA: 'Create a monstera plant icon with natural leaf patterns and botanical details',
  ADD_USER: 'Create an add user icon in black and white with simple, clean lines',
  CODE_REVIEW: 'Learn the visual style from these examples across different domains and create a code review icon'
} as const;

// Test styles
export const TEST_STYLES = {
  BLACK_WHITE_FLAT: 'black-white-flat',
  MINIMAL: 'minimal',
  DETAILED: 'detailed'
} as const;

// Test SVG content
export const TEST_SVG_CONTENT = {
  SIMPLE_STAR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>',
  SIMPLE_CIRCLE: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
  SIMPLE_RECT: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20"/></svg>',
  INVALID_SVG: '<notsvg>invalid content</notsvg>'
} as const;

// Test session data
export const TEST_SESSION = {
  ID_PATTERN: /^session-[a-f0-9-]+$/,
  MOCK_ID: 'test-session-123',
  MOCK_TIMESTAMP: new Date('2025-08-16T10:00:00Z')
} as const;

// Test file system
export const TEST_FILE_SYSTEM = {
  PNG_EXTENSIONS: ['.png', '.PNG'],
  SVG_EXTENSIONS: ['.svg', '.SVG'],
  INVALID_EXTENSIONS: ['.txt', '.jpg', '.gif', '.pdf'],
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  TEMP_FILE_PREFIX: 'temp-test-'
} as const;

// Test LLM responses
export const TEST_LLM_RESPONSES = {
  SUCCESS_INDICATORS: ['claude', 'gemini', 'gpt-4v', 'vision', 'multimodal'],
  NON_MULTIMODAL_INDICATORS: ['gpt-3.5', 'basic', 'text-only'],
  ERROR_MESSAGES: {
    PNG_NOT_SUPPORTED: 'PNG references require a multimodal LLM',
    FILE_NOT_FOUND: 'File not found',
    INVALID_FORMAT: 'Unsupported file format'
  }
} as const;

// Test timeouts and performance
export const TEST_PERFORMANCE = {
  MAX_GENERATION_TIME: 30000, // 30 seconds
  MAX_PROCESSING_TIME: 5000,  // 5 seconds
  MIN_PROCESSING_TIME: 1,     // 1 millisecond
  REGRESSION_TIMEOUT: 30000   // 30 seconds for regression tests
} as const;

// Test output validation
export const TEST_VALIDATION = {
  MIN_SVG_LENGTH: 50,
  MAX_SVG_LENGTH: 10000,
  REQUIRED_SVG_ATTRIBUTES: ['xmlns', 'viewBox'],
  FORBIDDEN_SVG_ELEMENTS: ['script', 'iframe', 'object', 'embed'],
  FILENAME_PATTERN: /^[a-z0-9-]+$/
} as const;