      
# Technical Design Document: icon-generator

- **Version:** 1.1
- **Date:** July 16, 2025
- **Status:** Final
- **Author:** System Architect

## 1. Purpose & Target Audience
This document provides the comprehensive technical architecture and specification for the `icon-generator` CLI tool. It is intended for software developers and tech leads responsible for the implementation, testing, and maintenance of the tool.

## 2. System Architecture

### 2.1. High-Level Design

The `icon-generator` is a stateless, monolithic command-line application that acts as an intelligent pre-processor and orchestrator for an external LLM CLI. It executes a local data transformation pipeline before delegating the core AI task and all associated authentication, thus minimizing its own complexity and security footprint.

### 2.2. Component Diagram & Data Flow

The system is designed as a single Node.js process that sequentially executes a series of services.

    

IGNORE_WHEN_COPYING_START
Use code with caution. Markdown
IGNORE_WHEN_COPYING_END

+--------------------------------------------------------------------------------+
| User's Terminal Environment (macOS) |
| |
| [User] -> $ icon-generator generate imgs/*.png --prompt "A new icon" |
| | |
| V |
| +--------------------------------------------------------------------------+ |
| | icon-generator CLI Tool (Single Node.js Process) | |
| | | |
| | +-----------------+ +---------------------+ +---------------------+ | |
| | | 1. CLI Parser |-->| 2. Conversion |-->| 3. Prompt Builder | | |
| | | (yargs) | | Service | | Service | | |
| | +-----------------+ +---------------------+ +---------------------+ | |
| | | | (Potrace binary) | | |
| | '---------------------'---------------------------' | |
| | | | |
| | V | |
| | +--------------------------------------------------------------------+ | |
| | | 4. LLM Service (Wrapper for Claude CLI) | | |
| | | | | | |
| | | '--> [spawns subprocess] $ claude -m "<Generated Prompt>" | | |
| | +--------------------------------------------------------------------+ | |
| | ^ | |
| | +-----------------------------------+--------------------------------+ | |
| | | 6. SVG Validator | <--- | 5. Parse Claude stdout (SVG Output) | | |
| | +------------------+ +-----------------------------------------+ | |
| | | | |
| | V | |
| | [Write File] -> new-icon.svg | |
| +--------------------------------------------------------------------------+ |
| |
+--------------------------------------------------------------------------------+
^ |
| (Control/Data) | (via external Claude CLI)
| V
+--------------------------+-------------------------+
| External Services |
| |
| +------------------------------------------------+ |
| | Anthropic Claude API | |
| +------------------------------------------------+ |
| |
+----------------------------------------------------+
Generated code

      
### 2.3. Technology Choices & Rationale

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | Ubiquitous in modern development environments, excellent for I/O-bound tasks, and has a rich ecosystem via npm for packaging and distribution. |
| **CLI Framework**| `yargs` | Provides a powerful and declarative API for building a robust and user-friendly command-line interface, including automatic help text generation. |
| **Vectorization** | Bundled `potrace` binary| Industry-standard for high-quality bitmap tracing. Bundling the binary for macOS removes a significant piece of installation friction for the end-user. |
| **Image Processing** | `jimp` | A pure JavaScript image processing library with no native dependencies. This avoids forcing users to install system-level tools like ImageMagick. |
| **LLM Interface**| `child_process.spawn` | A secure method for executing the external Claude CLI. It avoids invoking a shell, mitigating command injection risks, and allows for efficient streaming of I/O. |
| **SVG Sanitization**| `svgo` | A mature and highly configurable tool for SVG optimization. It will be used in a security-focused mode to parse and strip any potentially malicious elements. |

### 3. Component Design & Interfaces

#### 3.1. `CLI Entry Point` (`cli.js`)
- **Responsibility:** Defines the CLI command structure, parses arguments using `yargs`, and orchestrates the calls to other services in the correct sequence.
- **Interface:** `generate <input...> --prompt <p> --output <o>`
- **Output:** Invokes the main application logic with a validated `argv` object containing all user-provided arguments.

#### 3.2. `ConversionService`
- **Responsibility:** Manages the conversion of a single PNG file buffer into a valid SVG string.
- **Interface:** `async convert(buffer: Buffer): Promise<string>`
- **Implementation Details:**
    1.  Uses `jimp` to load the PNG buffer and save it to a temporary BMP file in the OS's temporary directory.
    2.  Determines the correct path to the bundled `potrace-macos` binary.
    3.  Executes `potrace` as a subprocess (`execFile`) on the temporary BMP, capturing its `stdout`.
    4.  Performs cleanup by deleting the temporary BMP file.

#### 3.3. `PromptBuilderService`
- **Responsibility:** Assembles the final, structured text prompt to be sent to the LLM.
- **Interface:** `build(svgs: string[], userPrompt: string): string`
- **Implementation Details:**
    1.  Takes an array of reference SVG strings and the user's text prompt.
    2.  Constructs a single string using a template with clear XML-like delimiters, instructing the LLM on its role, the reference material, and the final task.

#### 3.4. `LLMService` (Claude CLI Wrapper)
- **Responsibility:** Executes the external Claude CLI with the generated prompt and returns the LLM's response.
- **Interface:** `async generate(prompt: string): Promise<string>`
- **Implementation Details:**
    1.  Uses `child_process.spawn` to execute `claude` with the `-m` (message) flag and the complete prompt.
    2.  Streams and concatenates the `stdout` from the child process.
    3.  Resolves with the complete output string upon successful process exit. Rejects the promise if the process exits with a non-zero code.

#### 3.5. `SVGValidatorService`
- **Responsibility:** Cleans and validates the SVG string received from the LLM to ensure it is safe and well-formed.
- **Interface:** `async validateAndSanitize(svgString: string): Promise<string>`
- **Implementation Details:**
    1.  Uses `svgo` with a strict configuration preset.
    2.  The preset will be configured to remove all `<script>` tags, `on*` event attributes, foreign objects, and other potential XSS vectors.
    3.  The process implicitly validates the XML structure; an error will be thrown if the SVG is malformed.

### 4. Packaging & Distribution

- **`package.json` Configuration:** The package will be configured for global installation and execution.
    - **`name`:** The package will be scoped (e.g., `@username/icon-generator`) to ensure a unique name on the npm registry.
    - **`bin`:** A `bin` field will map the command `icon-generator` to the `cli.js` entry point file.
    - **`files`:** The `files` array will explicitly include the `vendor/` directory to ensure the Potrace binary is included in the published package.
    - **`scripts.postinstall`:** A `postinstall` script will be used to set the executable bit (`chmod +x`) on the bundled Potrace binary, ensuring it can be executed after installation.

### 5. Security Architecture

- **Threat Model:**
    1.  **Malicious LLM Output:** The primary threat is the LLM generating an SVG containing malicious code (e.g., XSS payloads via `<script>` tags).
    2.  **Credential Exposure:** A secondary threat is the accidental exposure of user authentication credentials.
- **Security Controls:**
    1.  **Output Sanitization (Primary Control):** The `SVGValidatorService` is the critical control for mitigating malicious LLM output. Its strict configuration is a hard requirement.
    2.  **Delegated Authentication (Primary Control):** The tool's architecture delegates 100% of the authentication and API key handling to the external `@anthropic-ai/claude` CLI. By never touching credentials, the tool eliminates an entire class of security risks.
    3.  **Secure Subprocess Execution:** `child_process.spawn` and `execFile` are used instead of `exec`, which prevents shell-based command injection vulnerabilities. All variable data (like prompts) is passed as distinct arguments to the child process, not interpolated into a command string.

    