import { isProduction } from '../config/env.js';
import { PROPAR_SYSTEM_PROMPT } from '../prompts/propaar.system.js';
import { aiAnalysisSchema, type AiAnalysis } from '../schemas/ai-response.schema.js';
import { AiProviderError, type AiProvider, type AiUsage } from '../providers/ai-provider.types.js';
import type { ClarificationAnswer, PlatformId, PromptAnalysis } from '../types/analysis.types.js';
import { ragPipeline, PromptAugmentor } from '../rag/index.js';

export interface AnalysisResult {
  analysis: PromptAnalysis;
  provider: string;
  model: string;
  usage?: AiUsage;
}

export class AnalysisServiceError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code: string, statusCode = 502, details?: unknown) {
    super(message);
    this.name = 'AnalysisServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class AnalysisService {
  private readonly maxAttempts = 2;

  constructor(private readonly provider: AiProvider) {}

  public async analyze(
    prompt: string,
    platform: PlatformId = 'chatgpt',
    clarificationAnswers: ClarificationAnswer[] = []
  ): Promise<AnalysisResult> {
    const startedAt = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      try {
        console.info('AI analysis request started', {
          provider: this.provider.name,
          model: this.provider.model,
          attempt,
          promptLength: prompt.length,
          platform,
          clarificationAnswerCount: clarificationAnswers.length,
        });

        // 1. RAG Layer: Retrieve relevant knowledge documents based on query context & platform
        const retrievedDocs = await ragPipeline.retrievalService.retrieve({
          prompt,
          platform,
          clarificationAnswers,
        });

        // 2. RAG Layer: Augment system prompt by prepending Relevant Knowledge
        const augmentedSystemPrompt = PromptAugmentor.augmentSystemPrompt(
          PROPAR_SYSTEM_PROMPT,
          retrievedDocs
        );

        const completion = await this.provider.complete({
          messages: [
            { role: 'system', content: augmentedSystemPrompt },
            { role: 'user', content: this.buildUserMessage(prompt, platform, clarificationAnswers) },
          ],
        });

        const aiAnalysis = this.parseAndValidate(completion.content, {
          allowClarification: clarificationAnswers.length === 0,
        });
        const latencyMs = Date.now() - startedAt;

        this.logSuccess(latencyMs, completion.model, completion.usage);

        return {
          analysis: this.toFrontendAnalysis(aiAnalysis),
          provider: this.provider.name,
          model: completion.model,
          ...(completion.usage ? { usage: completion.usage } : {}),
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown analysis error');
        this.logAttemptError(attempt, lastError);

        if (!this.shouldRetry(lastError, attempt)) {
          throw this.toServiceError(lastError);
        }
      }
    }

    throw this.toServiceError(lastError ?? new Error('Unable to validate AI response'));
  }

  private parseAndValidate(
    rawContent: string,
    options: { allowClarification: boolean } = { allowClarification: true }
  ): AiAnalysis {
    console.info('AI response received for parsing', {
      rawLength: rawContent.length,
      preview: rawContent.slice(0, 240),
    });

    const cleanedContent = this.extractJson(rawContent);
    let parsed: unknown;

    try {
      parsed = JSON.parse(cleanedContent);
    } catch (error) {
      console.error('AI response JSON parsing error', {
        errorMessage: error instanceof Error ? error.message : 'Unknown JSON parsing error',
        cleanedLength: cleanedContent.length,
        cleanedPreview: cleanedContent.slice(0, 500),
      });

      throw new AnalysisServiceError(
        'The AI returned malformed JSON. Please try again.',
        'MALFORMED_JSON',
        502,
        {
          cleanedPreview: cleanedContent.slice(0, 500),
          parseError: error instanceof Error ? error.message : 'Unknown JSON parsing error',
        }
      );
    }

    const normalized = this.normalizeParsedAnalysis(parsed, options);
    const result = aiAnalysisSchema.safeParse(normalized);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || '<root>',
        message: issue.message,
        code: issue.code,
      }));

      console.error('AI response schema validation failed', {
        issueCount: issues.length,
        issues,
      });

      throw new AnalysisServiceError(
        `The AI returned an invalid analysis format: ${issues
          .slice(0, 5)
          .map((issue) => `${issue.field}: ${issue.message}`)
          .join('; ')}`,
        'INVALID_AI_RESPONSE',
        502,
        issues
      );
    }

    console.info('AI response parsed and schema validated', {
      missingContextCount: result.data.missingContext.length,
      recommendationCount: result.data.suggestions.length,
      blindSpotCount: result.data.blindSpots.length,
      expertConsiderationCount: result.data.expertConsiderations.length,
      needsClarification: result.data.needsClarification,
      hasImprovedPrompt: result.data.improvedPrompt.length > 0,
    });

    return result.data;
  }

  private normalizeParsedAnalysis(parsed: unknown, options: { allowClarification: boolean }): unknown {
    if (!this.isRecord(parsed)) {
      return parsed;
    }

    const normalized: Record<string, unknown> = {
      ...parsed,
    };

    if (!options.allowClarification && normalized['needsClarification'] === true) {
      normalized['needsClarification'] = false;
      normalized['clarificationQuestions'] = [];
    }

    if (!Array.isArray(normalized['clarificationQuestions'])) {
      return normalized;
    }

    return {
      ...normalized,
      clarificationQuestions: normalized['clarificationQuestions'].slice(0, 1).map((question) => {
        if (!this.isRecord(question)) return question;

        if (question['type'] === 'text') {
          const { options: _options, ...textQuestion } = question;
          return textQuestion;
        }

        if (!Array.isArray(question['options'])) return question;

        return {
          ...question,
          options: question['options'].slice(0, 5),
        };
      }),
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private extractJson(content: string): string {
    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const candidate = jsonBlockMatch?.[1] ? jsonBlockMatch[1].trim() : content.trim();

    const balancedJson =
      this.extractFirstBalancedJsonObject(candidate) ?? this.extractFirstBalancedJsonObject(content);
    if (balancedJson) return balancedJson;

    return candidate;
  }

  private extractFirstBalancedJsonObject(content: string): string | null {
    const start = content.indexOf('{');
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < content.length; index += 1) {
      const char = content[index];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\' && inString) {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === '{') {
        depth += 1;
        continue;
      }

      if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          return content.slice(start, index + 1).trim();
        }
      }
    }

    return null;
  }

  private toFrontendAnalysis(analysis: AiAnalysis): PromptAnalysis {
    return {
      goalDiscovery: analysis.goalDiscovery,
      intent: analysis.intent,
      thinkingGap: analysis.thinkingGap,
      missingContext: analysis.missingContext,
      hiddenAssumptions: analysis.hiddenAssumptions.map((assumption) => ({
        assumption: assumption.assumption,
        risk: assumption.risk,
        detectedBecause: assumption.detectedBecause,
        ...(assumption.challengeQuestion ? { challengeQuestion: assumption.challengeQuestion } : {}),
      })),
      blindSpots: analysis.blindSpots,
      suggestions: analysis.suggestions.map((suggestion) => ({
        recommendation: suggestion.recommendation,
        reason: suggestion.reason,
        consequence: suggestion.consequence,
        ...(suggestion.opportunity ? { opportunity: suggestion.opportunity } : {}),
        expectedBenefit: suggestion.expectedBenefit,
      })),
      expertConsiderations: analysis.expertConsiderations,
      whatChanged: analysis.whatChanged,
      thinkingScore: analysis.thinkingScore,
      estimatedImprovement: `+${analysis.estimatedImprovement}%`,
      improvedPrompt: analysis.improvedPrompt,
      needsClarification: analysis.needsClarification,
      clarificationQuestions: analysis.clarificationQuestions.map((question) => ({
        id: question.id,
        question: question.question,
        reason: question.reason,
        expectedImprovement: question.expectedImprovement,
        informationGain: question.informationGain,
        type: question.type,
        ...(question.options ? { options: question.options } : {}),
      })),
    };
  }

  private buildUserMessage(prompt: string, platform: PlatformId, clarificationAnswers: ClarificationAnswer[]): string {
    const platformInstructions = this.getPlatformInstructions(platform);

    if (clarificationAnswers.length === 0) {
      return [platformInstructions, '', 'User draft:', prompt].join('\n');
    }

    const answers = clarificationAnswers
      .map((item) => `- ${item.questionId}: ${item.answer}`)
      .join('\n');

    return [
      'Original prompt:',
      prompt,
      '',
      platformInstructions,
      '',
      'Clarification answers supplied by the user:',
      answers,
      '',
      'Use these answers to generate the final improved prompt. Do not ask more questions. Set needsClarification to false and clarificationQuestions to an empty array. If any detail is still missing, use a clear placeholder in improvedPrompt.',
    ].join('\n');
  }

  private getPlatformInstructions(platform: PlatformId): string {
    if (platform === 'gmail') {
      return [
        'Platform adapter: Gmail.',
        'Use the exact ProPar Thinking Framework sections and JSON shape, but adapt every analysis field to email communication rather than AI prompt writing.',
        'Goal Discovery must infer the most relevant goals from email communication context.',
        'The improvedPrompt field MUST be the final formatted email, not a prompt. It must contain the following parts separated by clear delimiters so the frontend can parse them:',
        '[SUBJECT] <subject line>',
        '[GREETING] <greeting>',
        '[BODY] <email body paragraphs>',
        '[CLOSING] <closing phrase>',
        '[SIGNATURE] <signature placeholder>',
        'Ensure you generate a high-quality email with all these parts. Do not include any other commentary in the improvedPrompt field.',
      ].join('\n');
    }

    if (platform === 'linkedin') {
      return [
        'Platform adapter: LinkedIn.',
        'Use the exact ProPaar Thinking Framework sections and JSON shape, but adapt every analysis field to professional LinkedIn communication rather than AI prompt writing.',
        'Goal Discovery must infer the most relevant goals from: Career Growth, Personal Branding, Networking, Thought Leadership, Hiring, Product Promotion, Company Announcement, Community Engagement, and Recruitment. Explain why each selected goal was inferred.',
        'Expert Thinking must choose only relevant LinkedIn specialists such as LinkedIn Growth Expert, Recruiter, Startup Founder, Marketing Strategist, Personal Branding Coach, HR Manager, B2B Sales Expert, and Content Strategist. Each expert must provide standsOut as Observation, plus concern and opportunity.',
        'Blind Spots must rank communication issues such as weak opening, no story, no emotion, no credibility, no measurable outcome, no engagement trigger, no CTA, no audience focus, weak structure, jargon, generic language, and poor readability.',
        'Challenge weak communication constructively. Examples: achievements without impact, no reason to engage, or an opening that does not make people continue reading.',
        'Recommendations must improve hook, storytelling, credibility, authority, readability, professionalism, engagement, call to action, content structure, and authenticity.',
        'whatChanged should describe improvements such as Improved Hook, Added Story, Improved Readability, Added CTA, Improved Flow, Added Credibility, and Strengthened Personal Branding.',
        'The improvedPrompt field must be a polished LinkedIn post, not a prompt. It should feel authentic, professional, engaging, human, and aligned with the user voice. Improve the draft without replacing the user style. Avoid sounding AI-generated.',
      ].join('\n');
    }

    if (platform === 'claude') {
      return [
        'Platform adapter: Claude (Anthropic Prompt Engineering Standard).',
        'Use the exact ProPaar Thinking Framework sections and JSON shape, but adapt every analysis field to a polished Claude-ready prompt.',
        'The final improvedPrompt must be professional Markdown/plain text, not XML. Use clear headings such as Objective, Context, Requirements, Output Format, and Success Criteria.',
        'Do not use wrapper tags like <task>, <constraints>, <output_format>, <instructions>, <context>, or <role> unless the user explicitly asks for XML/HTML as the final deliverable.',
        'Goal Discovery must infer the user intent, task type, audience, context needs, expected answer style, and failure mode that would matter when the prompt is sent to Claude.',
        'For simple requests, keep the final prompt simple and readable. For complex requests, add only the sections needed to make the request complete.',
        'Do not output generic unfilled bracket placeholders like "[Insert primary task...]" or "[Provide background...]". Fill in the actual specific details from the user prompt.',
        'For whatChanged, describe user-facing improvements such as clarified objective, added constraints, tightened output format, removed ambiguity, or improved success criteria. Do not mention XML conversion or prompt pattern names.',
      ].join('\n');
    }

    return [
      'Platform adapter: ChatGPT (OpenAI Prompt Engineering Standard).',
      'Use OpenAI Official Interaction & Prompt Engineering Guidelines to analyze and improve this prompt:',
      '1. Pattern & Model Family Recommendation:',
      '   - Classify whether the prompt is intended for a Reasoning Model (o-series: o1, o3, o4-mini) or a GPT Model (GPT-4.1, GPT-5).',
      '   - Select the canonical OpenAI Prompt Pattern (Pattern 1: Structured Developer Message, Pattern 2: Instruction-then-Delimited-Content, Pattern 3: Format-by-Example, Pattern 5: RAG Context, Pattern 6: High-Level Goal Prompt, Pattern 7: Explicit Precise-Instruction, Pattern 8: Agentic Persistence, Pattern 10: Meta-Prompt, Pattern 11: Classification).',
      '2. improvedPrompt Formatting:',
      '   - For Reasoning models: Structure with "Goal:", "Constraints:", and "Success criteria:". Omit "think step by step" or process micromanagement. If Markdown is needed, include "Formatting re-enabled" on line 1.',
      '   - For GPT models: Structure with professional Markdown/plain-text headings. Use triple quotes (""") for large pasted content only when a delimiter is genuinely needed.',
      '   - Do not use XML-style wrapper tags such as <task>, <constraints>, <output_format>, <instructions>, <context>, or <role> unless the user explicitly asks for XML/HTML.',
      '   - Eliminate subjective length words ("short", "brief") with concrete numbers ("3 to 5 sentences", "under 150 words").',
      '   - Pair prohibitions with positive alternative actions ("Refrain from X; do Y instead").',
      '3. whatChanged Array:',
      '   - Use user-facing change descriptions, e.g. "Clarified the objective", "Added measurable constraints", "Specified the expected deliverable", "Improved the output format". Do not mention internal prompt pattern names or XML.',
    ].join('\n');
  }

  private shouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= this.maxAttempts) return false;

    if (error instanceof AnalysisServiceError) {
      return error.code === 'MALFORMED_JSON' || error.code === 'INVALID_AI_RESPONSE';
    }

    return false;
  }

  private toServiceError(error: Error): AnalysisServiceError {
    if (error instanceof AnalysisServiceError) return error;

    if (error instanceof AiProviderError) {
      return new AnalysisServiceError(error.message, error.code, error.statusCode);
    }

    return new AnalysisServiceError(
      'Unable to analyze the prompt right now. Please try again.',
      'ANALYSIS_FAILED',
      500
    );
  }

  private logSuccess(latencyMs: number, model: string, usage: AiUsage | undefined): void {
    console.info('AI analysis completed', {
      provider: this.provider.name,
      model,
      latencyMs,
      tokenUsage: usage ?? null,
    });
  }

  private logAttemptError(attempt: number, error: Error): void {
    const details = {
      provider: this.provider.name,
      model: this.provider.model,
      attempt,
      errorName: error.name,
      errorMessage: error.message,
      errorCode:
        error instanceof AnalysisServiceError || error instanceof AiProviderError ? error.code : undefined,
      statusCode:
        error instanceof AnalysisServiceError || error instanceof AiProviderError
          ? error.statusCode
          : undefined,
      details: error instanceof AnalysisServiceError ? error.details ?? null : null,
    };

    if (isProduction) {
      console.error('AI analysis attempt failed', details);
      return;
    }

    console.error('AI analysis attempt failed', details);
  }
}
