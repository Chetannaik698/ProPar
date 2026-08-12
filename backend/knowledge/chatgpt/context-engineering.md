---
title: Context Engineering for Complex Prompts
platform: chatgpt
category: context-engineering
tags: [chatgpt, context, memory, system-prompt, focus]
---

# Context Engineering Principles

## Techniques
1. **Relevant Information Density**: Include only signal, not noise. Irrelevant background degrades instruction adherence.
2. **Delimiters & Sectioning**: Use clear XML tags (`<context>`, `<instructions>`, `<data>`) or Markdown headings to separate instructions from input text.
3. **Few-Shot Demonstration**: Provide 1-3 high quality input-output examples when requiring specific formatting or style matches.
4. **Edge Case Guardrails**: Explicitly detail fallback behavior when input information is incomplete or ambiguous.
