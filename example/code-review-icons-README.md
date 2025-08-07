# Code Review Icon Generation

This directory contains examples and regression tests for generating code review icons using few-shot learning patterns.

## Overview

The code review icon generation uses two high-quality SVG examples as few-shot learning patterns to generate new code review icons with consistent style and structure.

## Few-Shot Examples

### 1. Dual Documents Pattern (`code-review-bw-dual-documents.svg`)
- **Concept**: Two overlapping documents representing before/after comparison
- **Visual Elements**: 
  - Two rectangular documents with rounded corners
  - Horizontal lines representing code
  - Checkmark indicator for approval
- **Style**: Black outlines on white background, `viewBox="0 0 24 24"`

### 2. Magnifying Code Pattern (`code-review-bw-magnifying-code.svg`)
- **Concept**: Magnifying glass examining code/document
- **Visual Elements**:
  - Document with code lines
  - Magnifying glass for inspection
  - Clean geometric shapes
- **Style**: Black outlines on white background, consistent stroke widths

## Derived Prompt Pattern

Based on analysis of the examples, the optimal prompt pattern for code review icons is:

```
Create a code review icon in black and white with simple flat design. 
[SPECIFIC VISUAL CONCEPT]. 
Use only black outlines on white background, minimal details, clean geometric shapes.
```

**Key Style Characteristics**:
- `viewBox="0 0 24 24"` standard
- `stroke="black"` and `fill="white"`
- `stroke-width="2"` for main elements
- `stroke-width="1"` for detail lines
- `stroke-linecap="round"` and `stroke-linejoin="round"`
- Minimal, geometric design approach

## Usage

### Running the Code Review Icon Regression Test

```bash
# Run the specialized code review icon test
./scripts/run-code-review-regression-test.sh

# Or run directly with npm
npm run test:code-review
```

### Generated Output

The test generates a new code review icon using the few-shot learning patterns:
- **Input**: The two example SVGs as few-shot patterns
- **Output**: New code review icon with badge/stamp concept
- **Location**: `test/test-output/test-code-review-badge-regression.svg`

## Pattern Validation

The regression test validates:
- ✅ Standard viewBox dimensions (0 0 24 24)
- ✅ Proper SVG namespace
- ✅ Black stroke styling
- ✅ White fill styling  
- ✅ Code line elements (multiple `<line>` elements)
- ✅ Review indicator elements (circles, rects, polylines)

## Example Generated Concepts

Using the few-shot patterns, the system can generate variations like:
- Document with approval badge
- Code with review stamp
- File comparison with status indicator
- Code inspection with approval mark

## Technical Implementation

The few-shot learning approach:
1. **Pattern Recognition**: Analyzes the two example SVGs
2. **Style Extraction**: Identifies consistent styling rules
3. **Concept Mapping**: Maps visual concepts to code review activities
4. **Generation**: Creates new icons following the learned patterns

This ensures consistent, high-quality code review icons that match the established design system.