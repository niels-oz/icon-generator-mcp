# Document 1: MVP Scope Definition

**Project Name:** `icon-generator-mcp`
**Document Version:** 2.0
**Status:** Final
**Date:** July 16, 2025

| Version | Date | Author | Changes |
| :--- | :--- | :--- | :--- |
| 1.0 | 2025-07-16 | System | Initial Draft |
| 1.1 | 2025-07-16 | System | Refined scope definitions, added clarity on dependencies and platform support. |
| 2.0 | 2025-07-16 | System | Updated to MCP server architecture, Claude Code CLI integration, manual binary installation. |

### 1. Project Goal

To create an MCP server that enables developers to generate SVG icons from PNG references and text prompts through their existing Claude Code workflow. The server will leverage the Claude LLM as its generative engine, orchestrating a local data pipeline and providing on-demand icon generation capabilities.

### 2. MVP: In-Scope Features

The following features and characteristics define the mandatory scope for the initial release:

*   **Core Functionality:** The MCP server will perform single, end-to-end icon generation per request, creating one new SVG icon from provided PNG references and text prompt.
*   **MCP Server Architecture:** The server will expose an `generate_icon` tool via the MCP protocol, allowing integration with Claude Code and other MCP-compatible clients.
*   **Input Format:** The server will support PNG files as image inputs (single or multiple references) plus mandatory text prompt.
*   **Platform Support:** The MVP will be officially developed for and supported on **macOS Apple Silicon only** to minimize complexity.
*   **LLM Provider:** The server will exclusively use the **Anthropic Claude** model family via the Claude Code CLI tool as its generative engine.
*   **LLM Interaction:** The server will interact with Claude by invoking the official Claude Code CLI tool as a subprocess. It will not handle API keys or authentication tokens directly.
*   **Vectorization Engine:** The server will use locally installed `potrace` binary for PNG-to-SVG vectorization. Users must install via `brew install potrace`.
*   **Image Pre-processing:** Any necessary image manipulation (e.g., converting PNG to the BMP format required by Potrace) will be handled by a pure JavaScript library (`jimp`) to avoid system-level dependencies like ImageMagick.
*   **Installation:** The server must be installable as a global package via npm (`npm install -g icon-generator-mcp`).
*   **Server Activation:** The MCP server will be started on-demand when icon generation is requested through the MCP protocol.
*   **Output Management:** Generated SVG files will be saved to the same directory as input PNG files with LLM-generated filenames and automatic conflict resolution.
*   **Tool Agnostic Design:** The server architecture will support future integration with other LLM providers, though MVP implementation uses Claude Code CLI only.

### 3. MVP: Out-of-Scope (Future Iterations)

The following items are explicitly excluded from the MVP but are recognized as valuable potential enhancements for future versions:

*   **Expanded Platform Support:** Support for macOS Intel, Windows, and Linux platforms.
*   **Bundled Binary Distribution:** Pre-compiled Potrace binaries bundled with the npm package for zero-dependency installation.
*   **Expanded Image Support:** Support for other input formats like JPEG, GIF, and WebP.
*   **Multi-Generation:** The ability to generate multiple design variations from a single prompt.
*   **Batch Processing:** Processing multiple icon requests in a single operation.
*   **Multi-LLM Support:** Integrating other LLM providers like OpenAI (GPT series) or Google (Gemini).
*   **Direct API Key Authentication:** Allowing users to provide API keys directly, bypassing the dependency on CLI tools.
*   **Advanced Conversion Tuning:** Exposing advanced Potrace parameters for fine-tuning vectorization.
*   **Configuration Files:** Support for persistent configuration files or project-level settings.
*   **Plugin Architecture:** Designing a formal plugin system for custom conversion engines or prompt strategies.
*   **Usage Analytics:** Adding opt-in, anonymous usage telemetry for product improvement.
*   **GUI Integration:** Desktop application or web interface for non-technical users.
*   **Cloud Processing:** Remote processing capabilities for improved performance or resource sharing.