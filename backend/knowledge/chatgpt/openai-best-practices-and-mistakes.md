---
title: OpenAI Best Practices & Common Mistakes Reference
platform: chatgpt
category: prompt-engineering
tags: [openai, best-practices, common-mistakes, checklist, prompt-cache, constraints]
---

# OpenAI Best Practices & Common Mistakes Reference

## 12 Core Best Practices

1. **Choose the right model family**: Reasoning models (o-series) for ambiguity & planning; GPT models for fast, well-defined execution.
2. **Structure prompt deliberately**: Follow `# Identity` -> `# Instructions` -> `# Examples` -> `# Context`.
3. **Be explicit, not implicit**: Lead with instruction; replace subjective words with concrete numbers; pair negative rules with positive alternatives.
4. **Use message-role hierarchy**: Developer messages carry standing rules/business logic; User messages carry per-turn request/data.
5. **Escalate technique only as needed**: Zero-shot -> Few-shot -> Fine-tuning.
6. **Manage prompts like code**: Keep prompt builders modular and typed; version and test prompts.
7. **Pin models and build evals**: Pin production prompt tests to specific dated snapshots.
8. **Use retrieval/context deliberately**: Use RAG to bring in proprietary context; delimit context with XML tags; keep durable context first for prompt caching.
9. **Match prompting style to model family**: Goals & success criteria for reasoning; explicit step-by-step logic for GPT.
10. **Use meta-prompting to bootstrap & refine**: Leverage meta-prompts (Pattern 10) to draft system prompts.
11. **Task-specific GPT-5 series guidance**: Coding agents require explicit testing/validation rules and tool examples.
12. **Personalization discipline**: Custom Instructions for stable preferences; Memory for recurring facts that naturally emerge; Projects/GPTs for domain scope.

---

## 16 Documented Common Mistakes

### Instruction Mistakes
1. **Context before instruction without separator**: Pasting content first forces the model to hold intent in suspense. Fix: Instruction first, delimited by `"""` or XML tags.
2. **Vague, subjective wording**: Words like "short", "a few", "fairly brief". Fix: Replace with concrete numbers ("3 to 5 sentences", "under 100 words").
3. **Negative-only prohibitions**: Telling model what NOT to do without alternative. Fix: State positive redirection ("Do X instead").
4. **Describing format in prose**: Describing format instead of showing it. Fix: Provide a literal template (Pattern 3).

### Context & Scale Mistakes
5. **Assuming unlimited context**: Exceeding model context window degrades output. Fix: Retrieve and rank relevant context.
6. **Not separating stable from per-request content**: Interleaving instructions with volatile data breaks prompt caching. Fix: Put identity & instructions first, variable context last.

### Few-Shot Mistakes
7. **Jumping straight to fine-tuning/heavy few-shot**: Skipping zero-shot testing.
8. **Examples contradicting instructions**: Inconsistent examples confuse the model.
9. **Non-diverse examples**: Near-identical examples over-fit the prompt pattern.

### Reasoning-Model Mistakes
10. **Chain-of-thought prompting on reasoning models**: Using "think step-by-step" on o-series models degrades performance.
11. **Micromanaging process instead of goal**: Specifying internal steps instead of end goal and success criteria.
12. **Expecting Markdown by default**: Forgetting `Formatting re-enabled` on line 1 for reasoning models.

### Model / Version Mistakes
13. **Not pinning model snapshots**: Floating model names can drift in production.
14. **Using outdated models**: Sticking with old snapshots adds unnecessary workaround overhead.

### Personalization Mistakes
15. **Saving one-off details into Memory**: Cluttering memory with temporary facts.
16. **Confusing Custom Instructions with Memory**: Custom instructions are global/explicit; Memory is automatic/accumulated.
