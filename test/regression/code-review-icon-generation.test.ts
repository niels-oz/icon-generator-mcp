import { describe, it, expect, beforeAll } from '@jest/globals';
import { MCPServer } from '../../src/server';
import * as fs from 'fs';
import * as path from 'path';

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

describe('Code Review Icon Generation Regression Test', () => {
  let server: MCPServer;
  const testOutputDir = path.join(__dirname, '../test-output');

  beforeAll(() => {
    server = new MCPServer();
    // Ensure test output directory exists
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  it('should generate code review icons using few-shot learning patterns', async () => {
    console.log('🔍 Testing Code Review Icon Generation with Few-Shot Learning\n');
    
    // Few-shot examples: Using the actual SVG examples as patterns
    const fewShotExamples = [
      {
        name: 'dual-documents',
        prompt: 'Create a code review icon in black and white with simple flat design. Show two overlapping documents representing before/after or comparison. Use only black outlines on white background, simple geometric forms.',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- First document (background) -->
  <rect x="3" y="4" width="12" height="16" rx="1" fill="white" stroke="black"/>
  <line x1="6" y1="8" x2="12" y2="8" stroke="black"/>
  <line x1="6" y1="11" x2="12" y2="11" stroke="black"/>
  <line x1="6" y1="14" x2="9" y2="14" stroke="black"/>
  
  <!-- Second document (foreground, overlapping) -->
  <rect x="9" y="2" width="12" height="16" rx="1" fill="white" stroke="black"/>
  <line x1="12" y1="6" x2="18" y2="6" stroke="black"/>
  <line x1="12" y1="9" x2="18" y2="9" stroke="black"/>
  <line x1="12" y1="12" x2="15" y2="12" stroke="black"/>
  
  <!-- Comparison indicator (small checkmark on second document) -->
  <polyline points="16,14 17,15 19,13" stroke="black" fill="none"/>
</svg>`,
        patterns: ['overlapping documents', 'comparison visual', 'geometric forms', 'checkmark indicator']
      },
      {
        name: 'magnifying-code',
        prompt: 'Create a code review icon in black and white with simple flat design. Show a magnifying glass examining code or document lines. Use only black outlines on white background, geometric shapes, no gradients or shadows.',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Document/Code background -->
  <rect x="2" y="3" width="14" height="18" rx="2" ry="2" fill="white" stroke="black"/>
  
  <!-- Code lines -->
  <line x1="4" y1="7" x2="12" y2="7" stroke="black" stroke-width="1"/>
  <line x1="4" y1="9" x2="10" y2="9" stroke="black" stroke-width="1"/>
  <line x1="4" y1="11" x2="11" y2="11" stroke="black" stroke-width="1"/>
  <line x1="4" y1="13" x2="9" y2="13" stroke="black" stroke-width="1"/>
  <line x1="4" y1="15" x2="12" y2="15" stroke="black" stroke-width="1"/>
  <line x1="4" y1="17" x2="8" y2="17" stroke="black" stroke-width="1"/>
  
  <!-- Magnifying glass -->
  <circle cx="17" cy="11" r="4" fill="white" stroke="black" stroke-width="2"/>
  <line x1="20" y1="14" x2="22" y2="16" stroke="black" stroke-width="2"/>
</svg>`,
        patterns: ['magnifying glass', 'code examination', 'document with lines', 'inspection tool']
      }
    ];

    // Display few-shot learning context
    console.log('📚 Few-Shot Learning Context for Code Review Icons:');
    console.log('═'.repeat(80));
    
    fewShotExamples.forEach((example, index) => {
      console.log(`\n${index + 1}. ${example.name.toUpperCase()}`);
      console.log(`   Pattern: "${example.prompt.substring(0, 100)}..."`);
      console.log(`   Key traits: ${example.patterns.join(', ')}`);
      console.log(`   SVG structure: viewBox="0 0 24 24", stroke="black", fill="white"`);
    });
    
    console.log('\n═'.repeat(80));
    console.log('\n🔍 Expected Code Review Icon Characteristics:');
    console.log('   • Consistent structure: viewBox="0 0 24 24"');
    console.log('   • Style: black-white-flat');
    console.log('   • Visual elements: documents, code lines, review indicators');
    console.log('   • Technical specs: stroke="black", fill="white", stroke-width="2"');
    console.log('   • Review concepts: comparison, examination, approval, analysis');

    // Generate new code review icon based on learned patterns
    console.log('\n🔍 Generating New Code Review Icon Using Few-Shot Patterns:');
    console.log('─'.repeat(80));
    
    const codeReviewPrompt = `Create a code review icon in black and white with simple flat design, following these examples:

EXAMPLE 1 - Dual Documents Pattern:
${fewShotExamples[0].svg}

EXAMPLE 2 - Magnifying Code Pattern:
${fewShotExamples[1].svg}

Now create a NEW code review icon that shows a document with code lines and a review badge or approval stamp. Use the same style: black outlines on white background, viewBox="0 0 24 24", stroke-width="2" for main elements and stroke-width="1" for details. Show a document with horizontal lines representing code, and add a circular badge or stamp indicating review/approval. Keep it minimal and geometric like the examples.`;
    
    const outputFilename = 'test-code-review-badge-regression.svg';
    const outputPath = path.join(testOutputDir, outputFilename);
    
    const newIconRequest = {
      png_paths: [],
      prompt: codeReviewPrompt,
      output_name: 'test-code-review-badge-regression',
      output_path: testOutputDir,
      llm_provider: 'gemini'
    };
    
    console.log(`\n📋 Code Review Icon Generation Request:`);
    console.log(`  Subject: Code Review Badge/Stamp Icon`);
    console.log(`  Prompt length: ${newIconRequest.prompt.length} characters`);
    console.log(`  Output path: ${outputPath}`);
    console.log('');

    const startTime = Date.now();
    const response = await retry(() => server.handleToolCall('generate_icon', newIconRequest));
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    // Log full response for debugging before assertions
    console.log('--- FULL RESPONSE ---');
    console.dir(response, { depth: 5 });
    console.log('---------------------');
    
    // Assertions
    expect(response.success).toBe(true);
    expect(response.output_path).toBeDefined();
    expect(response.message).toMatch(/Icon generated successfully|Generated.*variations/);
    expect(response.processing_time).toBeDefined();
    expect(response.steps).toBeDefined();
    expect(Array.isArray(response.steps)).toBe(true);
    
    console.log('📊 Generation Results:');
    console.log(`  Success: ${response.success}`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Output path: ${response.output_path}`);
    console.log(`  Processing time: ${processingTime}ms`);
    console.log(`  Steps completed: ${response.steps!.length}`);
    if (response.error) {
      console.error(`  Error: ${response.error}`);
    }
    
    // Verify file was created
    expect(fs.existsSync(response.output_path!)).toBe(true);
    
    // Analyze generated SVG content
    const svgContent = fs.readFileSync(response.output_path!, 'utf8');
    expect(svgContent.length).toBeGreaterThan(100);
    
    console.log(`  SVG file size: ${svgContent.length} characters`);
    console.log(`  SVG elements: ${extractSVGElements(svgContent)}`);
    
    // Code Review Icon specific pattern adherence analysis
    const hasViewBox = svgContent.includes('viewBox="0 0 24 24"');
    const hasProperNamespace = svgContent.includes('xmlns="http://www.w3.org/2000/svg"');
    const hasBlackStroke = svgContent.includes('stroke="black"');
    const hasWhiteFill = svgContent.includes('fill="white"');
    const hasCodeLines = svgContent.includes('<line') && svgContent.split('<line').length > 2;
    const hasReviewElement = svgContent.includes('<circle') || svgContent.includes('<rect') || svgContent.includes('<polyline');
    
    console.log('\n🔍 Code Review Icon Pattern Adherence Analysis:');
    console.log(`  • Uses standard viewBox (0 0 24 24): ${hasViewBox ? '✅' : '❌'}`);
    console.log(`  • Proper SVG namespace: ${hasProperNamespace ? '✅' : '❌'}`);
    console.log(`  • Black stroke styling: ${hasBlackStroke ? '✅' : '❌'}`);
    console.log(`  • White fill styling: ${hasWhiteFill ? '✅' : '❌'}`);
    console.log(`  • Contains code lines: ${hasCodeLines ? '✅' : '❌'}`);
    console.log(`  • Has review elements: ${hasReviewElement ? '✅' : '❌'}`);
    
    // Quality assertions specific to code review icons
    console.log(svgContent);
    expect(hasViewBox).toBe(true);
    expect(hasProperNamespace).toBe(true);
    expect(hasBlackStroke).toBe(true);
    expect(hasWhiteFill).toBe(true);
    expect(hasCodeLines).toBe(true);
    expect(hasReviewElement).toBe(true);
    
    // Preview generated content
    const preview = svgContent.length > 300 
      ? svgContent.substring(0, 300) + '...' 
      : svgContent;
    console.log(`\n📄 Generated Code Review Icon SVG Preview:\n${preview}`);
    
    console.log('\n🎉 Code Review Icon Generation Regression Test Complete!');
    console.log(`✅ Generated: ${path.basename(response.output_path!)}`);
    console.log('✅ Pattern adherence validated');
    console.log('✅ Code review visual elements confirmed');
    
  }, 30000); // 30 second timeout for AI generation

  function extractSVGElements(svgContent: string): string {
    const matches = svgContent.match(/<(\w+)[^>]*>/g) || [];
    const elementCounts: { [key: string]: number } = {};
    
    matches.forEach(match => {
      const elementMatch = match.match(/<(\w+)/);
      if (elementMatch) {
        const element = elementMatch[1];
        if (element !== 'svg') {
          elementCounts[element] = (elementCounts[element] || 0) + 1;
        }
      }
    });
    
    return Object.entries(elementCounts)
      .map(([element, count]) => `${element}(${count})`)
      .join(', ') || 'basic structure';
  }
});