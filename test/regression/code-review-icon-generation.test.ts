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

describe('Cross-Domain Few-Shot Learning Regression Test', () => {
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
    // Ensure test output directory exists
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
    console.log(`🔧 Using LLM provider: ${llmProvider}`);
  });

  it('should generate code review icon using cross-domain few-shot learning', async () => {
    console.log('🔍 Testing Cross-Domain Few-Shot Learning for Code Review Icon\n');
    
    // Cross-domain few-shot examples: Different subjects, same consistent visual style
    const fewShotExamples = [
      {
        name: 'home-icon',
        concept: 'residential/housing',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- House outline -->
  <path d="M3 12l9-9 9 9v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9z" fill="white" stroke="black"/>
  <!-- Door -->
  <path d="M9 21V15h6v6" fill="white" stroke="black" stroke-width="1"/>
  <!-- Windows -->
  <rect x="7" y="9" width="3" height="3" fill="white" stroke="black" stroke-width="1"/>
  <rect x="14" y="9" width="3" height="3" fill="white" stroke="black" stroke-width="1"/>
</svg>`,
        patterns: ['geometric house shape', 'simple rectangular elements', 'consistent stroke weights']
      },
      {
        name: 'settings-gear',
        concept: 'configuration/tools',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Gear outer circle -->
  <circle cx="12" cy="12" r="10" fill="white" stroke="black"/>
  <!-- Gear teeth -->
  <rect x="11" y="2" width="2" height="4" fill="black"/>
  <rect x="11" y="18" width="2" height="4" fill="black"/>
  <rect x="2" y="11" width="4" height="2" fill="black"/>
  <rect x="18" y="11" width="4" height="2" fill="black"/>
  <!-- Center hole -->
  <circle cx="12" cy="12" r="3" fill="white" stroke="black"/>
</svg>`,
        patterns: ['circular base shape', 'symmetrical design', 'contrasting filled elements']
      },
      {
        name: 'star-rating',
        concept: 'favorites/quality',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Five-pointed star -->
  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="white" stroke="black"/>
  <!-- Center highlight -->
  <circle cx="12" cy="12" r="2" fill="white" stroke="black" stroke-width="1"/>
</svg>`,
        patterns: ['pointed geometric shape', 'centered design', 'detail stroke differentiation']
      }
    ];

    // Display cross-domain few-shot learning context
    console.log('📚 Cross-Domain Few-Shot Learning Context:');
    console.log('═'.repeat(80));
    
    fewShotExamples.forEach((example, index) => {
      console.log(`\n${index + 1}. ${example.name.toUpperCase()} (${example.concept})`);
      console.log(`   Visual patterns: ${example.patterns.join(', ')}`);
      console.log(`   Technical specs: viewBox="0 0 24 24", stroke="black", fill="white"`);
    });
    
    console.log('\n═'.repeat(80));
    console.log('\n🔍 Style Patterns to Extract and Apply:');
    console.log('   • Consistent structure: viewBox="0 0 24 24"');
    console.log('   • Color scheme: stroke="black", fill="white"');
    console.log('   • Stroke hierarchy: stroke-width="2" for main, stroke-width="1" for details');
    console.log('   • Design approach: Simple geometric shapes, minimal details');
    console.log('   • Technical quality: Proper SVG namespace, stroke-linecap="round"');
    console.log('\n🎯 Goal: Apply these style patterns to NEW DOMAIN (code review/development)');

    // Generate new code review icon based on cross-domain learned patterns
    console.log('\n🔍 Generating Code Review Icon Using Cross-Domain Style Transfer:');
    console.log('─'.repeat(80));
    
    const crossDomainPrompt = `Learn the visual style from these examples across different domains and apply it to a new code review icon:

EXAMPLE 1 - Home Icon (Residential Domain):
${fewShotExamples[0].svg}

EXAMPLE 2 - Settings Gear (Configuration Domain):
${fewShotExamples[1].svg}

EXAMPLE 3 - Star Rating (Quality/Favorites Domain):
${fewShotExamples[2].svg}

Notice the consistent style patterns across all different domains:
- Technical specs: viewBox="0 0 24 24", xmlns="http://www.w3.org/2000/svg"
- Color scheme: stroke="black", fill="white" 
- Stroke hierarchy: stroke-width="2" for main shapes, stroke-width="1" for details
- Design approach: Simple geometric shapes, minimal details, clean structure
- Quality: stroke-linecap="round", stroke-linejoin="round"

Now create a NEW code review icon (Development Domain) using the EXACT same visual style and technical specifications. Show a document with code lines and a review indicator like a checkmark or approval badge. Apply the learned style patterns: same viewBox, same color scheme, same stroke hierarchy, same geometric simplicity.`;
    
    const outputFilename = 'test-code-review-cross-domain-regression.svg';
    const outputPath = path.join(testOutputDir, outputFilename);
    
    const newIconRequest = {
      png_paths: [],
      prompt: crossDomainPrompt,
      output_name: 'test-code-review-cross-domain-regression',
      output_path: testOutputDir,
      llm_provider: llmProvider
    };
    
    console.log(`\n📋 Cross-Domain Style Transfer Request:`);
    console.log(`  Subject: Code Review Icon (Development Domain)`);
    console.log(`  Learning Method: Cross-domain few-shot learning`);
    console.log(`  Source Domains: Residential + Configuration + Quality`);
    console.log(`  Target Domain: Development/Code Review`);
    console.log(`  Prompt length: ${newIconRequest.prompt.length} characters`);
    console.log(`  LLM Provider: ${llmProvider}`);
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
    
    console.log('\n🔍 Cross-Domain Style Transfer Analysis:');
    console.log('─'.repeat(50));
    console.log('STYLE PATTERN ADHERENCE:');
    console.log(`  • Standard viewBox (0 0 24 24): ${hasViewBox ? '✅' : '❌'}`);
    console.log(`  • Proper SVG namespace: ${hasProperNamespace ? '✅' : '❌'}`);
    console.log(`  • Black stroke styling: ${hasBlackStroke ? '✅' : '❌'}`);
    console.log(`  • White fill styling: ${hasWhiteFill ? '✅' : '❌'}`);
    console.log('DOMAIN-SPECIFIC ELEMENTS:');
    console.log(`  • Contains code/document lines: ${hasCodeLines ? '✅' : '❌'}`);
    console.log(`  • Has review indicator: ${hasReviewElement ? '✅' : '❌'}`);
    
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
    
    console.log('\n🎉 Cross-Domain Few-Shot Learning Test Complete!');
    console.log(`✅ Generated: ${path.basename(response.output_path!)}`);
    console.log('✅ Style patterns successfully transferred across domains');
    console.log('✅ Domain-specific elements (code review) properly incorporated');
    console.log('✅ Visual consistency maintained from source examples');
    
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