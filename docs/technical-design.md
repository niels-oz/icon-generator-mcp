      
# Technical Design Document: icon-generator-mcp

- **Version:** 2.0
- **Date:** July 16, 2025
- **Status:** Final
- **Author:** System Architect

## 1. Purpose & Target Audience
This document provides the comprehensive technical architecture and specification for the `icon-generator-mcp` MCP server. It is intended for software developers and tech leads responsible for the implementation, testing, and maintenance of the server.

## 2. System Architecture

### 2.1. High-Level Design

The `icon-generator-mcp` is a stateless MCP server that acts as an intelligent pre-processor and orchestrator for an external LLM CLI. It exposes icon generation capabilities through the Model Context Protocol, executing a local data transformation pipeline before delegating the core AI task and all associated authentication, thus minimizing its own complexity and security footprint.

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

### 3. Component Design & Interfaces

#### 3.1. `MCP Server Entry Point` (`server.js`)
- **Responsibility:** Implements the MCP protocol, registers the `generate_icon` tool, and handles client connections.
- **Interface:** MCP tool endpoint: `generate_icon(png_paths: string[], prompt: string, output_name?: string)`
- **Output:** Starts the MCP server process and handles tool execution requests from MCP clients.

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

#### 3.4. `LLMService` (Claude Code CLI Wrapper)
- **Responsibility:** Executes the external Claude Code CLI with the generated prompt and returns the LLM's response.
- **Interface:** `async generate(prompt: string): Promise<{svg: string, filename: string}>`
- **Implementation Details:**
    1.  Uses `child_process.spawn` to execute `claude` with the complete prompt.
    2.  Streams and concatenates the `stdout` from the child process.
    3.  Parses the response to extract both the generated SVG and suggested filename.
    4.  Resolves with the parsed output object upon successful process exit. Rejects the promise if the process exits with a non-zero code.

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

### 4. Packaging & Distribution

- **`package.json` Configuration:** The package will be configured for global installation and MCP server execution.
    - **`name`:** `icon-generator-mcp` to clearly identify as an MCP server package.
    - **`bin`:** A `bin` field will map the command `icon-generator-mcp` to the `server.js` entry point file.
    - **`files`:** The `files` array will include only the necessary source files, excluding bundled binaries.
    - **`dependencies`:** Will include the MCP SDK and required Node.js libraries, but not bundled binaries.
    - **`scripts.postinstall`:** A `postinstall` script will validate the presence of required system dependencies (Potrace, Claude CLI) and provide installation guidance if missing.

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

    