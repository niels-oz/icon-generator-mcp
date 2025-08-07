# Gemini Code Assistant Guide: Icon Generator

This document provides a guide for using Gemini to assist with the development of the Icon Generator project.

## Project Overview

The project is a Node.js-based server that generates SVG icons from text descriptions or PNG images using an AI model (originally Claude). It can be used as a standalone tool or integrated as an "MCP Server". Key features include web search for reference images, automatic style detection, and the generation of multiple icon variations.

## Tech Stack

-   **Language:** TypeScript
-   **Runtime:** Node.js
-   **Testing:** Jest
-   **Key Dependencies:**
    -   `potrace`: For PNG to SVG vectorization.
    -   AI SDKs for LLM interaction.
    -   Google Search API for image search.

## Key Files

-   `src/server.ts`: The core application logic for the MCP server.
-   `src/services/converter.ts`: Handles the PNG to SVG conversion.
-   `src/services/llm.ts`: Manages interaction with the AI model.
-   `src/services/file-writer.ts`: Handles writing the generated SVG files.
-   `package.json`: Defines project scripts and dependencies.
-   `jest.config.js`: Jest test runner configuration.
-   `example/demos/`: Contains scripts demonstrating various features.

## Development Workflow

-   **Install dependencies:** `npm install`
-   **Build:** `npm run build`
-   **Run tests:** `npm test`
-   **Run in development mode:** `npm run dev`
-   **Start server:** `npm start`

## How Gemini Can Help

I can assist with a variety of development tasks, including:

-   **Implementing new features:** For example, adding support for more image formats (JPEG, GIF) or integrating with other LLMs.
-   **Writing tests:** Creating new unit or integration tests to improve code coverage and ensure reliability.
-   **Refactoring code:** Improving the existing codebase by making it more modular, efficient, or readable.
-   **Updating documentation:** Keeping `README.md` and other documents in `docs/` up-to-date with the latest changes.
-   **Debugging:** Helping to identify and fix bugs within the application.
-   **Creating examples:** Adding new scripts to the `example/demos/` directory to showcase features to users.
