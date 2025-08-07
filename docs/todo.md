# MCP Server Enhancement Plan

This document outlines the steps required to evolve the Icon Generator from a CLI-dependent tool into a true, LLM-agnostic, and installable MCP server.

## Phase 1: Decouple from Local CLIs

The highest priority is to remove the dependency on locally installed `claude` and `gemini` command-line tools. This will make the server portable and self-contained.

-   [ ] **Refactor ClaudeService:**
    -   Replace `execSync` with the official Anthropic Node.js SDK.
    -   Implement API-based communication for `generate`.
    -   Manage the Anthropic API key via environment variables (`ANTHROPIC_API_KEY`).

-   [ ] **Refactor GeminiService:**
    -   Replace `execSync` with the official Google AI Node.js SDK.
    -   Implement API-based communication for `generate`.
    -   Manage the Gemini API key via environment variables (`GEMINI_API_KEY`).

-   [ ] **Update Configuration:**
    -   Add `dotenv` to manage environment variables.
    -   Create a `.env.example` file with placeholders for API keys.
    -   Update documentation on how to set up API keys.

## Phase 2: Implement a Real MCP Server

The current server simulation needs to be replaced with an actual HTTP server that can listen for and respond to MCP requests.

-   [ ] **Integrate a Web Server:**
    -   Add a lightweight web server framework like Express.js.
    -   Create a `/mcp` endpoint to handle incoming tool calls.

-   [ ] **Implement MCP Request Handling:**
    -   The `/mcp` endpoint should parse incoming JSON requests.
    -   It should call the `MCPServer.handleToolCall` method with the appropriate tool name and parameters.
    -   The response from `handleToolCall` should be sent back as a JSON response.

-   [ ] **Update CLI Entry Point:**
    -   The `icon-generator-mcp --server` command should start the Express.js server and listen on a configurable port.

## Phase 3: Enhance for General Use & Installability

Make the server more robust, user-friendly, and ready for distribution.

-   [ ] **Dynamic Tool Loading:**
    -   Design a mechanism to load tool definitions from a specific directory (e.g., `/tools`).
    -   This allows users to add new capabilities without modifying the core server code.

-   [ ] **Improve Logging:**
    -   Integrate a structured logging library (e.g., Winston or Pino) for better diagnostics.

-   [ ] **Publishing Preparation:**
    -   Review `package.json` to ensure all dependencies are correct and `files` for publishing are properly listed.
    -   Add instructions to `README.md` on how to install and run the server from npm.

## Phase 4: User-Facing Example and Documentation

With the server running, create a simple example to showcase its capabilities.

-   [ ] **Create "Add User" Icon Example:**
    -   Analyze the style of existing icons in the project.
    -   Create a new example script (`example/test-add-user-icon.js`) that calls the running MCP server to generate a new "add user" icon that matches the existing style.

-   [ ] **Update Documentation:**
    -   Update `README.md` with instructions on how to use the server and run the new example.