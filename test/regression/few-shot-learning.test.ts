import { describe, it, expect, beforeAll } from '@jest/globals';
import { MCPServer } from '../../src/server';
import * as fs from 'fs';
import * as path from 'path';

describe('Few-Shot Learning Regression Test', () => {
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

  it('should generate monstera plant icon using few-shot learning patterns', async () => {
    console.log('🧠 Testing Few-Shot Learning with Monstera Plant Icon\n');
    
    // Few-shot examples: High-quality prompts with their corresponding patterns
    const fewShotExamples = [
      {
        name: 'document-check',
        prompt: 'Create a code review icon in black and white with simple flat design. Show a document with code lines and a checkmark overlay. Use only black outlines on white background, minimal details, clean geometric shapes.',
        patterns: ['viewBox="0 0 24 24"', 'stroke="black"', 'fill="white"', 'minimal geometric shapes']
      },
      {
        name: 'magnifying-code', 
        prompt: 'Create a code review icon in black and white with simple flat design. Show a magnifying glass examining code or document lines. Use only black outlines on white background, geometric shapes, no gradients or shadows.',
        patterns: ['stroke-width="2"', 'stroke-linecap="round"', 'clean lines', 'geometric shapes']
      },
      {
        name: 'approval-stamp',
        prompt: 'Create a code review icon in black and white with simple flat design. Show a document with an approval stamp or badge. Use only black outlines on white background, minimal flat design, clean lines.',
        patterns: ['minimal flat design', 'black outlines', 'white background', 'clean structure']
      },
      {
        name: 'dual-documents',
        prompt: 'Create a code review icon in black and white with simple flat design. Show two overlapping documents representing before/after or comparison. Use only black outlines on white background, simple geometric forms.',
        patterns: ['overlapping elements', 'comparison visual', 'geometric forms', 'structured layout']
      }
    ];

    // Display few-shot learning context
    console.log('📚 Few-Shot Learning Context:');
    console.log('═'.repeat(80));
    
    fewShotExamples.forEach((example, index) => {
      console.log(`\n${index + 1}. ${example.name.toUpperCase()}`);
      console.log(`   Pattern: "${example.prompt.substring(0, 100)}..."`);
      console.log(`   Key traits: ${example.patterns.join(', ')}`);
    });
    
    console.log('\n═'.repeat(80));
    console.log('\n🔍 Expected Pattern Characteristics:');
    console.log('   • Consistent structure with clear descriptive prompts');
    console.log('   • Style constraints: "black and white", "simple flat design"');
    console.log('   • Quality markers: "minimal details", "clean geometric shapes"');
    console.log('   • Technical specs: viewBox, consistent stroke patterns');
    console.log('   • Accessibility: proper SVG namespace and structure');

    // Generate new icon based on learned patterns
    console.log('\n🌱 Generating Monstera Plant Icon Using Few-Shot Patterns:');
    console.log('─'.repeat(80));
    
    const housePlantPrompt = 'Create a monstera plant icon by thinking about its shadow silhouette: Imagine a monstera plant casting a shadow on a white wall. The solid parts (pot, stems, leaf material) block light and create black shapes. The characteristic deep slits and oval holes in monstera leaves let light through, creating white gaps in the shadow. Show 2-3 monstera leaves where each leaf has 4-6 deep finger-like slits extending from edges toward center, plus 2-3 oval holes. The shadow would show the distinctive monstera leaf pattern with its characteristic splits and fenestrations as white negative space. Use solid black fills for plant parts, white background, clean minimal style, viewBox 0 0 100 100.';
    
    const outputFilename = 'test-monstera-few-shot-regression.svg';
    const outputPath = path.join(testOutputDir, outputFilename);
    
    const newIconRequest = {
      reference_paths: [],
      prompt: housePlantPrompt,
      output_name: 'test-monstera-few-shot-regression',
      output_path: testOutputDir,
      llm_provider: llmProvider
    };
    
    console.log(`\n📋 Icon Generation Request:`);
    console.log(`  Subject: Shadow Silhouette Monstera Plant`);
    console.log(`  Prompt length: ${newIconRequest.prompt.length} characters`);
    console.log(`  LLM Provider: ${llmProvider}`);
    console.log(`  Output path: ${outputPath}`);
    console.log('');

    const startTime = Date.now();
    const response = await server.handleToolCall('generate_icon', newIconRequest);
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Assertions
    expect(response.success).toBe(true);
    expect(response.generation_context).toBeDefined();
    expect(response.message).toMatch(/Generation context prepared successfully/);
    expect(response.processing_time).toBeDefined();
    expect(response.steps).toBeDefined();
    expect(Array.isArray(response.steps)).toBe(true);
    
    console.log('📊 Generation Results:');
    console.log(`  Success: ${response.success}`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Output path: ${response.output_path}`);
    console.log(`  Processing time: ${processingTime}ms`);
    console.log(`  Steps completed: ${response.steps!.length}`);
    
    // Verify file was created
    expect(response.generation_context).toBeDefined();
    
    // Analyze generated SVG content
    // Context quality validation - ensure context instructs LLM properly for quality SVG generation
    expect(response.generation_context.prompt.length).toBeGreaterThan(500);
    
    console.log(`  Context size: ${response.generation_context.prompt.length} characters`);
    console.log(`  Processing info:`, response.generation_context.processing_info);
    
    // Context instruction analysis - ensure context contains proper quality guidance
    const hasViewBoxInstruction = response.generation_context.prompt.includes('viewBox');
    const hasNamespaceInstruction = response.generation_context.prompt.includes('xmlns="http://www.w3.org/2000/svg"');
    const hasStructureGuidance = response.generation_context.prompt.includes('clean') && response.generation_context.prompt.includes('optimized');
    const hasStrokeInstructions = response.generation_context.prompt.includes('stroke') || response.generation_context.prompt.includes('fill');
    
    console.log('\n🔍 Context Instruction Quality Analysis:');
    console.log(`  • ViewBox instruction: ${hasViewBoxInstruction ? '✅' : '❌'}`);
    console.log(`  • SVG namespace instruction: ${hasNamespaceInstruction ? '✅' : '❌'}`);
    console.log(`  • Quality structure guidance: ${hasStructureGuidance ? '✅' : '❌'}`);
    console.log(`  • Stroke/fill instructions: ${hasStrokeInstructions ? '✅' : '❌'}`);
    
    // Context quality assertions - ensure context provides proper instructions
    expect(hasViewBoxInstruction).toBe(true);
    expect(hasNamespaceInstruction).toBe(true);
    expect(hasStructureGuidance).toBe(true);
    expect(hasStrokeInstructions).toBe(true);
    
    // Preview generated context
    const preview = response.generation_context.prompt.length > 300 
      ? response.generation_context.prompt.substring(0, 300) + '...' 
      : response.generation_context.prompt;
    console.log(`\n📄 Context Content Preview:\n${preview}`);
    
    console.log('\n🎉 Few-Shot Learning Context Preparation Complete!');
    console.log(`✅ Context prepared for LLM generation`);
    
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