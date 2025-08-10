# Product Requirements Document

**Project:** `icon-generator-mcp`  
**Version:** 3.0 - LLM-Agnostic Implementation  
**Date:** January 2025  
**Status:** Production Ready  

| Version | Date | Changes |
|---------|------|----------|
| 1.0 | 2025-07-16 | Initial MCP server concept |
| 2.0 | 2025-07-16 | LLM integration planning |
| 3.0 | 2025-01-10 | LLM-agnostic implementation complete |

## 1. Product Overview

The `icon-generator-mcp` is an LLM-agnostic Model Context Protocol (MCP) server that provides structured context for AI-powered SVG icon generation. The server processes PNG references and text prompts, then returns formatted generation context that any MCP-compatible LLM can use to create custom SVG icons.

## 2. Target Users

**UI/UX Designers:** Need to quickly iterate on icon ideas that match existing design systems using any preferred AI assistant (Claude, Gemini, GPT, etc.) with consistent style guidance.

**Frontend Developers:** Need to create production icons for web applications directly within their MCP-enabled development environment without switching tools.

**Brand Managers:** Need to explore brand asset variations using AI-powered generation while maintaining visual consistency across different LLM providers.

**Content Creators:** Need custom iconography for presentations, documentation, and digital content with simple text descriptions and style references.

## 3. Core Product Requirements

### 3.1 LLM-Agnostic Architecture
| ID | Requirement | Priority |
|-----|-------------|----------|
| **PR-1** | System **MUST** work with any MCP-compatible LLM client (Claude, Gemini, GPT, local LLMs) | Critical |
| **PR-2** | Server **MUST** provide structured generation context instead of direct LLM calls | Critical |
| **PR-3** | No hardcoded LLM provider dependencies or CLI subprocess calls | Critical |
| **PR-4** | Context preparation response time **MUST** be under 500ms | High |

### 3.2 Core Generation Features  
| ID | Requirement | Priority |
|-----|-------------|----------|
| **GF-1** | Accept PNG/SVG reference files and convert to structured context | High |
| **GF-2** | Accept text prompts and generate detailed generation instructions | High |
| **GF-3** | Support style presets with few-shot learning examples | High |
| **GF-4** | Phase-based processing pipeline with progress feedback | High |
| **GF-5** | PNG-to-SVG conversion using Potrace with Jimp preprocessing | High |

### 3.3 File Management
| ID | Requirement | Priority |
|-----|-------------|----------|
| **FM-1** | Smart output filename generation from prompts | Medium |
| **FM-2** | Automatic conflict resolution with numeric suffixes | Medium |
| **FM-3** | Custom output path support | Medium |
| **FM-4** | Validate input files and handle missing references gracefully | High |

## 4. Technical Requirements

### 4.1 Installation & Distribution
| ID | Requirement | Priority |
|-----|-------------|----------|
| **IN-1** | Single command installation: `npm install -g icon-generator-mcp` | High |
| **IN-2** | Require manual Potrace installation: `brew install potrace` | High |
| **IN-3** | Zero LLM CLI dependencies (Claude/Gemini CLI not required) | Critical |
| **IN-4** | Platform support: macOS initially, Windows/Linux planned | Medium |

### 4.2 Performance & Reliability
| ID | Requirement | Priority |
|-----|-------------|----------|
| **PR-1** | Context preparation under 500ms for typical requests | High |
| **PR-2** | PNG conversion within 2 seconds for 1024x1024 images | Medium |
| **PR-3** | Graceful handling of missing dependencies and invalid inputs | High |
| **PR-4** | Memory usage under 50MB during processing | Medium |

### 4.3 Security & Privacy
| ID | Requirement | Priority |
|-----|-------------|----------|
| **SP-1** | No API keys, credentials, or authentication handling | Critical |
| **SP-2** | No collection, storage, or transmission of user data | Critical |
| **SP-3** | Input validation for all file paths and parameters | High |
| **SP-4** | SVG sanitization for generated content (via LLM guidance) | High |

### 4.4 Compatibility & Integration  
| ID | Requirement | Priority |
|-----|-------------|----------|
| **CI-1** | Compatible with all MCP clients (Claude Code, Gemini, custom) | Critical |
| **CI-2** | MCP SDK 0.4.0+ compatibility | High |
| **CI-3** | Node.js 18+ runtime support | High |
| **CI-4** | Structured error responses with actionable guidance | High |

## 5. Product Context

### 5.1 User Environment Assumptions
- **Node.js 18+** installed with npm in system PATH
- **Potrace binary** installed via `brew install potrace` (macOS)
- **MCP-compatible client** (Claude Code, Gemini, or custom implementation)
- **No LLM CLI tools required** (LLM-agnostic architecture)

### 5.2 System Dependencies
- **MCP SDK 0.4.0+** for protocol implementation
- **Jimp library** for PNG preprocessing before Potrace conversion
- **System Potrace binary** for PNG-to-SVG vectorization
- **TypeScript/Node.js** runtime environment

### 5.3 Key Design Decisions
- **LLM-Agnostic**: Works with any MCP client, no hardcoded LLM providers
- **Context-Based**: Returns generation context instead of final SVGs
- **Phase-Based Pipeline**: 6-phase processing with state management
- **Zero Configuration**: Works immediately after installation

## 6. Success Metrics

### 6.1 User Experience
- **Installation Success Rate**: >95% successful installations
- **First-Use Success**: User generates first icon within 2 minutes
- **Multi-LLM Compatibility**: Works across Claude, Gemini, and GPT clients
- **Context Quality**: LLMs generate appropriate icons from provided context

### 6.2 Technical Performance
- **Context Preparation**: <500ms response time
- **PNG Conversion**: <2 seconds for typical reference images  
- **Error Rate**: <5% for valid inputs with proper dependencies
- **Memory Efficiency**: <50MB peak usage during processing

### 6.3 Ecosystem Adoption
- **Cross-Platform Support**: macOS production, Windows/Linux planned
- **Community Integration**: npm downloads, GitHub engagement
- **Developer Productivity**: Reduced icon creation time by 80%
- **Style Consistency**: Reliable style transfer with few-shot examples