      
# Technical Design Document: icon-generator-mcp

- **Version:** 3.0
- **Date:** January 2025
- **Status:** Current Implementation
- **Author:** Icon Generator Team

## 1. Purpose & Target Audience
This document provides the current technical architecture and implementation details for the `icon-generator-mcp` MCP server. It reflects the production system with multi-LLM support, phase-based generation, and comprehensive testing.

## 2. System Architecture

### 2.1. High-Level Design

The `icon-generator-mcp` is a phase-based MCP server that orchestrates a complete icon generation pipeline with multi-LLM provider support. It combines PNG-to-SVG conversion, AI-powered generation, and intelligent file management through a state-managed workflow with visual progress feedback.

### 2.2. Component Diagram & Data Flow

The system is designed as a single Node.js process that implements the MCP protocol and sequentially executes a series of services.

```
+--------------------------------------------------------------------------------+
| Claude Code / MCP Client Environment (macOS)                                  |
|                                                                                |
| [User] -> generate_icon(pngs: ["icon1.png"], prompt: "A new icon")           |
|   |                                                                            |
|   V                                                                            |
| +--------------------------------------------------------------------------+   |
| | icon-generator-mcp Server (Single Node.js Process)                      |   |
| |                                                                          |   |
| | +-----------------+ +---------------------+ +---------------------+     |   |
| | | 1. MCP Handler  |-->| 2. Conversion      |-->| 3. Prompt Builder |     |   |
| | | (Tool Registry) | | Service             | | Service           |     |   |
| | +-----------------+ +---------------------+ +---------------------+     |   |
| |                     | (Potrace binary)    |                             |   |
| |                     '---------------------'                             |   |
| |                                                                          |   |
| |                             V                                            |   |
| | +--------------------------------------------------------------------+   |   |
| | | 4. LLM Service (Wrapper for Claude Code CLI)                      |   |   |
| | |                                                                    |   |   |
| | | '--> [spawns subprocess] $ claude "<Generated Prompt>"            |   |   |
| | +--------------------------------------------------------------------+   |   |
| |                             ^                                            |   |
| | +-----------------------------------+--------------------------------+   |   |
| | | 6. SVG Validator & File Writer | <--- | 5. Parse Claude stdout      |   |   |
| | +------------------+----------------+ +---------------------------------+   |   |
| |                    |                                                      |   |
| |                    V                                                      |   |
| |          [Write File] -> generated-icon-name.svg                         |   |
| +--------------------------------------------------------------------------+   |
|                                                                                |
+--------------------------------------------------------------------------------+
                                ^                                                 |
                                | (Control/Data via MCP Protocol)               |
                                |                                                 V
                 +--------------------------+-------------------------+
                 | External Services                                |
                 |                                                  |
                 | +------------------------------------------------+ |
                 | | Anthropic Claude API                           | |
                 | +------------------------------------------------+ |
                 |                                                  |
                 +--------------------------------------------------+
```

      
### 2.3. Technology Choices & Rationale

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | Ubiquitous in modern development environments, excellent for I/O-bound tasks, and has a rich ecosystem via npm for packaging and distribution. |
| **MCP Protocol**| `@modelcontextprotocol/sdk` | Official SDK for implementing Model Context Protocol servers, providing standardized tool registration and client communication. |
| **Vectorization** | System-installed `potrace` binary | Industry-standard for high-quality bitmap tracing. Manual installation via `brew install potrace` reduces package complexity and size for MVP. |
| **Image Processing** | `jimp` | A pure JavaScript image processing library with no native dependencies. This avoids forcing users to install system-level tools like ImageMagick. |
| **LLM Interface**| `child_process.spawn` | A secure method for executing the external Claude Code CLI. It avoids invoking a shell, mitigating command injection risks, and allows for efficient streaming of I/O. |
| **SVG Sanitization**| Custom sanitization | Security-focused SVG cleaning to remove potentially malicious elements like `<script>` tags and event attributes. |

### 3. Current Architecture Components

### 3.1. Core Components

#### MCPServer (`src/server.ts`)
- **Role:** Main orchestrator with 6-phase generation pipeline
- **Phases:** Validation → Analysis → Conversion → Generation → Refinement → Output
- **Features:** State management, visual progress, error handling
- **Interface:** `generate_icon(png_paths?, prompt, style?, output_name?, output_path?, llm_provider?)`

#### 3.2. `ConversionService`
- **Responsibility:** Manages the conversion of a single PNG file buffer into a valid SVG string.
- **Interface:** `async convert(pngPath: string): Promise<string>`
- **Implementation Details:**
    1.  Uses `jimp` to load the PNG file and save it to a temporary BMP file in the OS's temporary directory.
    2.  Locates the system-installed `potrace` binary in the user's PATH.
    3.  Executes `potrace` as a subprocess (`execFile`) on the temporary BMP, capturing its `stdout`.
    4.  Performs cleanup by deleting the temporary BMP file.

#### 3.3. `PromptBuilderService`
- **Responsibility:** Assembles the final, structured text prompt to be sent to the LLM.
- **Interface:** `build(svgs: string[], userPrompt: string): string`
- **Implementation Details:**
    1.  Takes an array of reference SVG strings and the user's text prompt.
    2.  Constructs a single string using a template with clear XML-like delimiters, instructing the LLM on its role, the reference material, and the final task.

#### Multi-LLM Architecture (`src/services/llm/`)
- **Factory Pattern:** `factory.ts` - Dynamic provider selection
- **Claude Integration:** `claude.ts` - Claude CLI with proper auth handling
- **Gemini Integration:** `gemini.ts` - Gemini CLI with fallback support
- **Provider Selection:** Runtime provider switching via `llm_provider` parameter
- **Authentication:** Delegates to CLI tools, no credential handling

#### 3.5. `SVGValidatorService`
- **Responsibility:** Cleans and validates the SVG string received from the LLM to ensure it is safe and well-formed.
- **Interface:** `async validateAndSanitize(svgString: string): Promise<string>`
- **Implementation Details:**
    1.  Uses custom sanitization logic with strict pattern matching.
    2.  Removes all `<script>` tags, `on*` event attributes, `<foreignObject>` elements, and other potential XSS vectors.
    3.  Validates the XML structure using standard XML parsing; throws an error if the SVG is malformed.

#### 3.6. `FileWriterService`
- **Responsibility:** Handles output file naming, conflict resolution, and writing the final SVG to disk.
- **Interface:** `async writeIcon(svgContent: string, pngPath: string, suggestedName?: string): Promise<string>`
- **Implementation Details:**
    1.  Determines output directory (same as input PNG file).
    2.  Generates filename using LLM suggestion or fallback naming.
    3.  Implements conflict resolution by appending index numbers (e.g., `-2`, `-3`).
    4.  Writes the sanitized SVG content to the final path.

### 4. Current Implementation Status

- **Published Package:** Available as `icon-generator-mcp` on npm
- **Global Installation:** `npm install -g icon-generator-mcp`
- **Zero Configuration:** Works out-of-box in Claude Code/Gemini environments
- **Testing:** 32 tests with 81% coverage, including regression tests
- **Multi-LLM Support:** Claude + Gemini providers with runtime selection
- **Phase-Based Pipeline:** 6-step generation with state management and visual feedback

### 5. Security Architecture

- **Threat Model:**
    1.  **Malicious LLM Output:** The primary threat is the LLM generating an SVG containing malicious code (e.g., XSS payloads via `<script>` tags).
    2.  **Credential Exposure:** A secondary threat is the accidental exposure of user authentication credentials.
    3.  **Input Validation:** Risk of malicious PNG files or crafted prompts causing system compromise.
- **Security Controls:**
    1.  **Output Sanitization (Primary Control):** The `SVGValidatorService` is the critical control for mitigating malicious LLM output. Its strict pattern matching and XML validation are hard requirements.
    2.  **Delegated Authentication (Primary Control):** The server's architecture delegates 100% of the authentication and API key handling to the external Claude Code CLI. By never touching credentials, the server eliminates an entire class of security risks.
    3.  **Secure Subprocess Execution:** `child_process.spawn` and `execFile` are used instead of `exec`, which prevents shell-based command injection vulnerabilities. All variable data (like prompts) is passed as distinct arguments to the child process, not interpolated into a command string.
    4.  **Input Validation:** PNG file format validation, file size limits, and prompt content filtering prevent malicious input processing.
    5.  **Process Isolation:** The MCP server runs as a separate process with limited system access, reducing the attack surface.

    