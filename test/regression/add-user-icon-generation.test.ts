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

  beforeAll(() => {
    server = new MCPServer();
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  it('should generate an add user icon using few-shot learning patterns', async () => {
    console.log('🔍 Testing Add User Icon Generation with Few-Shot Learning\n');

    const styleConfig = getStyleConfig('black-white-flat');
    expect(styleConfig).toBeDefined();

    const addUserPrompt = `Create an add user icon in black and white with simple flat design. Show a person silhouette with a plus sign overlay indicating adding a new user to the system. Use only black outlines on white background, minimal details, clean geometric shapes.`;
    
    const outputFilename = 'test-add-user-icon-regression.svg';
    const outputPath = path.join(testOutputDir, outputFilename);

    const newIconRequest = {
      png_paths: [],
      prompt: addUserPrompt,
      style: 'black-white-flat',
      output_name: 'test-add-user-icon-regression',
      output_path: testOutputDir,
      llm_provider: 'gemini' // Use gemini as it seems to be working in the other test
    };

    console.log(`\n📋 Add User Icon Generation Request:`);
    console.log(`  Prompt: ${newIconRequest.prompt.substring(0, 100)}...`);
    console.log(`  Style: ${newIconRequest.style}`);
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
    expect(response.output_path).toBeDefined();
    expect(response.message).toMatch(/Icon generated successfully/);
    expect(response.processing_time).toBeDefined();
    
    console.log('📊 Generation Results:');
    console.log(`  Success: ${response.success}`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Output path: ${response.output_path}`);
    console.log(`  Processing time: ${processingTime}ms`);
    
    expect(fs.existsSync(response.output_path!)).toBe(true);
    
    const svgContent = fs.readFileSync(response.output_path!, 'utf8');
    expect(svgContent.length).toBeGreaterThan(100);

    const hasViewBox = svgContent.includes('viewBox="0 0 24 24"');
    const hasProperNamespace = svgContent.includes('xmlns="http://www.w3.org/2000/svg"');
    const hasBlackStroke = svgContent.includes('stroke="black"');
    const hasWhiteFill = svgContent.includes('fill="white"');

    console.log('\n🔍 Add User Icon Pattern Adherence Analysis:');
    console.log(`  • Uses standard viewBox (0 0 24 24): ${hasViewBox ? '✅' : '❌'}`);
    console.log(`  • Proper SVG namespace: ${hasProperNamespace ? '✅' : '❌'}`);
    console.log(`  • Black stroke styling: ${hasBlackStroke ? '✅' : '❌'}`);
    console.log(`  • White fill styling: ${hasWhiteFill ? '✅' : '❌'}`);

    expect(hasViewBox).toBe(true);
    expect(hasProperNamespace).toBe(true);
    expect(hasBlackStroke).toBe(true);
    expect(hasWhiteFill).toBe(true);

    console.log('\n🎉 Add User Icon Generation Regression Test Complete!');
    console.log(`✅ Generated: ${path.basename(response.output_path!)}`);
  }, 35000); // 35 second timeout
});