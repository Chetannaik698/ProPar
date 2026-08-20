---
title: Anthropic Advanced Prompting Standards
platform: claude
category: prompt-engineering
tags: [claude, xml-tags, anthropic, role-prompting, structured-prompting]
---

# Anthropic Advanced Prompt Engineering Standards

When engineering prompts for Claude models (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3.5 Haiku):

## 1. Explicit XML Tag Structuring
Claude responds exceptionally well to clear XML tag delimiters. Organize complex prompts using explicit tags:
- `<role>`: Domain-specific persona (e.g. Senior B2B SaaS Copywriter, Principal Database Architect).
- `<task>`: The core objective or primary deliverable required.
- `<context>`: Background material, target audience details, or historical context.
- `<instructions>`: Step-by-step execution directives.
- `<constraints>`: Non-negotiable boundaries, prohibited terms, or length limits.
- `<output_format>`: Exact structural schema, Markdown headers, or JSON requirements.

## 2. Context Placement Rule
Place large reference documents, retrieved context, or input code inside `<context>` or `<documents>` tags BEFORE the `<instructions>` block. This allows Claude to absorb the reference material before reading instructions on how to process it.

## 3. Avoiding Placeholder Stuffing
Never leave unfilled bracket placeholders such as `[Insert main goal...]` inside final prompts. Replace them with specific inferred details from the user draft.

## 4. Reasoning & Stepwise Thinking
Ask Claude to outline key considerations before presenting the final answer, but specify that reasoning should be concise and directly relevant to the deliverable.
