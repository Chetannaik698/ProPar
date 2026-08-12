---
title: Google Gemini 3 Best Practices and Pitfalls
platform: gemini
category: prompt-optimization
tags: [gemini, google, best-practices, mistakes, thinking, constraints, context]
---

# Google Gemini 3 Best Practices & Common Mistakes

Consolidated guidance from Google AI for Developers and Gemini documentation for building effective prompts and avoiding documented anti-patterns.

## Core Best Practices

1. **Use All Four Prompt Components Deliberately**:
   Consciously define Input (question/task/entity/completion), Constraints, Response Format, and Context rather than writing an unstructured block of text.
2. **Default to Including Few-Shot Examples**:
   Google official guidance emphasizes including few-shot examples by default. Prompts without examples are documented as likely less effective for Gemini.
3. **Use One Consistent Delimiter Convention**:
   Choose XML-style tags (`<role>`, `<context>`, `<task>`) OR Markdown headers (`# Identity`, `# Constraints`), but never mix them within the same prompt.
4. **Put Critical Instructions First**:
   Place essential behavioral constraints, persona/role definitions, and output-format requirements in System Instructions or at the very start of the prompt.
5. **Structure Differently for Long-Context Prompts**:
   For large context (documents, codebases), supply the context first and place the query/task at the very end, anchored by `"Based on the information above..."`.
6. **Match Thinking Configuration to Task Complexity**:
   - Simple tasks (fact lookup, classification) -> `minimal` or `low` thinking.
   - Moderate tasks (comparing concepts, creative reasoning) -> `default` thinking.
   - Complex tasks (advanced coding, math, multi-step planning) -> `high` or `maximum` thinking.
   - Do NOT add manual "think step by step" scaffolding on top of models that already reason internally (Gemini 2.5 / 3 series).
7. **Leave Sampling Parameters at Defaults for Gemini 3.x**:
   Keep `temperature`, `topP`, and `topK` at default values. Lowering temperature for "deterministic" output on Gemini 3.x is a documented anti-pattern that can cause looping or degraded performance.
8. **Ground Answers Instead of Guessing**:
   Enable Google Search grounding for real-time/obscure facts, and enable Code Execution whenever tasks involve math, counting, or exact calculation.
9. **Break Complex Tasks into Smaller Prompt Units**:
   Use instruction decomposition, prompt chaining (sequential steps), or response aggregation (parallel execution).
10. **Iterate Systematically**:
    Try rephrasing instructions, reframing as an analogous task (e.g. multiple choice), or reordering prompt blocks (`[examples]` -> `[context]` -> `[input]`).

---

## Common Mistakes to Avoid

### Instruction & Format Mistakes
1. **Leaving format unspecified**: Assuming the model will guess the exact structure wanted.
2. **Vague constraints**: Using "keep it short" instead of explicit bounds like "summarize in 3 sentences / under 100 words".
3. **Assuming Gemini 3 is conversational by default**: Gemini 3 models are terse and direct by default. Explicitly request conversational or detailed style if required.
4. **Mixing XML and Markdown headers**: Switching between `<tag>` style and `# Header` style inside one prompt.

### Few-Shot Mistakes
5. **Skipping few-shot examples**: Google documents zero-shot as a gap rather than a neutral choice for Gemini.
6. **Inconsistent formatting across examples**: Variations in whitespace, tags, or splitters corrupt output formatting.
7. **Overloading with too many examples**: Over-constrains the model and causes overfitting.

### Reasoning Model Mistakes
8. **Writing manual Chain-of-Thought instructions**: Redundant for Gemini 2.5/3 which automatically perform internal thinking.
9. **Mismatched `thinking_level`**: Using high thinking for simple tasks (wastes tokens) or minimal thinking for complex tasks (degrades quality).
10. **Trimming thought blocks/signatures in multi-turn**: In stateless mode, thought blocks and signatures must be resent unmodified on every turn to maintain reasoning continuity.

### Parameter & Iteration Mistakes
11. **Lowering temperature for factual tasks**: On Gemini 3.x, lowering temperature degrades reasoning and risks loops.
12. **Assuming context window headroom**: Media resolution settings (e.g., `media_resolution_high` for PDFs) increase token consumption.
13. **Sticking with a single failing phrasing**: Not testing rephrasing, analogous reframing, or content reordering.
