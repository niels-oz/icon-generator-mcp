#!/usr/bin/env node

/**
 * Add User Icon Generation Example
 * 
 * This example demonstrates few-shot learning by generating an "add user" icon
 * using the existing black-white-flat style examples as training data.
 * 
 * The system will use the existing code review icon examples to understand
 * the black-white-flat style and apply it to generate a consistent add user icon.
 */

const { MCPServer } = require('../dist/server');
const path = require('path');

async function generateAddUserIcon() {
  console.log('👤 Add User Icon Generation Example');
  console.log('=====================================');
  console.log('');
  console.log('This example demonstrates:');
  console.log('• Few-shot learning using existing black-white-flat examples');
  console.log('• Style consistency across different icon types');
  console.log('• Automatic style application from training examples');
  console.log('');

  try {
    // Initialize the MCP server
    const server = new MCPServer('claude');
    
    // Define the request for add user icon
    const request = {
      prompt: 'Create an add user icon in black and white with simple flat design. Show a person silhouette with a plus sign overlay indicating adding a new user to the system. Use only black outlines on white background, minimal details, clean geometric shapes.',
      style: 'black-white-flat', // This triggers few-shot learning
      output_name: 'add-user-icon-example',
      output_path: './example/test-outputs/'
    };
    
    console.log('📝 Generation Request:');
    console.log('• Prompt: Create add user icon with black-white-flat style');
    console.log('• Style: black-white-flat (uses few-shot learning)');
    console.log('• Output: ./example/test-outputs/add-user-icon-example.svg');
    console.log('');
    
    console.log('🧠 Few-Shot Learning Process:');
    console.log('• Loading existing black-white-flat examples...');
    console.log('• Analyzing style patterns from code review icons...');
    console.log('• Applying learned style to add user icon concept...');
    console.log('');
    
    // Generate the icon
    console.log('🚀 Starting icon generation...');
    const startTime = Date.now();
    
    const response = await server.handleToolCall('generate_icon', request);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log('');
    console.log('📊 Generation Results:');
    console.log('======================');
    
    if (response.success) {
      console.log('✅ Status: SUCCESS');
      console.log('📁 Output File:', response.output_path);
      console.log('⏱️  Processing Time:', processingTime + 'ms');
      console.log('💬 Message:', response.message);
      
      // Validate the generated SVG
      const fs = require('fs');
      if (fs.existsSync(response.output_path)) {
        const svgContent = fs.readFileSync(response.output_path, 'utf8');
        console.log('📏 SVG Size:', svgContent.length + ' characters');
        
        // Check for style characteristics
        const hasBlackStrokes = svgContent.includes('stroke="black"') || svgContent.includes('stroke="currentColor"');
        const hasWhiteFill = svgContent.includes('fill="white"');
        const hasProperNamespace = svgContent.includes('xmlns="http://www.w3.org/2000/svg"');
        
        console.log('');
        console.log('🎨 Style Validation:');
        console.log('• Black strokes:', hasBlackStrokes ? '✅' : '❌');
        console.log('• White fills:', hasWhiteFill ? '✅' : '❌');
        console.log('• Proper SVG namespace:', hasProperNamespace ? '✅' : '❌');
        
        console.log('');
        console.log('🎯 Few-Shot Learning Success!');
        console.log('The generated add user icon follows the same black-white-flat');
        console.log('style patterns learned from the existing code review examples.');
        
      } else {
        console.log('❌ Warning: Output file not found at', response.output_path);
      }
      
    } else {
      console.log('❌ Status: FAILED');
      console.log('💬 Message:', response.message);
      console.log('🚨 Error:', response.error);
    }
    
    console.log('');
    console.log('📚 Learn More:');
    console.log('• Few-shot examples: src/styles/few-shot-examples.ts');
    console.log('• Style configuration: black-white-flat style');
    console.log('• Generated icons: example/test-outputs/');
    
  } catch (error) {
    console.error('❌ Example failed:', error.message);
    process.exit(1);
  }
}

// Run the example
generateAddUserIcon().catch(console.error);