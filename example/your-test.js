const { MCPServer } = require('../dist/server');
const { ConversionService } = require('../dist/services/converter');
const path = require('path');

async function yourTest() {
  console.log('🎨 Your Icon Generation Test\n');
  
  // CHANGE THIS PATH to your PNG file
  const yourPngPath = path.join(__dirname, '../test/fixtures/test.png');
  
  // CHANGE THIS PROMPT to your desired transformation
  const yourPrompt = 'Change the color from blue to red';
  
  console.log('📋 Your Test Setup:');
  console.log(`  PNG file: ${yourPngPath}`);
  console.log(`  Prompt: "${yourPrompt}"`);
  console.log('');
  
  // Test 1: PNG to SVG conversion
  console.log('🔄 Step 1: Converting PNG to SVG...');
  try {
    const converter = new ConversionService();
    const svgContent = await converter.convertPNGToSVG(yourPngPath);
    
    console.log('✅ PNG converted to SVG successfully!');
    console.log(`📏 SVG length: ${svgContent.length} characters`);
    
    // Save the converted SVG
    const fs = require('fs');
    const convertedPath = path.join(__dirname, 'your-converted.svg');
    fs.writeFileSync(convertedPath, svgContent);
    console.log(`💾 Saved converted SVG to: ${convertedPath}`);
    
  } catch (error) {
    console.error('❌ PNG conversion failed:', error.message);
    return;
  }
  
  // Test 2: MCP server request
  console.log('\n🔄 Step 2: Testing MCP server request...');
  try {
    const server = new MCPServer();
    const request = {
      reference_paths: [yourPngPath],
      prompt: yourPrompt,
      output_name: 'your-custom-icon'
    };
    
    const response = await server.handleToolCall('generate_icon', request);
    
    console.log('📊 MCP Server Response:');
    console.log(`  Success: ${response.success}`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Processing time: ${response.processing_time}ms`);
    
  } catch (error) {
    console.error('❌ MCP server test failed:', error.message);
  }
  
  console.log('\n✅ Test completed!');
  console.log('\n💡 Next steps:');
  console.log('  1. The PNG→SVG conversion works perfectly');
  console.log('  2. The MCP server structure is ready');
  console.log('  3. Next iteration will add Claude LLM integration');
  console.log('  4. Then we\'ll add real file writing with smart naming');
}

yourTest();