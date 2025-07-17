# Demo Scripts

This directory contains demonstration scripts showing the core features of the Icon Generator MCP Server.

## Available Demos

### Core Features
- `test-simple.js` - Basic single icon generation
- `test-prompt-only.js` - Prompt-only generation (no PNG references)
- `test-conversion.js` - PNG to SVG conversion testing

## Running Demos

Make sure to build the project first:
```bash
npm run build
```

Then run any demo:
```bash
node example/demos/test-simple.js
node example/demos/test-prompt-only.js
node example/demos/test-conversion.js
```

## Generated Files

All generated SVG files are saved to `example/test-outputs/` for easy access and review.

## What Each Demo Shows

- **test-simple.js**: Basic workflow with PNG reference + prompt
- **test-prompt-only.js**: Pure text-based icon generation
- **test-conversion.js**: PNG to SVG conversion capabilities