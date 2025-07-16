const { ConversionService } = require('../dist/services/converter');
const path = require('path');

async function testPNGConversion() {
  console.log('🔄 Testing PNG to SVG conversion...\n');
  
  const converter = new ConversionService();
  const testPngPath = path.join(__dirname, '../test/fixtures/test.png');
  
  console.log(`📁 Converting: ${testPngPath}`);
  
  try {
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(testPngPath)) {
      console.error('❌ Test PNG file not found!');
      return;
    }
    
    // Convert PNG to SVG
    console.log('⚡ Converting PNG to SVG...');
    const svgContent = await converter.convertPNGToSVG(testPngPath);
    
    console.log('✅ Conversion successful!');
    console.log(`📏 SVG length: ${svgContent.length} characters`);
    console.log('🔍 SVG preview (first 200 chars):');
    console.log(svgContent.substring(0, 200) + '...');
    
    // Save to file for inspection
    const outputPath = path.join(__dirname, 'test-output.svg');
    fs.writeFileSync(outputPath, svgContent);
    console.log(`💾 Saved SVG to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
  }
}

testPNGConversion();