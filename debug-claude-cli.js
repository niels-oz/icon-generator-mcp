const { execSync } = require('child_process');

// Test basic Claude CLI functionality
console.log('Testing Claude CLI execution...\n');

// Test 1: Very simple prompt
console.log('Test 1: Simple prompt');
const simplePrompt = 'Generate a simple SVG circle. Format: FILENAME: circle\nSVG: <svg>...</svg>';

try {
  const startTime = Date.now();
  const response = execSync('claude', {
    input: simplePrompt,
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
  const endTime = Date.now();
  
  console.log(`✅ Success in ${endTime - startTime}ms`);
  console.log(`Response length: ${response.length} chars`);
  console.log(`Preview: ${response.substring(0, 100)}...\n`);
} catch (error) {
  console.log(`❌ Failed: ${error.message}\n`);
}

// Test 2: Check if it's the few-shot examples causing issues
console.log('Test 2: Large prompt (similar to few-shot size)');
const largePrompt = `You are an expert SVG icon designer.

STYLE: Black & White Flat
Simple flat icons with black outlines on white background.

Example:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect x="3" y="2" width="14" height="18" fill="white" stroke="black"/>
  <line x1="6" y1="6" x2="12" y2="6" stroke="black"/>
</svg>

User request: Generate a database icon

Format: FILENAME: database\nSVG: <svg>...</svg>`;

try {
  const startTime = Date.now();
  console.log(`Prompt length: ${largePrompt.length} chars`);
  
  const response = execSync('claude', {
    input: largePrompt,
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
  const endTime = Date.now();
  
  console.log(`✅ Success in ${endTime - startTime}ms`);
  console.log(`Response length: ${response.length} chars`);
} catch (error) {
  console.log(`❌ Failed: ${error.message}`);
  console.log(`Error type: ${error.code || 'unknown'}`);
}