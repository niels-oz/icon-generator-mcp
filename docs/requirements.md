# Document 2: Software Requirements Document (SRD)

**Project Name:** `icon-generator-mcp`
**Document Version:** 2.0
**Status:** Final
**Date:** July 16, 2025

| Version | Date | Author | Changes |
| :--- | :--- | :--- | :--- |
| 1.0 | 2025-07-16 | System | Initial Draft |
| 1.1 | 2025-07-16 | System | Added requirement IDs, clarified priorities, and refined specifications for precision. |
| 2.0 | 2025-07-16 | System | Updated to MCP server architecture, Claude Code CLI integration, manual binary installation. |
| 2.1 | 2025-07-17 | User   | Alignment. |

### 1. Introduction
This document specifies the software requirements for the `icon-generator-mcp` MCP server. The server is designed to streamline the creative process for icon design by leveraging a Large Language Model (LLM) to generate new vector graphics based on visual and textual input through the Model Context Protocol (MCP).

### 2. User Profiles
*   **UI/UX Designer:** Needs to quickly iterate on icon ideas that match an existing design system's style through their Claude Code workflow.
*   **Frontend Developer:** Needs to create placeholder or simple production icons for a web application without leaving the development environment.
*   **Brand Manager:** Needs to explore variations of brand assets and logomarks using AI-powered generation.

### 3. Functional Requirements (FR)

| ID | Requirement | Priority |
| :--- | :--- | :--- |
| **FR-1** | The system **MUST** be implemented as an MCP server, installable via npm and integrable with Claude Code workflows. | High |
| **FR-2** | The system **MUST** expose a `generate_icon` tool via the MCP protocol that accepts PNG file paths and text prompts. | High |
| **FR-3** | The system **MUST** accept one or more file paths to PNG images as tool parameters. | High |
| **FR-4** | The system **MUST** require a text prompt as a mandatory tool parameter. | High |
| **FR-5** | The system **MUST** accept an optional output filename parameter. If not provided, the LLM **MUST** generate a contextually appropriate filename. | High |
| **FR-6** | The system **MUST** internally vectorize each input PNG image into a structured SVG XML format using a locally installed Potrace binary. | High |
| **FR-7** | The system **MUST** construct a single, coherent prompt for the LLM that includes the full SVG XML text of all reference images and the user's text prompt. | High |
| **FR-8**| The system **MUST** perform security sanitization on the received SVG to remove potentially executable elements (e.g., `<script>` tags, `on*` event attributes). | High |
| **FR-9**| The system **MUST** save the final, sanitized SVG to the same directory as the input PNG files, with automatic filename conflict resolution. | High |
| **FR-10**| The system **MUST** start on-demand when icon generation is requested through the MCP protocol. | High |

### 4. Non-Functional Requirements (NFR)

| ID | Category | Requirement | Priority |
| :--- | :--- | :--- | :--- |
| **NFR-1**| **Installation** | The server **MUST** be installable via a single command: `npm install -g icon-generator-mcp`. | High |
| **NFR-2**| **Dependencies** | The server **MUST** require users to manually install Potrace (`brew install potrace`) and the Claude Code CLI tool. No binary bundling is required for MVP. | High |
| **NFR-3**| **Platform** | The MVP version of the server **MUST** operate correctly on the macOS platform only. | High |
| **NFR-4**| **Performance** | The end-to-end generation process for a typical request (3 icons, 1024x1024px each) **SHOULD** complete in under 60 seconds. This is dependent on the external LLM latency and is not a hard guarantee. | Medium |
| **NFR-5**| **Security** | The server **MUST NOT** store, transmit, or handle user API keys or credentials. Authentication is delegated entirely in MVP. | High |
| **NFR-6**| **Usability** | The MCP server **MUST** provide clear, structured responses through the MCP protocol indicating success or failure with appropriate error messages. | High |
| **NFR-7**| **Privacy** | The server **MUST NOT** collect, store, or transmit any user data, input files, prompts, or usage analytics. | High |
| **NFR-8**| **Compatibility** | The server **MUST** be compatible with Claude Code and other MCP-compatible clients. | High |
| **NFR-9**| **Reliability** | The server **MUST** gracefully handle failure scenarios such as missing dependencies, invalid inputs, or LLM service unavailability. | High |

### 5. Assumptions and Dependencies

*   **A-1:** The user has Node.js (version 18 or newer) and npm installed and correctly configured in their system's PATH.
*   **A-2:** The user has installed the Claude Code CLI tool and has successfully authenticated it with their Anthropic account.
*   **A-3:** The user has installed Potrace via Homebrew (`brew install potrace`) and it is accessible in their system's PATH.
*   **A-4:** The user has an active internet connection to allow Image searches.
*   **A-5:** The user has Claude Code or another MCP-compatible client configured to connect to the icon-generator-mcp server.
*   **D-1:** The project is dependent on the MCP SDK for implementing the Model Context Protocol interface.
*   **D-2:** The project is dependent on the `jimp` npm package for in-memory image processing.
*   **D-3:** The project is dependent on the continued availability and command-line interface stability of the Claude Code CLI tool.
*   **D-4:** The project is dependent on the locally installed Potrace binary for PNG to SVG conversion.