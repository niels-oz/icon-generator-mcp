# Icon Generator MCP Server

> **AI-powered SVG icon generation for developers** - Generate professional icons instantly using Claude Desktop MCP integration

Transform your development workflow with intelligent icon generation. This MCP server combines PNG-to-SVG conversion, AI creativity, and style consistency to produce clean, scalable icons in seconds.

## 🚀 Quick Start

```bash
# Install globally via npm (zero configuration required)
npm install -g icon-generator-mcp

# That's it! The MCP server is now available in Claude Desktop
# No additional setup, API keys, or configuration needed
```

## ✨ Features

- **🎨 Intelligent Icon Generation**: Create SVG icons from text prompts
- **🖼️ PNG to SVG Conversion**: Convert PNG references using Potrace
- **🎭 Style Consistency**: Built-in style templates with few-shot learning
- **⚡ Multi-Provider Support**: Works with Claude and Gemini
- **🛡️ Production Ready**: Robust error handling and validation

## 🛠️ Installation

### Prerequisites
```bash
# Required system dependencies
brew install potrace

# Verify installation
potrace --version
```

### Global Installation
```bash
# Install the MCP server globally
npm install -g icon-generator-mcp

# Configure Claude Desktop (see Configuration section)
```

## 📖 Usage Examples

### 1. Text-Only Generation

Generate icons from descriptive text prompts without any reference images.

**In Claude Desktop:**
```
Create a simple star icon with clean lines and sharp points
```

**Result:** Clean SVG star icon saved to your current directory

**Advanced text-only examples:**
```
Create a minimalist folder icon with rounded corners
Create a settings gear icon with 8 teeth
Create a user profile icon showing a person silhouette
Create a database icon with stacked cylinders
```

### 2. PNG Reference Conversion

Convert existing PNG images to clean SVG icons with AI enhancement.

**Setup:**
```bash
# Place your PNG file in your project directory
ls my-logo.png
```

**In Claude Desktop:**
```
Convert my-logo.png to SVG and make it more minimalist for web use
```

**Advanced PNG examples:**
```
# Multiple references
Convert logo.png and icon.png to SVG, combine their best elements

# Style transformation
Convert complex-logo.png to a simple flat design suitable for favicons

# Background removal
Convert product-photo.png to a clean icon by removing the background
```

### 3. Style-Based Generation

Use predefined styles for consistent icon families.

#### Black & White Flat Style

Perfect for professional applications, documentation, and UI consistency.

**Examples:**
```
Create a code review icon in black and white flat style
Create a user management icon in black and white flat style
Create a database icon in black and white flat style
```

**Generated icons maintain consistent:**
- Black outlines on white background
- Minimal geometric shapes
- Clean, professional appearance
- 24x24 viewBox for scalability

#### Style Variations Available:
- `black-white-flat` - Professional monochrome icons
- `minimal` - Ultra-simple designs
- `outline` - Line-art style icons
- `geometric` - Angular, modern shapes

### 4. Advanced Usage Patterns

#### Custom Output Management
```
Create a navigation arrow icon pointing right
Save it as "nav-arrow" in the ./assets/icons/ directory
```

#### Batch Generation with Consistency
```
Create these icons in black and white flat style:
1. User profile icon
2. Settings gear icon
3. Database icon
4. Folder icon
Save them all to ./icons/ directory
```

#### Reference + Style Combination
```
Use reference-logo.png as inspiration
Create a simplified version in black and white flat style
Make it suitable for use as a 16x16 favicon
```

## 🎨 Real Examples

### Example 1: Code Review Icon

**Input:**
```
Create a code review icon in black and white flat style showing a document with code lines and a checkmark overlay
```

**Generated SVG:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- Document background -->
  <rect x="3" y="2" width="14" height="20" rx="1" fill="white" stroke="black"/>
  
  <!-- Code lines -->
  <line x1="5" y1="6" x2="13" y2="6" stroke="black" stroke-width="1"/>
  <line x1="5" y1="8" x2="11" y2="8" stroke="black" stroke-width="1"/>
  <line x1="5" y1="10" x2="14" y2="10" stroke="black" stroke-width="1"/>
  
  <!-- Checkmark overlay -->
  <circle cx="18" cy="18" r="4" fill="white" stroke="black" stroke-width="2"/>
  <polyline points="16,18 17.5,19.5 20,17" fill="none" stroke="black" stroke-width="2"/>
</svg>
```

### Example 2: User Profile Icon

**Input:**
```
Create a user profile icon in black and white flat style showing a person silhouette
```

**Generated SVG:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- Head/Face circle -->
  <circle cx="12" cy="8" r="4" fill="white" stroke="black" stroke-width="2"/>
  
  <!-- Body/Shoulders -->
  <path d="M6 20c0-4 2.7-6 6-6s6 2 6 6" fill="white" stroke="black" stroke-width="2"/>
  
  <!-- Profile frame -->
  <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="black" stroke-width="2"/>
</svg>
```

### Example 3: Simple Star Icon

**Input:**
```
Create a simple star icon with clean lines
```

**Generated SVG:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>
```

## 🎯 MCP Tool Schema

### `generate_icon`
Generate SVG icons from prompts and references.

**Parameters:**
- `prompt` (string, required): Text description of the desired icon
- `png_paths` (array, optional): PNG file paths for references
- `output_name` (string, optional): Custom filename
- `output_path` (string, optional): Custom output directory
- `style` (string, optional): Style preset (e.g., "black-white-flat")
- `llm_provider` (string, optional): LLM provider ("claude" or "gemini")

**Response:**
- `success` (boolean): Operation success status
- `output_path` (string): Path to generated icon(s)
- `message` (string): Human-readable result message
- `processing_time` (number): Generation time in milliseconds

## 🧠 Smart Features

### Auto-Style Detection
The system automatically applies appropriate styles when it detects keywords:
- `black and white`, `monochrome`, `b&w` → Black & white flat style
- `outline`, `line art`, `stroke` → Outline style
- `flat`, `minimal`, `simple`, `clean` → Minimal style
- `geometric`, `angular` → Geometric style

### Few-Shot Learning
The system learns from built-in examples to maintain consistency:
- **Style Templates**: Pre-defined visual patterns
- **Prompt Analysis**: Understands design intent
- **Context Adaptation**: Adjusts based on use case

### Intelligent File Management
- **Smart Naming**: AI generates contextually appropriate filenames
- **Conflict Resolution**: Automatic numbering (icon-2.svg, icon-3.svg)
- **Path Intelligence**: Saves to logical locations based on context

## 🔧 Configuration

### Claude Desktop Setup
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "icon-generator": {
      "command": "icon-generator-mcp"
    }
  }
}
```

### Environment Variables (Optional)
```env
# Default output directory
DEFAULT_OUTPUT_PATH=./icons

# Debug mode
DEBUG_MODE=false

# Preferred LLM provider
DEFAULT_LLM_PROVIDER=claude
```

## 📊 Performance

### Benchmarks
- **Text-only generation**: 3-8 seconds
- **PNG conversion**: 5-12 seconds
- **Style-based generation**: 4-10 seconds
- **Complex multi-reference**: 8-15 seconds

### Optimization Tips
- Use descriptive, specific prompts for better results
- Combine PNG references with text for complex concepts
- Specify style preferences for consistent icon families
- Use custom output paths for organized file management

## 🎨 Style Gallery

### Black & White Flat Style
Perfect for professional applications and documentation.

**Characteristics:**
- Black outlines on white background
- Minimal geometric shapes
- Clean, scalable design
- Consistent stroke width

**Best for:**
- UI icons
- Documentation
- Professional applications
- Icon families

### Minimal Style
Ultra-simple designs focusing on essential elements.

**Characteristics:**
- Reduced visual complexity
- Essential shapes only
- High contrast
- Maximum clarity

**Best for:**
- Small sizes (16x16, 24x24)
- Mobile interfaces
- Quick recognition

### Outline Style
Line-art approach with no fills.

**Characteristics:**
- Stroke-only design
- Consistent line weight
- Scalable at any size
- Modern appearance

**Best for:**
- Modern web interfaces
- Flexible theming
- High-contrast needs

## 🛡️ Security & Quality

- **Input Validation**: All inputs are sanitized and validated
- **SVG Sanitization**: Generated SVGs are cleaned of potentially harmful content
- **Local Processing**: No data sent to external services (except LLM APIs)
- **Quality Assurance**: Built-in validation ensures proper SVG structure

## 🚀 Development

### Local Development Setup
```bash
# Clone and setup
git clone <repository>
cd icon-generator-mcp
npm install

# Build and test
npm run build
npm test

# Local testing without publishing
npm link
```

### Testing Examples
```bash
# Test text-only generation
node example/demos/test-prompt-only.js

# Test PNG conversion
node example/demos/test-conversion.js

# Test style consistency
node example/test-few-shot.js
```

## 🤝 Contributing

We welcome contributions! Areas for improvement:
- Additional style templates
- New LLM provider integrations
- Enhanced PNG processing
- Cross-platform support

## 📄 License

MIT License - feel free to use in your projects!

## 🆘 Support

- **Issues**: Report bugs on GitHub
- **Documentation**: See `/docs` directory
- **Examples**: Check `/example` directory for usage patterns

---

**Built with ❤️ for developers who need beautiful, consistent icons fast.**