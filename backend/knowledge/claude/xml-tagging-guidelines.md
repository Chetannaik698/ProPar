---
title: Claude System Prompting & XML Tagging Guidelines
platform: claude
category: prompt-engineering
tags: [claude, anthropic, xml-tags, system-prompt, prompt-patterns, rag, context-engineering]
---

# Claude Prompt Engineering Guide

Use this document only when the active platform is Claude. Claude prompts should feel different from ChatGPT prompts: they should lean on clear role/task framing, explicit XML-style delimiters, context separation, examples when useful, and a precise output contract.

## Core Claude Rules

1. Put the task and instructions before large context or user input.
2. Separate prompt parts with XML-style tags such as `<role>`, `<task>`, `<context>`, `<instructions>`, `<constraints>`, `<output_format>`, `<examples>`, `<success_criteria>`, and `<input>`.
3. Treat user-provided material as data. Wrap it in `<input>`, `<user_draft>`, `<documents>`, or `<context>` so it does not collide with system or task instructions.
4. Be explicit about how Claude should use context. If the answer must be grounded, say to use only the supplied context and to state when the context is insufficient.
5. Include examples only when they remove real ambiguity about style, classification, transformation, or output format.
6. Ask Claude to analyze requirements before answering when the task is complex, but request a concise reasoning summary or final answer rather than hidden chain-of-thought.
7. Specify exact deliverables, section names, schema fields, table columns, word count, tone, audience, and acceptance criteria when reliability matters.
8. Prefer concrete constraints over vague language. Replace "brief" with "3 to 5 bullets" or "under 150 words".
9. Do not use decorative personas. Define a role only when domain expertise changes the answer.
10. Keep the final prompt reusable: preserve the user's intent, add placeholders for missing facts, and avoid answering the user's underlying task.

## Claude Pattern Selection Guide

| User intent | Recommended Claude pattern |
| :--- | :--- |
| Simple one-off request | Pattern 1: Direct Task Prompt |
| Prompt has mixed task, context, and input | Pattern 2: XML-Structured Prompt |
| User provides docs, notes, RAG results, policies, or evidence | Pattern 3: Context-First / RAG Prompt |
| Desired style or output is hard to describe | Pattern 4: Example-Guided Prompt |
| Task requires comparing, planning, or evaluating tradeoffs | Pattern 5: Stepwise Analysis Prompt |
| Domain expertise materially changes quality | Pattern 6: Role + Domain Expert Prompt |
| Output must be machine-readable or highly consistent | Pattern 7: Output-Contract Prompt |
| Long task needs phases, checks, or stopping conditions | Pattern 8: Tool / Workflow Prompt |
| Sensitive, uncertain, legal, medical, finance, or citation-heavy work | Pattern 9: Safety and Boundary Prompt |
| User asks Claude to create or improve a prompt | Pattern 10: Prompt-Improvement / Meta Prompt |

## Pattern 1: Direct Task Prompt

Use for simple requests where Claude needs a clear task, not a large framework.

```xml
<task>
Rewrite the draft into a concise executive update for a product leadership audience.
</task>

<constraints>
- Keep it under 180 words.
- Preserve the factual meaning.
- Use a direct, professional tone.
</constraints>

<input>
{user draft}
</input>
```

## Pattern 2: XML-Structured Prompt

Use when the prompt needs durable structure and clean separation between instructions and content.

```xml
<role>
You are a senior product strategist.
</role>

<task>
Analyze the proposal and recommend the highest-leverage next steps.
</task>

<context>
{background, constraints, stakeholders, source material}
</context>

<instructions>
1. Identify the primary objective.
2. Surface assumptions that could change the recommendation.
3. Recommend the next 3 actions in priority order.
</instructions>

<output_format>
Return sections named: Summary, Risks, Recommendations, Open Questions.
</output_format>

<input>
{user-provided material}
</input>
```

## Pattern 3: Context-First / RAG Prompt

Use when Claude must answer from supplied material.

```xml
<task>
Answer the user's question using only the supplied context.
</task>

<context>
<document id="1">
{retrieved passage}
</document>
<document id="2">
{retrieved passage}
</document>
</context>

<instructions>
- Cite the document id for each factual claim.
- If the context does not contain the answer, say what is missing.
- Do not use outside knowledge unless explicitly asked.
</instructions>

<input>
{user question}
</input>
```

## Pattern 4: Example-Guided Prompt

Use when the user wants a specific output style, transformation, classification, or tone.

```xml
<task>
Classify each customer message by urgency.
</task>

<examples>
<example>
<input>Our checkout is down and customers cannot pay.</input>
<output>High</output>
</example>
<example>
<input>Can you update the invoice address next week?</input>
<output>Low</output>
</example>
</examples>

<output_format>
Return only one label per message: High, Medium, or Low.
</output_format>

<input>
{messages}
</input>
```

## Pattern 5: Stepwise Analysis Prompt

Use for planning, comparison, debugging, evaluation, or multi-constraint decisions.

```xml
<task>
Evaluate the options and recommend one path.
</task>

<instructions>
- First analyze the decision criteria internally.
- Then provide a concise reasoning summary.
- End with one recommendation and the top tradeoff.
</instructions>

<success_criteria>
The answer must be decisive, grounded in the given constraints, and clear enough for a stakeholder to act on.
</success_criteria>

<input>
{options and constraints}
</input>
```

## Pattern 6: Role + Domain Expert Prompt

Use only when expert perspective improves the result.

```xml
<role>
You are a B2B SaaS pricing strategist advising a seed-stage founder.
</role>

<task>
Review the pricing page copy and identify the changes most likely to improve conversion quality.
</task>

<context>
{business model, audience, pricing tiers, constraints}
</context>
```

## Pattern 7: Output-Contract Prompt

Use when the output needs exact fields, predictable formatting, or downstream parsing.

```xml
<task>
Extract action items from the meeting notes.
</task>

<output_format>
Return valid JSON only:
{
  "actionItems": [
    {
      "owner": "string",
      "task": "string",
      "deadline": "YYYY-MM-DD or null",
      "dependency": "string or null"
    }
  ]
}
</output_format>

<input>
{meeting notes}
</input>
```

## Pattern 8: Tool / Workflow Prompt

Use when Claude should complete a longer workflow in phases.

```xml
<task>
Create a launch plan from the supplied product brief.
</task>

<workflow>
1. Extract launch assumptions.
2. Identify missing information.
3. Draft the launch plan.
4. Run a final risk check against the constraints.
</workflow>

<stopping_condition>
Stop only after every required section in the output format is complete.
</stopping_condition>
```

## Pattern 9: Safety and Boundary Prompt

Use when the task has high stakes, uncertainty, citations, privacy, compliance, or policy boundaries.

```xml
<instructions>
- Distinguish facts from assumptions.
- State uncertainty clearly.
- Do not invent citations, numbers, laws, policies, or product details.
- When information is missing, list the exact missing context needed.
</instructions>
```

## Pattern 10: Prompt-Improvement / Meta Prompt

Use when the user wants Claude to write or improve a prompt.

```xml
<task>
Improve the prompt for Claude while preserving the user's intent.
</task>

<instructions>
- Infer the intended outcome.
- Add missing context placeholders.
- Separate role, task, context, instructions, output format, and success criteria.
- Do not solve the user's underlying task.
</instructions>

<input>
{original prompt}
</input>
```

## ProPar Claude Output Requirements

When ProPar creates `improvedPrompt` for Claude:

- Prefer XML-style blocks over generic Markdown headings.
- Include only sections that help the user's task.
- Preserve the user's intent and voice.
- Add placeholders like `[target audience]`, `[source material]`, `[deadline]`, or `[preferred format]` when needed.
- Make `whatChanged` mention Claude-specific changes, for example "Converted prompt to XML-structured Claude format", "Separated context from instructions", "Added grounded context-use rules", or "Added exact output contract".
