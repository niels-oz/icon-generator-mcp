const { MCPServer } = require('../../dist/server');
const fs = require('fs');

async function testCodeReviewBlackWhiteVariations() {
  console.log('🎨 Testing Code Review Black & White Variations\n');
  
  const server = new MCPServer();
  
  // Base parameters for manual generation (no auto-search, no auto-variations)
  const baseParams = {
    generate_variations: false // Force single icon generation
  };
  
  // 4 focused variations for "code review black and white outlines simple flat"
  const variations = [
    {
      name: 'document-check',
      prompt: 'Create a code review icon in black and white with simple flat design. Show a document with code lines and a checkmark overlay. Use only black outlines on white background, minimal details, clean geometric shapes.'
    },
    {
      name: 'magnifying-code',
      prompt: 'Create a code review icon in black and white with simple flat design. Show a magnifying glass examining code or document lines. Use only black outlines on white background, geometric shapes, no gradients or shadows.'
    },
    {
      name: 'approval-stamp',
      prompt: 'Create a code review icon in black and white with simple flat design. Show a document with an approval stamp or badge. Use only black outlines on white background, minimal flat design, clean lines.'
    },
    {
      name: 'dual-documents',
      prompt: 'Create a code review icon in black and white with simple flat design. Show two overlapping documents representing before/after or comparison. Use only black outlines on white background, simple geometric forms.'
    }
  ];
  
  console.log('🎯 Target Style: Black & White, Outlines, Simple Flat');
  console.log('🔍 Search keyword: "code review"');
  console.log('📊 Generating 4 variations for comparison...\n');
  
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < variations.length; i++) {
    const variation = variations[i];
    const request = {
      ...baseParams,
      prompt: variation.prompt,
      output_name: `code-review-bw-${variation.name}`
    };
    
    console.log(`🎨 Variation ${i + 1}/4: ${variation.name}`);
    console.log(`📝 Focus: ${variation.name.replace('-', ' + ')}`);
    console.log('⏱️  Generating...');
    
    try {
      const varStartTime = Date.now();
      const response = await server.handleToolCall('generate_icon', request);
      const varEndTime = Date.now();
      
      if (response.success) {
        results.push({
          name: variation.name,
          path: response.output_path,
          time: varEndTime - varStartTime
        });
        
        console.log(`✅ Success: ${response.output_path}`);
        console.log(`⏱️  Time: ${varEndTime - varStartTime}ms`);
        
        // Show SVG preview
        if (response.output_path && fs.existsSync(response.output_path)) {
          const svgContent = fs.readFileSync(response.output_path, 'utf8');
          console.log(`📏 Size: ${svgContent.length} chars`);
          console.log(`🔍 Preview: ${svgContent.substring(0, 80)}...`);
        }
      } else {
        console.log(`❌ Failed: ${response.error}`);
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  const totalTime = Date.now() - startTime;
  
  console.log('📊 Results Summary');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`⏱️  Total generation time: ${totalTime}ms (${Math.round(totalTime/1000)}s)`);
  console.log(`📈 Average per variation: ${Math.round(totalTime/variations.length)}ms`);
  console.log(`✅ Success rate: ${results.length}/${variations.length} variations`);
  console.log('');
  
  if (results.length > 0) {
    console.log('🎨 Generated Variations:');
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.name}: ${result.path} (${result.time}ms)`);
    });
  }
  
  console.log('');
  console.log('🎉 Code Review Black & White Variations Complete!');
}

testCodeReviewBlackWhiteVariations().catch(console.error);