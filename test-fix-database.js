const { MCPServer } = require('./dist/server');

async function testFixedDatabase() {
  console.log('🔧 Testing Fixed Database Icon Generation\n');
  
  const server = new MCPServer();
  
  const request = {
    prompt: 'Create a database icon showing stacked cylinders or disks',
    style: 'black-white-flat',
    output_name: 'database-fixed'
  };
  
  console.log('📝 Request:', request);
  
  try {
    const response = await server.handleToolCall('generate_icon', request);
    console.log('✅ Response:', response);
    
    if (response.success && response.output_path) {
      const fs = require('fs');
      const svgContent = fs.readFileSync(response.output_path, 'utf8');
      console.log('\n📄 SVG Content (first 200 chars):');
      console.log(svgContent.substring(0, 200));
      console.log('\n🔍 Valid SVG?', svgContent.startsWith('<svg') && svgContent.endsWith('</svg>'));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFixedDatabase().catch(console.error);