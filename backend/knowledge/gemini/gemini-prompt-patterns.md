---
title: Google Gemini 3 Prompt Patterns & Templates
platform: gemini
category: prompt-patterns
tags: [gemini, google, prompt-patterns, xml-tags, markdown, reasoning, gems, agentic]
---

# Google Gemini 3 Prompt Patterns & Templates

Official prompt design patterns and templates for Google Gemini 3 models based on Google AI for Developers guidance.

## Pattern Selection Matrix

| If you need... | Use pattern |
|---|---|
| A clearly delimited, general-purpose prompt | Pattern 1 or 2 |
| A full production system + user prompt pair | Pattern 3 |
| To force a specific output structure | Pattern 4 |
| To teach format or judgment via demonstration | Pattern 5 |
| Answers strictly from supplied material | Pattern 6 or 7 |
| To prompt over large documents/codebases | Pattern 8 |
| A reusable, saved task-specific persona | Pattern 9 |
| A careful, high-stakes autonomous agent | Pattern 10 |
| To fix an answer that's right but wrongly shaped | Pattern 11 |

---

## Pattern 1 — The XML-Tagged Prompt (Gemini 3 Official Template)

Use when: maximum clarity is needed between persona, rules, reference data, and the actual ask. Google's documented default for Gemini 3.

```xml
<role>
You are a helpful assistant.
</role>

<constraints>
1. Be objective.
2. Cite sources.
</constraints>

<context>
[Insert User Input Here - The model knows this is data, not instructions]
</context>

<task>
[Insert the specific user request here]
</task>
```

---

## Pattern 2 — The Markdown-Headed Prompt (Gemini 3 Official Template)

Use when: Markdown readability is preferred over XML tags. Functionally equivalent to Pattern 1; pick one delimiter convention and stay consistent.

```markdown
# Identity
You are a senior solution architect.

# Constraints
- No external libraries allowed.
- Python 3.11+ syntax only.

# Output format
Return a single code block.
```

---

## Pattern 3 — Full System + User Template (Official Combined Example)

Use when: building a reusable, production-grade prompt template that separates durable behavior (system instruction) from per-request data and task (user prompt).

**System Instruction:**
```xml
<role>
You are Gemini 3, a specialized assistant for [Insert Domain, e.g., Data Science].
You are precise, analytical, and persistent.
</role>

<instructions>
1. Plan: Analyze the task and create a step-by-step plan.
2. Execute: Carry out the plan.
3. Validate: Review your output against the user's task.
4. Format: Present the final answer in the requested structure.
</instructions>

<constraints>
- Verbosity: [Specify Low/Medium/High]
- Tone: [Specify Formal/Casual/Technical]
</constraints>

<output_format>
Structure your response as follows:
1. Executive Summary: [Short overview]
2. Detailed Response: [The main content]
</output_format>
```

**User Prompt:**
```xml
<context>
[Insert relevant documents, code snippets, or background info here]
</context>

<task>
[Insert specific user request here]
</task>

<final_instruction>
Remember to think step-by-step before answering.
</final_instruction>
```

---

## Pattern 4 — Completion / Seeded-Format Prompt

Use when: prose descriptions of format are not reliably producing the exact structure desired — seed the start of the output pattern and let the model continue it ("autocomplete" technique).

```text
{Task instruction}
{Literal start of the desired output structure}

Example:
Create an outline for an essay about hummingbirds.
I. Introduction
 *
```

---

## Pattern 5 — Few-Shot with Format Enforcement

Use when: consistent formatting or judgment steering is required. Keep every example formatted identically.

```text
{Task instruction}

{Example input 1}
Output: {example output 1}

{Example input 2}
Output: {example output 2}

{Real input}
Output:
```

---

## Pattern 6 — Grounded Context-Constrained Prompt

Use when: answers must come strictly from supplied reference material rather than blending in outside general training knowledge.

```text
Answer the question using the text below. Respond with only the text provided.

Question: {question}

Text: {reference material}
```

---

## Pattern 7 — Strict Grounding System Instruction (Gemini 3 Flash)

Use when: hallucination risk must be minimized and any information gaps must be surfaced explicitly.

```text
You are a strictly grounded assistant limited to the information provided in the User Context. Rely only on facts directly mentioned in that context. Do not access or utilize your own knowledge or common sense. Do not assume or infer beyond the provided facts. If the exact answer is not explicitly written in the context, state that the information is not available.
```

---

## Pattern 8 — Long-Context Prompt (Context-First, Query-Last)

Use when: working with large reference material (documents, codebases). Deliberately places context first and query last, anchored with a transition phrase.

```text
{All context: documents, code, data — supplied in full}

Based on the information above, {specific instruction or question}.
```

---

## Pattern 9 — Gem Persona Template (Four Pillars)

Use when: building a reusable, saved assistant persona (a Gem) for a recurring task.

```text
Persona: {who this assistant is and how it should behave}
Task: {what it should do or create}
Context: {tone, scope limits, conversational continuity rules}
Format: {how responses should be structured, including any clarifying questions to ask first}
```

---

## Pattern 10 — Agentic Planning System Instruction

Use when: building long-running or high-stakes agents that must reason carefully before acting, handle ambiguity, and persist appropriately on multi-step tasks.

```text
You are a very strong reasoner and planner.

Before taking any action, reason about:
1. Logical dependencies and constraints (policy rules, prerequisites, order of operations, explicit user constraints).
2. Risk assessment (consequences of the action; distinguish low-risk reads from high-risk writes).
3. Abductive reasoning (identify the most likely cause of any problem, without discarding less-likely hypotheses prematurely).
4. Outcome evaluation and adaptability (update the plan if new observations contradict assumptions).
5. Information availability (use all available tools, policies, and conversation history before asking the user).
6. Precision and grounding (quote exact applicable information when referring to it).
7. Completeness (exhaustively incorporate all requirements before concluding).
8. Persistence and patience (retry on transient errors up to an explicit limit; change strategy — don't repeat — on other errors).

Only take an action after this reasoning is complete.
```

---

## Pattern 11 — Analogous-Task Reframe

Use when: direct instruction isn't constraining the model's output format well — reframe as an analogous, more structurally constrained task.

```text
Multiple choice problem: Which of the following options describes {item}?
Options:
{option 1}
{option 2}
{option 3}
```
