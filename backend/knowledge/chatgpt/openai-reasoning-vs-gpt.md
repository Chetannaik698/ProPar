---
title: OpenAI Model Selection & Prompting Styles (Reasoning vs GPT Models)
platform: chatgpt
category: prompt-engineering
tags: [openai, reasoning-models, gpt-models, o-series, gpt-4.1, gpt-5, model-selection]
---

# OpenAI Model Selection & Prompting Styles

OpenAI models split into two broad families that require fundamentally different prompting strategies:

## Two Model Families, Two Prompting Styles

1. **Reasoning Models (o-series: o1, o3, o4-mini)**:
   - Generate an internal chain of thought before answering.
   - Built for ambiguity, multi-step planning, cross-document synthesis, and complex decision-making.
   - *Mental Model*: Like a **senior coworker** — state the end goal and success criteria, and trust it with the execution details.

2. **GPT Models (GPT-4.1, GPT-5 series)**:
   - Fast, cost-efficient, and highly capable for well-specified execution.
   - Perform best with explicit, step-by-step instructions.
   - *Mental Model*: Like a **junior coworker** — performs best with a clear, detailed, step-by-step brief.

---

## When to Use Reasoning Models

Per OpenAI guidance, reasoning models outperform GPT models on:
1. **Ambiguous tasks**: Limited or unclear instructions where the model needs to infer intent or ask clarifying questions.
2. **"Needle in a haystack" tasks**: Extracting specific relevant facts out of massive unstructured documents.
3. **Cross-document relationships & nuance**: Reasoning over many dense documents (contracts, filings, policies).
4. **Multistep agentic planning**: Decomposing large tasks into sub-tasks.
5. **Visual reasoning over ambiguous images**: Complex diagrams, tables, or poor-quality photos.
6. **Code review & debugging**: Cross-file diffs and subtle correctness issues.
7. **Evaluation / LLM-as-judge tasks**: Grading or validating other models' outputs.

---

## Rules for Prompting Reasoning Models

- **Keep prompts simple and direct**: Skip "think step by step" or "explain your reasoning". Internal chain-of-thought is automatic; requesting CoT explicitly can degrade performance.
- **State the destination, not the route**: State the high-level goal, hard constraints (budget, scope), and explicit success criteria (Pattern 6).
- **Use developer messages**: Use developer role rather than system role.
- **Enable Markdown explicitly if desired**: Include `Formatting re-enabled` on line 1 of developer message, because reasoning models suppress Markdown by default (Pattern 9).
- **Try zero-shot first**: Reasoning models rarely require few-shot examples unless output formatting is exceptionally complex.

---

## Rules for Prompting GPT Models

- **Be explicit and detailed**: Spell out step-by-step logic, edge cases, and forbidden actions (Pattern 7).
- **Use Format-by-Example**: Provide literal output templates (Pattern 3) or few-shot demonstrations (Pattern 4).
- **Enforce structural hierarchy**: Follow `# Identity` -> `# Instructions` -> `# Examples` -> `# Context` (Pattern 1).
- **Lead with instructions**: State instructions first, delimited from data with triple quotes (`"""`) or XML tags.
