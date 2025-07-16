# Icon Generator MCP Server - Pseudocode

## Main MCP Server Entry Point

```javascript
// src/server.js
FUNCTION main() {
    // Initialize MCP server
    server = new MCPServer("icon-generator", "1.0.0")
    
    // Register generate_icon tool
    server.addTool({
        name: "generate_icon",
        description: "Generate SVG icon from PNG references and text prompt",
        inputSchema: {
            png_paths: ARRAY_OF_STRINGS,     // Required PNG file paths
            prompt: STRING,                   // Required text description
            output_name: STRING_OPTIONAL      // Optional output filename
        }
    })
    
    // Handle tool execution
    server.onToolCall("generate_icon", generateIconHandler)
    
    // Start server
    server.start()
}
```

## Core Icon Generation Handler

```javascript
// src/tools/generate-icon.js
FUNCTION generateIconHandler(request) {
    TRY {
        // Step 1: Input validation
        pngPaths = request.params.png_paths
        prompt = request.params.prompt
        outputName = request.params.output_name || null
        
        validateInputs(pngPaths, prompt)
        
        // Step 2: PNG to SVG conversion
        svgReferences = []
        FOR EACH pngPath IN pngPaths {
            IF NOT fileExists(pngPath) {
                THROW ERROR("PNG file not found: " + pngPath)
            }
            
            IF NOT isValidPNG(pngPath) {
                THROW ERROR("Invalid PNG format: " + pngPath)
            }
            
            // Convert PNG to SVG using Potrace
            svgData = convertPNGToSVG(pngPath)
            svgReferences.push(svgData)
        }
        
        // Step 3: Build LLM prompt
        llmPrompt = buildLLMPrompt(svgReferences, prompt)
        
        // Step 4: Generate icon via LLM
        WITH timeout(60000) {
            result = callLLMService(llmPrompt)
            generatedSVG = result.svg
            suggestedName = result.filename
        }
        
        // Step 5: Sanitize SVG output
        cleanSVG = sanitizeSVG(generatedSVG)
        
        // Step 6: Determine output filename
        finalName = outputName || suggestedName
        outputPath = resolveOutputPath(pngPaths[0], finalName)
        outputPath = handleNameConflicts(outputPath)
        
        // Step 7: Write file
        writeFile(outputPath, cleanSVG)
        
        RETURN success({
            output_path: outputPath,
            message: "Icon generated successfully"
        })
        
    } CATCH error {
        RETURN failure({
            error: error.message,
            step: getCurrentStep()
        })
    }
}
```

## PNG to SVG Conversion Service

```javascript
// src/services/converter.js
FUNCTION convertPNGToSVG(pngPath) {
    // Get bundled Potrace binary path
    potraceBinary = getBundledPotracePath()
    
    // Prepare temporary BMP file (Potrace requirement)
    tempBMP = createTempFile(".bmp")
    
    TRY {
        // Convert PNG to BMP using jimp
        image = jimp.read(pngPath)
        image.write(tempBMP)
        
        // Execute Potrace conversion
        args = [tempBMP, "-s", "-o", "-"]  // SVG output to stdout
        result = executeCommand(potraceBinary, args)
        
        IF result.exitCode !== 0 {
            THROW ERROR("Potrace conversion failed: " + result.stderr)
        }
        
        svgData = result.stdout
        RETURN svgData
        
    } FINALLY {
        // Cleanup temp file
        deleteFile(tempBMP)
    }
}

FUNCTION getBundledPotracePath() {
    platform = process.platform
    arch = process.arch
    
    IF platform === "darwin" AND arch === "arm64" {
        binaryPath = path.join(__dirname, "../binaries/darwin-arm64/potrace")
        
        IF NOT fileExists(binaryPath) {
            THROW ERROR("Potrace binary not found for platform")
        }
        
        // Ensure binary is executable
        makeExecutable(binaryPath)
        RETURN binaryPath
    }
    
    THROW ERROR("Unsupported platform: " + platform + "-" + arch)
}
```

## LLM Service Integration

```javascript
// src/services/llm.js
FUNCTION callLLMService(prompt) {
    // Try Claude CLI first
    result = tryClaudeCLI(prompt)
    IF result.success {
        RETURN result.data
    }
    
    // Fallback to Gemini CLI
    result = tryGeminiCLI(prompt)
    IF result.success {
        RETURN result.data
    }
    
    THROW ERROR("No available LLM service found")
}

FUNCTION tryClaudeCLI(prompt) {
    TRY {
        // Check if Claude CLI is available
        IF NOT commandExists("claude") {
            RETURN failure("Claude CLI not found")
        }
        
        // Prepare command arguments
        args = ["--prompt", prompt]
        
        // Execute with timeout
        result = executeCommand("claude", args, {timeout: 55000})
        
        IF result.exitCode === 0 {
            // Parse response for SVG and filename
            parsed = parseClaudeResponse(result.stdout)
            RETURN success(parsed)
        }
        
        RETURN failure("Claude CLI failed: " + result.stderr)
        
    } CATCH error {
        RETURN failure(error.message)
    }
}

FUNCTION buildLLMPrompt(svgReferences, userPrompt) {
    prompt = `You are an expert SVG icon designer. 
    
Reference SVG icons:
${svgReferences.join('\n\n')}

User request: ${userPrompt}

Please generate:
1. A clean SVG icon that fulfills the request
2. A descriptive filename (no extension)

Format your response as:
FILENAME: [suggested-filename]
SVG: [complete SVG code]`
    
    RETURN prompt
}
```

## SVG Sanitization

```javascript
// src/services/validator.js
FUNCTION sanitizeSVG(svgContent) {
    // Remove potentially dangerous elements
    dangerous = [
        /<script[^>]*>.*?<\/script>/gis,
        /<style[^>]*>.*?<\/style>/gis,
        /on\w+="[^"]*"/gi,                    // Event handlers
        /javascript:/gi,                      // JavaScript URLs
        /<foreignObject[^>]*>.*?<\/foreignObject>/gis
    ]
    
    cleanSVG = svgContent
    
    FOR EACH pattern IN dangerous {
        cleanSVG = cleanSVG.replace(pattern, "")
    }
    
    // Validate SVG structure
    IF NOT isValidSVG(cleanSVG) {
        THROW ERROR("Generated SVG is invalid")
    }
    
    RETURN cleanSVG
}

FUNCTION isValidSVG(svgContent) {
    TRY {
        // Basic XML parsing validation
        parsed = parseXML(svgContent)
        
        // Check for root SVG element
        IF NOT parsed.documentElement.tagName === "svg" {
            RETURN false
        }
        
        RETURN true
        
    } CATCH error {
        RETURN false
    }
}
```

## Filename Management

```javascript
// src/utils/naming.js
FUNCTION resolveOutputPath(inputPath, suggestedName) {
    inputDir = path.dirname(inputPath)
    
    // Sanitize filename
    cleanName = sanitizeFilename(suggestedName)
    
    // Ensure .svg extension
    IF NOT cleanName.endsWith('.svg') {
        cleanName += '.svg'
    }
    
    outputPath = path.join(inputDir, cleanName)
    RETURN outputPath
}

FUNCTION handleNameConflicts(outputPath) {
    IF NOT fileExists(outputPath) {
        RETURN outputPath
    }
    
    // Generate indexed name
    baseName = path.basename(outputPath, '.svg')
    dir = path.dirname(outputPath)
    
    counter = 2
    WHILE true {
        indexedName = baseName + "-" + counter + ".svg"
        indexedPath = path.join(dir, indexedName)
        
        IF NOT fileExists(indexedPath) {
            RETURN indexedPath
        }
        
        counter++
    }
}

FUNCTION sanitizeFilename(filename) {
    // Remove invalid filesystem characters
    clean = filename
        .replace(/[<>:"/\\|?*]/g, '')     // Windows invalid chars
        .replace(/\s+/g, '-')            // Spaces to dashes
        .replace(/[^\w\-\.]/g, '')       // Only alphanumeric, dash, dot
        .toLowerCase()
    
    // Ensure reasonable length
    IF clean.length > 100 {
        clean = clean.substring(0, 100)
    }
    
    RETURN clean
}
```

## Reflection

This pseudocode provides a clear development roadmap with proper error handling and security considerations. The modular structure separates concerns while maintaining clear data flow. The timeout mechanism ensures responsive operation, and the CLI-first approach with fallback provides robust LLM integration.

The sanitization steps address security concerns while the filename management handles filesystem compatibility across different environments. The bundled binary approach ensures consistent vectorization capabilities without external dependencies.