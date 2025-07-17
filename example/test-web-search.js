const { MCPServer } = require('../dist/server');

async function testWebSearch() {
  console.log('🌐 Testing enhanced MCP server with web search capabilities...\n');
  
  const server = new MCPServer();
  
  // Test 1: Basic web search functionality
  console.log('📋 Test 1: Web search with keyword');
  const request1 = {
    prompt: 'Create a star icon with clean lines',
    search_keyword: 'star',
    auto_search: true
  };
  
  console.log(`  Prompt: "${request1.prompt}"`);
  console.log(`  Search keyword: "${request1.search_keyword}"`);
  console.log(`  Auto search: ${request1.auto_search}`);
  console.log('');
  
  try {
    const response1 = await server.handleToolCall('generate_icon', request1);
    
    console.log('✅ Response:');
    console.log(`  Success: ${response1.success}`);
    console.log(`  Output path: ${response1.output_path}`);
    console.log(`  Message: ${response1.message}`);
    console.log(`  Processing time: ${response1.processing_time}ms`);
    console.log('');
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    console.log('');
  }
  
  // Test 2: Manual PNG + web search combination
  console.log('📋 Test 2: Manual PNG + web search combination');
  const request2 = {
    png_paths: ['./test/fixtures/test.png'],
    prompt: 'Create a folder icon similar to the reference',
    search_keyword: 'folder',
    auto_search: true,
    output_name: 'hybrid-folder-icon'
  };
  
  console.log(`  PNG paths: ${JSON.stringify(request2.png_paths)}`);
  console.log(`  Prompt: "${request2.prompt}"`);
  console.log(`  Search keyword: "${request2.search_keyword}"`);
  console.log(`  Auto search: ${request2.auto_search}`);
  console.log(`  Output name: ${request2.output_name}`);
  console.log('');
  
  try {
    const response2 = await server.handleToolCall('generate_icon', request2);
    
    console.log('✅ Response:');
    console.log(`  Success: ${response2.success}`);
    console.log(`  Output path: ${response2.output_path}`);
    console.log(`  Message: ${response2.message}`);
    console.log(`  Processing time: ${response2.processing_time}ms`);
    console.log('');
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
    console.log('');
  }
  
  // Test 3: Backward compatibility (no web search)
  console.log('📋 Test 3: Backward compatibility (no web search)');
  const request3 = {
    prompt: 'Create a simple circle icon',
    output_name: 'simple-circle'
  };
  
  console.log(`  Prompt: "${request3.prompt}"`);
  console.log(`  Output name: ${request3.output_name}`);
  console.log(`  Web search: disabled (not specified)`);
  console.log('');
  
  try {
    const response3 = await server.handleToolCall('generate_icon', request3);
    
    console.log('✅ Response:');
    console.log(`  Success: ${response3.success}`);
    console.log(`  Output path: ${response3.output_path}`);
    console.log(`  Message: ${response3.message}`);
    console.log(`  Processing time: ${response3.processing_time}ms`);
    console.log('');
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
    console.log('');
  }
  
  // Test 4: Web search disabled explicitly
  console.log('📋 Test 4: Web search disabled explicitly');
  const request4 = {
    prompt: 'Create a shopping cart icon',
    search_keyword: 'shopping cart',
    auto_search: false
  };
  
  console.log(`  Prompt: "${request4.prompt}"`);
  console.log(`  Search keyword: "${request4.search_keyword}"`);
  console.log(`  Auto search: ${request4.auto_search}`);
  console.log('');
  
  try {
    const response4 = await server.handleToolCall('generate_icon', request4);
    
    console.log('✅ Response:');
    console.log(`  Success: ${response4.success}`);
    console.log(`  Output path: ${response4.output_path}`);
    console.log(`  Message: ${response4.message}`);
    console.log(`  Processing time: ${response4.processing_time}ms`);
    console.log('');
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
    console.log('');
  }
  
  console.log('🎉 Web search integration testing completed!');
  console.log('💡 To use with real web search, set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables');
  console.log('📋 Enhanced features:');
  console.log('  - Searches for SVG and PNG files only (JPG excluded)');
  console.log('  - Preserves original file formats');
  console.log('  - SVG files used directly, PNG files converted via Potrace');
  console.log('  - Search query: "icon {keyword} svg flat outline -photo -3d -gradient filetype:svg OR filetype:png"');
}

testWebSearch().catch(console.error);