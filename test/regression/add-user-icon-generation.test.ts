import { describe, it, expect, beforeAll } from '@jest/globals';
import { MCPServer } from '../../src/server';
import * as fs from 'fs';
import * as path from 'path';
import { getStyleConfig } from '../../src/styles/few-shot-examples';

async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

describe('Add User Icon Generation Regression Test', () => {
  let server: MCPServer;
  const testOutputDir = path.join(__dirname, '../test-output');

  // Get LLM provider from command line arguments (defaults to 'claude')
  const getLLMProvider = (): 'claude' | 'gemini' => {
    const args = process.argv.slice(2);
    const llmArg = args.find(arg => arg === 'claude' || arg === 'gemini');
    return (llmArg as 'claude' | 'gemini') || 'claude';
  };

  const llmProvider = getLLMProvider();

  beforeAll(() => {
    server = new MCPServer();
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
    console.log(`🔧 Using LLM provider: ${llmProvider}`);
  });

  it('should generate an add user icon using few-shot learning patterns', async () => {
    console.log('🔍 Testing Add User Icon Generation with Few-Shot Learning\n');

    const styleConfig = getStyleConfig('black-white-flat');
    expect(styleConfig).toBeDefined();

    const addUserPrompt = `Create an add user icon in black and white with simple flat design. Show a person silhouette with a plus sign overlay indicating adding a new user to the system. Use only black outlines on white background, minimal details, clean geometric shapes.`;
    
    const outputFilename = 'test-add-user-icon-regression.svg';
    const outputPath = path.join(testOutputDir, outputFilename);

    const newIconRequest = {
      reference_paths: [],
      prompt: addUserPrompt,
      style: 'black-white-flat',
      output_name: 'test-add-user-icon-regression',
      output_path: testOutputDir,
      llm_provider: llmProvider
    };

    console.log(`\n📋 Add User Icon Generation Request:`);
    console.log(`  Prompt: ${newIconRequest.prompt.substring(0, 100)}...`);
    console.log(`  Style: ${newIconRequest.style}`);
    console.log(`  LLM Provider: ${llmProvider}`);
    console.log(`  Output path: ${outputPath}`);
    console.log('');

    const startTime = Date.now();
    const response = await retry(() => server.handleToolCall('generate_icon', newIconRequest));
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log('--- FULL RESPONSE ---');
    console.dir(response, { depth: 5 });
    console.log('---------------------');

    expect(response.success).toBe(true);
    expect(response.generation_context).toBeDefined();
    expect(response.message).toMatch(/Generation context prepared successfully/);
    expect(response.processing_time).toBeDefined();
    
    console.log('📊 Generation Results:');
    console.log(`  Success: ${response.success}`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Output path: ${response.output_path}`);
    console.log(`  Processing time: ${processingTime}ms`);
    
    expect(response.generation_context).toBeDefined();
    
    // Context analysis instead of file system checks
    expect(response.generation_context.prompt.length).toBeGreaterThan(500);

    const hasViewBox = response.generation_context.prompt.includes('viewBox="0 0 24 24"');
    const hasProperNamespace = response.generation_context.prompt.includes('xmlns="http://www.w3.org/2000/svg"');
    const hasBlackStroke = response.generation_context.prompt.includes('stroke="black"');
    const hasWhiteFill = response.generation_context.prompt.includes('fill="white"');

    console.log('\n🔍 Add User Icon Context Quality Analysis:');
    console.log(`  • ViewBox instruction: ${hasViewBox ? '✅' : '❌'}`);
    console.log(`  • SVG namespace instruction: ${hasProperNamespace ? '✅' : '❌'}`);
    console.log(`  • Black stroke instruction: ${hasBlackStroke ? '✅' : '❌'}`);
    console.log(`  • White fill instruction: ${hasWhiteFill ? '✅' : '❌'}`);

    expect(hasViewBox).toBe(true);
    expect(hasProperNamespace).toBe(true);
    expect(hasBlackStroke).toBe(true);
    expect(hasWhiteFill).toBe(true);

    console.log('\n🎉 Add User Icon Context Preparation Test Complete!');
    console.log(`✅ Context prepared for LLM generation with proper quality instructions`);
  }, 35000); // 35 second timeout
});