# Document 2: Software Requirements Document (SRD)

**Project Name:** `icon-generator`
**Document Version:** 1.1
**Status:** Final
**Date:** July 16, 2025

| Version | Date | Author | Changes |
| :--- | :--- | :--- | :--- |
| 1.0 | 2025-07-16 | System | Initial Draft |
| 1.1 | 2025-07-16 | System | Added requirement IDs, clarified priorities, and refined specifications for precision. |

### 1. Introduction
This document specifies the software requirements for the `icon-generator` command-line utility (CLI). The tool is designed to streamline the creative process for icon design by leveraging a Large Language Model (LLM) to generate new vector graphics based on visual and textual input.

### 2. User Profiles
*   **UI/UX Designer:** Needs to quickly iterate on icon ideas that match an existing design system's style.
*   **Frontend Developer:** Needs to create placeholder or simple production icons for a web application without leaving the development environment.
*   **Brand Manager:** Needs to explore variations of brand assets and logomarks.

### 3. Functional Requirements (FR)

| ID | Requirement | Priority |
| :--- | :--- | :--- |
| **FR-1** | The system **MUST** be implemented as a Command-Line Interface (CLI) tool, installable via npm. | High |
| **FR-2** | The system **MUST** accept one or more file paths to PNG images as command-line arguments. | High |
| **FR-3** | The system **MUST** require a text prompt, provided via a mandatory command-line flag (`--prompt` or `-p`). | High |
| **FR-4** | The system **MUST** accept an optional output file path via a command-line flag (`--output` or `-o`). If not provided, it **MUST** default to `generated-icon.svg` in the current working directory. | High |
| **FR-5** | The system **MUST** internally vectorize each input PNG image into a structured SVG XML format using its bundled Potrace engine. | High |
| **FR-6** | The system **MUST** construct a single, coherent prompt for the LLM that includes the full SVG XML text of all reference images and the user's text prompt. | High |
| **FR-7** | The system **MUST** invoke the external `@anthropic-ai/claude` CLI tool as a subprocess to send the complete prompt to the Anthropic Claude API. | High |
| **FR-8** | The system **MUST** capture and parse the standard output from the Claude CLI, expecting it to contain the generated SVG data. | High |
| **FR-9** | The system **MUST** perform security sanitization on the received SVG to remove potentially executable elements (e.g., `<script>` tags, `on*` event attributes). | High |
| **FR-10**| The system **MUST** save the final, sanitized SVG to the specified output file path, overwriting the file if it already exists. | High |

### 4. Non-Functional Requirements (NFR)

| ID | Category | Requirement | Priority |
| :--- | :--- | :--- | :--- |
| **NFR-1**| **Installation** | The tool **MUST** be installable via a single command: `npm install -g icon-generator`. | High |
| **NFR-2**| **Dependencies** | The tool **MUST** bundle all necessary non-JS binaries (Potrace) and require no external system-level dependencies other than a standard Node.js environment and the separately installed `@anthropic-ai/claude` CLI tool. | High |
| **NFR-3**| **Platform** | The MVP version of the tool **MUST** operate correctly on the macOS platform (both Intel and Apple Silicon architectures). | High |
| **NFR-4**| **Performance** | The end-to-end generation process for a typical request (3 icons, 1024x1024px each) **SHOULD** complete in under 60 seconds. This is dependent on the external Claude API latency and is not a hard guarantee. | Medium |
| **NFR-5**| **Security** | The tool **MUST NOT** store, transmit, or handle user API keys or credentials. Authentication is delegated entirely to the external Claude CLI. | High |
| **NFR-6**| **Usability** | The command-line interface **MUST** provide clear, simple, and functional text-based feedback on its progress and on successful or failed completion. It **MUST** exit with a non-zero status code on failure. | High |
| **NFR-7**| **Privacy** | The tool **MUST NOT** collect, store, or transmit any user data, input files, prompts, or usage analytics. | High |

### 5. Assumptions and Dependencies

*   **A-1:** The user has Node.js (version 18 or newer) and npm installed and correctly configured in their system's PATH.
*   **A-2:** The user has installed the `@anthropic-ai/claude` CLI tool globally (`npm install -g @anthropic-ai/claude`) and has successfully authenticated it with their Anthropic account.
*   **A-3:** The user has an active internet connection to allow the Claude CLI to reach the Anthropic API.
*   **D-1:** The project is dependent on the `yargs` npm package for robust CLI argument parsing.
*   **D-2:** The project is dependent on the `jimp` npm package for in-memory image processing.
*   **D-3:** The project is dependent on the continued availability and command-line interface stability of the `@anthropic-ai/claude` CLI tool. Any breaking changes to the external CLI may require an update to `icon-generator`.