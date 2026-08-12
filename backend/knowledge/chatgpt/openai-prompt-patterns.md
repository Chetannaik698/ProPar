---
title: Official OpenAI Prompt Patterns Catalog
platform: chatgpt
category: prompt-engineering
tags: [openai, prompt-patterns, chatgpt, system-prompt, developer-message, reasoning-models, gpt-models]
---

# Official OpenAI Prompt Patterns Catalog

This knowledge document catalogs the 11 reusable prompt patterns (templates and structures) documented in OpenAI's official documentation and interaction guides.

## Pattern Matrix & Selection Guide

| If you need... | Use pattern |
| :--- | :--- |
| A reusable system persona | Pattern 1: Structured Developer Message |
| A one-off transform on given text | Pattern 2: Instruction-then-Delimited-Content |
| Reliable structured output without a JSON schema | Pattern 3: Format-by-Example |
| To teach a task via demonstration | Pattern 4: Few-Shot Task Demonstration |
| Answers grounded in your own data | Pattern 5: Retrieval-Augmented Context (RAG) |
| Best results from an o-series reasoning model | Pattern 6: High-Level Goal Prompt |
| Best results from a GPT-family model | Pattern 7: Explicit Precise-Instruction Prompt |
| A long-running agent that doesn't stop early | Pattern 8: Agentic Persistence Prompt |
| Markdown back from a reasoning model | Pattern 9: Reasoning-Model Markdown Opt-In |
| Help drafting/refining a prompt itself | Pattern 10: Meta-Prompt (Prompt-Generating Prompt) |
| Constrained-label classification | Pattern 11: Classification / Labeling Prompt |

---

## Detailed Pattern Definitions

### Pattern 1 — The Structured Developer Message
The canonical shape recommended by OpenAI for a developer/system-level message:

```markdown
# Identity
<who the assistant is, its purpose, tone, high-level goals>

# Instructions
* <rule 1>
* <rule 2>
* <what to do instead of a forbidden action>

# Examples
<user_query>
...
</user_query>
<assistant_response>
...
</assistant_response>

# Context
<reference material / retrieved documents / data>
```
*Use when*: Building any reusable system prompt for an application, assistant persona, or API integration.

---

### Pattern 2 — Instruction-then-Delimited-Content
```markdown
<Task instruction, stated plainly and first>

Text: """
{content to operate on}
"""
```
*Use when*: Any single-turn task where the model needs to act on a specific piece of user-supplied content (summarizing, extracting, transforming).

---

### Pattern 3 — Format-by-Example
```markdown
<Task instruction>

Desired format:
<field 1>: <value pattern>
<field 2>: <value pattern>

Text: {text}
```
*Use when*: You need consistent, parseable structure in the output and a prose description alone isn't reliable enough.

---

### Pattern 4 — Few-Shot Task Demonstration
```markdown
<Task instruction>

Text 1: {example input 1}
Output 1: {example output 1}

Text 2: {example input 2}
Output 2: {example output 2}

Text 3: {real input}
Output 3:
```
*Use when*: Zero-shot instructions alone don't reliably produce the pattern you want; keep examples diverse and aligned with written instructions.

---

### Pattern 5 — Retrieval-Augmented Context (RAG)
```markdown
# Instructions
Answer the user's question using only the reference material below.
If the answer isn't in the material, say so.

# Context
<retrieved_document id="doc-1">
{retrieved passage 1}
</retrieved_document>
<retrieved_document id="doc-2">
{retrieved passage 2}
</retrieved_document>

# User question
{user question}
```
*Use when*: Grounding answers in proprietary, private, or up-to-date information the model wasn't trained on.

---

### Pattern 6 — High-Level Goal Prompt (for reasoning models: o1, o3, o4-mini)
```markdown
Goal: {clear statement of the desired end state}
Constraints: {hard limits — budget, format, scope}
Success criteria: {how to know the answer is good enough}

<supporting materials, delimited with XML/Markdown as needed>
```
*Use when*: Prompting a reasoning model (o-series). Deliberately omit step-by-step process instructions and chain-of-thought requests ("think step by step") — state the destination, not the route.

---

### Pattern 7 — Explicit Precise-Instruction Prompt (for GPT models: GPT-4.1, GPT-5)
```markdown
# Identity
{role}

# Instructions
1. {explicit step or rule}
2. {explicit step or rule}
...

# Data
{all logic/data needed to complete the task, spelled out in the prompt}
```
*Use when*: Prompting a GPT-family model, which benefits from precise instructions that explicitly provide the logic and data required, rather than being left to infer intent.

---

### Pattern 8 — Agentic Persistence Prompt
```markdown
You are an agent — keep going until the user's query is completely resolved before ending your turn. Decompose the request into all required sub-tasks and confirm each is completed. Do not stop after completing only part of the request.

Before calling a tool, briefly explain why (at notable steps only).

Plan extensively before each tool call, and reflect on the outcome of each call to confirm the sub-request is resolved.
```
*Use when*: Building long-running or multi-step agentic workflows, to prevent the model from stopping early or skipping sub-tasks. Pair with a TODO/progress-tracking mechanism.

---

### Pattern 9 — Reasoning-Model Markdown Opt-In
```markdown
Formatting re-enabled
<rest of developer message>
```
*Use when*: You specifically want Markdown-formatted output from a reasoning model, which suppresses Markdown formatting by default.

---

### Pattern 10 — Meta-Prompt (Prompt-Generating Prompt)
```markdown
Given a task description or existing prompt, produce a detailed system prompt to guide a language model in completing the task effectively.

# Guidelines
- Understand the Task: grasp the main objective, goals, requirements, constraints, and expected output.
- Minimal Changes: if an existing prompt is provided, improve it only if it's simple. For complex prompts, enhance clarity and add missing elements without altering the original structure.
```
*Use when*: Bootstrapping a new system prompt from a task description, or refining an existing one without destructively rewriting it.

---

### Pattern 11 — Classification / Labeling Prompt
```markdown
# Identity
You are a helpful assistant that labels {input type} as {label 1}, {label 2}, or {label 3}.

# Instructions
* Only output a single word, with no additional formatting or commentary.
* Your response must be exactly one of: "{label 1}", "{label 2}", "{label 3}".

# Examples
<input id="example-1">{example}</input>
<assistant_response id="example-1">{label}</assistant_response>
```
*Use when*: Sentiment/intent/category classification tasks where you need a constrained, single-token style output.
