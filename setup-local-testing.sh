#!/bin/bash

echo "🚀 Setting up Icon Generator MCP for local testing..."
echo ""

# Check if potrace is installed
if ! command -v potrace &> /dev/null; then
    echo "❌ Potrace is not installed. Please install it first:"
    echo "   brew install potrace"
    exit 1
fi

echo "✅ Potrace is installed"

# Build the project
echo ""
echo "📦 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix TypeScript errors."
    exit 1
fi

echo "✅ Build successful"

# Create global link
echo ""
echo "🔗 Creating global npm link..."
npm link

echo "✅ Global link created"

# Make scripts executable
chmod +x bin/mcp-server-proper.js
chmod +x test-mcp-direct.js

# Show Claude Desktop config location
echo ""
echo "📋 Claude Desktop Configuration"
echo "================================"
echo ""
echo "Add this to your Claude Desktop config file:"
echo ""
echo "Location (macOS): ~/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "Configuration to add:"
echo ""
cat << EOF
{
  "mcpServers": {
    "icon-generator-local": {
      "command": "node",
      "args": [
        "$PWD/bin/mcp-server-proper.js"
      ]
    }
  }
}
EOF

echo ""
echo "================================"
echo ""
echo "🧪 To test the MCP server directly:"
echo "   node test-mcp-direct.js"
echo ""
echo "🔄 For development (auto-rebuild):"
echo "   npm run dev"
echo ""
echo "✅ Setup complete! Restart Claude Desktop to use the icon generator."