const { MCPServer } = require('../dist/server');
const fs = require('fs');

async function testFewShotLearning() {
  console.log('🎨 Testing Few-Shot Learning System\n');
  
  const server = new MCPServer();
  
  // Test different prompts with the black-white-flat style
  const tests = [
    {
      name: 'database-icon',
      prompt: 'Create a database icon showing stacked cylinders or disks',
      style: 'black-white-flat'
    },
    {
      name: 'user-profile-icon', 
      prompt: 'Create a user profile icon showing a person silhouette',
      style: 'black-white-flat'
    },
    {
      name: 'settings-gear-icon',
      prompt: 'Create a settings icon showing a gear or cog wheel',
      style: 'black-white-flat'
    }
  ];
  
  console.log('🎯 Style: black-white-flat (with few-shot examples)');
  console.log(`📊 Testing ${tests.length} different icon types...\n`);
  
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const request = {
      prompt: test.prompt,
      output_name: test.name,
      style: test.style
    };
    
    console.log(`🎨 Test ${i + 1}/${tests.length}: ${test.name}`);
    console.log(`📝 Prompt: "${test.prompt}"`);
    console.log(`🎨 Style: ${test.style}`);
    console.log('⏱️  Generating...');
    
    try {
      const testStartTime = Date.now();
      const response = await server.handleToolCall('generate_icon', request);
      const testEndTime = Date.now();
      
      if (response.success) {
        results.push({
          name: test.name,
          path: response.output_path,
          time: testEndTime - testStartTime
        });
        
        console.log(`✅ Success: ${response.output_path}`);
        console.log(`⏱️  Time: ${testEndTime - testStartTime}ms`);
        
        // Show SVG preview
        if (response.output_path && fs.existsSync(response.output_path)) {
          const svgContent = fs.readFileSync(response.output_path, 'utf8');
          console.log(`📏 Size: ${svgContent.length} chars`);
          console.log(`🔍 Preview: ${svgContent.substring(0, 100)}...`);
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
  
  console.log('📊 Few-Shot Learning Results');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`⏱️  Total generation time: ${totalTime}ms (${Math.round(totalTime/1000)}s)`);
  console.log(`📈 Average per icon: ${Math.round(totalTime/tests.length)}ms`);
  console.log(`✅ Success rate: ${results.length}/${tests.length} icons`);
  console.log('');
  
  if (results.length > 0) {
    console.log('🎨 Generated Icons:');
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.name}: ${result.path} (${result.time}ms)`);
    });
  }
  
  console.log('');
  console.log('🎉 Few-Shot Learning Test Complete!');
}

testFewShotLearning().catch(console.error);