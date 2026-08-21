import { PROPAR_SYSTEM_PROMPT } from '../prompts/propaar.system.js';
import { BRAIN_SYSTEM_PROMPT } from '../prompts/brain.system.js';
import { brainDecisionSchema, type BrainDecision } from '../schemas/brain-decision.schema.js';
import { aiAnalysisSchema, type AiAnalysis } from '../schemas/ai-response.schema.js';
import { AiProviderError, type AiProvider, type AiUsage } from '../providers/ai-provider.types.js';
import type { ClarificationAnswer, HistoryItem, PlatformId, PromptAnalysis } from '../types/analysis.types.js';
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
    clarificationAnswers: ClarificationAnswer[] = [],
    history: HistoryItem[] = []
  ): Promise<AnalysisResult> {
    const startedAt = Date.now();
    let lastError: Error | null = null;

    // Step 1: ProPar Core Brain Decision Pipeline (Stage 1)
    let brainDecision: BrainDecision;
    try {
      brainDecision = await this.executeBrain(prompt, platform, clarificationAnswers, history);
    } catch {
      brainDecision = this.createFallbackBrainDecision(prompt, clarificationAnswers, history);
    }

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      try {
        console.info('Analysis request started', {
          provider: this.provider.name,
          model: this.provider.model,
          attempt,
          promptLength: prompt.length,
          platform,
          clarificationAnswerCount: clarificationAnswers.length,
          historyCount: history.length,
        });

        // Step 2: RAG Layer - Retrieve relevant knowledge documents
        const retrievedDocs = await ragPipeline.retrievalService.retrieve({
          prompt,
          platform,
          clarificationAnswers,
        });

        // Step 3: Response Generation using Brain Decision (Stage 2)
        const augmentedSystemPrompt = PromptAugmentor.augmentSystemPrompt(
          PROPAR_SYSTEM_PROMPT,
          retrievedDocs
        );

        const completion = await this.provider.complete({
          messages: [
            { role: 'system', content: augmentedSystemPrompt },
            {
              role: 'user',
              content: this.buildStage2UserMessage(prompt, platform, clarificationAnswers, history, brainDecision),
            },
          ],
        });

        const aiAnalysis = this.parseAndValidate(completion.content, {
          brainDecision,
          allowClarification: brainDecision.decision === 'clarify' && clarificationAnswers.length === 0,
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
          break;
        }
      }
    }

    console.warn('[AnalysisService] All AI provider attempts failed or hit rate limits. Executing graceful local fallback analysis.');
    const fallbackAnalysis = this.createFallbackAnalysis(prompt, platform, brainDecision, clarificationAnswers);
    return {
      analysis: this.toFrontendAnalysis(fallbackAnalysis),
      provider: 'propar-local-brain',
      model: 'local-heuristic-v1',
    };
  }

  private async executeBrain(
    prompt: string,
    platform: PlatformId,
    clarificationAnswers: ClarificationAnswer[],
    history: HistoryItem[]
  ): Promise<BrainDecision> {
    const userMessageContent = this.buildBrainUserMessage(prompt, platform, clarificationAnswers, history);

    try {
      const completion = await this.provider.complete({
        messages: [
          { role: 'system', content: BRAIN_SYSTEM_PROMPT },
          { role: 'user', content: userMessageContent },
        ],
      });

      const cleaned = this.extractJson(completion.content);
      const parsed = JSON.parse(cleaned);
      const decision = brainDecisionSchema.parse(parsed);

      console.info('[ProPar Core Brain] Internal Brain Decision Executed', {
        intent: decision.intent,
        goal: decision.goal,
        knownContext: decision.knownContext,
        missingContext: decision.missingContext,
        ambiguities: decision.ambiguities,
        assumptions: decision.assumptions,
        decision: decision.decision,
        priorityQuestions: decision.priorityQuestions,
        reasoningGuidance: decision.reasoningGuidance,
      });

      return decision;
    } catch (error) {
      console.warn('[ProPar Core Brain] Stage 1 execution failed or unparseable, generating fallback decision', error);
      return this.createFallbackBrainDecision(prompt, clarificationAnswers, history);
    }
  }

  private createFallbackBrainDecision(
    prompt: string,
    clarificationAnswers: ClarificationAnswer[],
    history: HistoryItem[]
  ): BrainDecision {
    const lowerPrompt = prompt.toLowerCase().trim();
    const hasHistory = history.length > 0 || clarificationAnswers.length > 0;

    // Check for extreme ambiguity
    if (lowerPrompt === 'make my portfolio better' || (lowerPrompt.length < 15 && !hasHistory)) {
      return {
        intent: 'Improve existing portfolio',
        goal: 'Enhance portfolio quality and effectiveness',
        knownContext: hasHistory ? ['Prior conversation history available'] : [],
        missingContext: ['Portfolio URL/content', 'Primary focus area (design vs content vs recruiter optimization)'],
        ambiguities: ['Current portfolio state is unspecified'],
        assumptions: [],
        decision: 'clarify',
        priorityQuestions: [
          {
            id: 'portfolio_focus',
            question: 'What aspect of your portfolio would you like to improve most?',
            reason: 'Tailors the feedback to your immediate priority.',
            type: 'multiple-choice',
            options: ['Recruiter / HR optimization', 'Visual design & layout', 'Project descriptions & impact', 'SEO & traffic'],
          },
          {
            id: 'portfolio_link',
            question: 'Do you have a portfolio link or draft content you can share?',
            reason: 'Allows specific, actionable feedback rather than general guidelines.',
            type: 'text',
          },
        ],
        reasoningGuidance: 'Ask target questions to narrow down the focus.',
      };
    }

    // Default to answer_with_assumptions if detailed enough
    return {
      intent: 'Comprehensive request guidance',
      goal: 'Provide immediate actionable plan with clear assumptions',
      knownContext: [prompt],
      missingContext: ['Unstated specific preferences'],
      ambiguities: [],
      assumptions: ['Standard production best-practices apply'],
      decision: 'answer_with_assumptions',
      priorityQuestions: [],
      reasoningGuidance: 'State explicit assumptions first, then provide a comprehensive step-by-step plan.',
    };
  }

  private createFallbackAnalysis(
    prompt: string,
    _platform: PlatformId,
    brainDecision: BrainDecision,
    clarificationAnswers: ClarificationAnswer[]
  ): AiAnalysis {
    const isClarify = brainDecision.decision === 'clarify' && clarificationAnswers.length === 0;
    const defaultGoal = {
      value: brainDecision.goal || `Execute strategic request: ${prompt}`,
      inferredBecause: 'Inferred from user draft request.',
    };

    const goalDiscovery = {
      primaryGoal: defaultGoal,
      secondaryGoal: {
        value: 'Ensure actionable, production-ready deliverables',
        inferredBecause: 'Core ProPar performance objective.',
      },
      hiddenMotivation: {
        value: 'Save iteration time and maximize output precision',
        inferredBecause: 'Typical user expectation for prompt engineering.',
      },
      expectedSuccess: {
        value: 'Clear, structured execution roadmap with zero ambiguity',
        inferredBecause: 'Standard criteria for success.',
      },
      possibleFailure: {
        value: 'Vague AI response due to unstated constraints',
        inferredBecause: 'Common pitfall in unrefined prompts.',
      },
    };

    if (isClarify && brainDecision.priorityQuestions.length > 0) {
      return {
        intent: brainDecision.intent || 'Clarify core objective',
        thinkingGap: 'High ambiguity in initial request. Key context required to provide custom strategy.',
        goalDiscovery,
        missingContext: brainDecision.missingContext.map((mc) => ({
          item: mc,
          whyItMatters: 'Directly shapes the tailored strategy and deliverables',
          expectedImpact: 'Improves response relevance by +40%',
        })),
        hiddenAssumptions: [
          {
            assumption: 'Standard best-practice defaults apply unless specified otherwise',
            risk: 'Output may not perfectly match unique preferences',
            detectedBecause: 'Initial request lacked specific domain constraints',
          },
        ],
        blindSpots: brainDecision.missingContext.map((mc, idx) => ({
          impactRank: idx + 1,
          riskArea: 'Scope Definition',
          blindSpot: mc,
          consequence: 'May lead to generic AI responses if left unaddressed',
        })),
        suggestions: [
          {
            recommendation: 'Provide High-Impact Context',
            reason: 'Answering key questions enables tailored actionable guidance',
            consequence: 'Generates customized, production-ready prompts',
            expectedBenefit: '+40% prompt quality and alignment',
          },
        ],
        expertConsiderations: [
          {
            expert: 'Strategic Lead',
            standsOut: 'Underspecified request needs quick alignment',
            concern: 'Vague expectations',
            opportunity: 'Answer quick questions to unblock custom strategy',
          },
        ],
        whatChanged: ['Identified key ambiguous decisions', 'Structured clarification questions'],
        thinkingScore: 78,
        estimatedImprovement: 35,
        improvedPrompt: `I need strategic guidance for: "${prompt}". Please help me clarify my goals.`,
        needsClarification: true,
        clarificationQuestions: brainDecision.priorityQuestions.slice(0, 3).map((pq, idx) => ({
          id: pq.id || `q_${idx}`,
          question: pq.question,
          reason: pq.reason,
          expectedImprovement: '+25% specificity',
          informationGain: 'High context clarity',
          type: pq.type === 'multiple-choice' ? 'multiple-choice' : 'text',
          ...(pq.options && pq.type === 'multiple-choice' && pq.options.length >= 2 ? { options: pq.options } : {}),
        })),
      };
    }

    const assumptionBlock = brainDecision.assumptions.length > 0
      ? `**Assumptions:**\n${brainDecision.assumptions.map((a) => `- ${a}`).join('\n')}\n\n`
      : '';

    return {
      intent: brainDecision.intent || `Provide guidance for: ${prompt}`,
      thinkingGap: 'Evaluated core intent and formulated comprehensive structured prompt strategy.',
      goalDiscovery,
      missingContext: brainDecision.missingContext.map((mc) => ({
        item: mc,
        whyItMatters: 'Enables fine-tuning in subsequent steps',
        expectedImpact: 'Adds explicit operational boundaries',
      })),
      hiddenAssumptions: brainDecision.assumptions.map((a) => ({
        assumption: a,
        risk: 'May require minor adjustment if your preferences differ',
        detectedBecause: 'Default assumption applied for missing explicit parameters',
      })),
      blindSpots: brainDecision.missingContext.map((mc, idx) => ({
        impactRank: idx + 1,
        riskArea: 'Execution Parameters',
        blindSpot: mc,
        consequence: 'Can be specified during execution to further refine output quality',
      })),
      suggestions: [
        {
          recommendation: 'Adopt Structured Execution Plan',
          reason: 'Provides AI model clear boundaries and step-by-step deliverables',
          consequence: 'Prevents vague AI outputs and saves iteration time',
          expectedBenefit: '+50% response precision',
        },
      ],
      expertConsiderations: [
        {
          expert: 'Prompt Engineer',
          standsOut: 'Structured section headers enforce model focus',
          concern: 'Lacks domain-specific constraints',
          opportunity: 'Use explicit assumptions as baseline for execution',
        },
      ],
      whatChanged: [
        'Applied ProPar Core Brain assumptions',
        'Built production-ready prompt framework',
      ],
      thinkingScore: 88,
      estimatedImprovement: 45,
      improvedPrompt: `${assumptionBlock}## Comprehensive Strategy & Execution Plan for: "${prompt}"\n\n### 1. Primary Goal\nProvide an end-to-end actionable plan for: ${prompt}.\n\n### 2. Core Requirements & Component Breakdown\n- Objective & Target Scope: Define success criteria and key parameters.\n- Step-by-Step Implementation: Detailed technical and operational roadmap.\n- Best Practices & Quality Standards: Industry benchmarks to maintain and pitfalls to avoid.\n\n### 3. Expected Deliverables\n1. Prioritized step-by-step breakdown.\n2. Implementation checklist.\n3. Risk mitigation strategies.\n\nPlease follow this framework to provide a detailed, highly actionable response.`,
      needsClarification: false,
      clarificationQuestions: [],
    };
  }

  private buildBrainUserMessage(
    prompt: string,
    platform: PlatformId,
    clarificationAnswers: ClarificationAnswer[],
    history: HistoryItem[]
  ): string {
    const parts: string[] = [`Platform: ${platform}`, ''];

    if (history.length > 0) {
      parts.push('Prior Conversation History:');
      history.forEach((h) => parts.push(`- ${h.role.toUpperCase()}: ${h.content}`));
      parts.push('');
    }

    if (clarificationAnswers.length > 0) {
      parts.push('Clarification Answers Provided:');
      clarificationAnswers.forEach((a) => parts.push(`- ${a.questionId}: ${a.answer}`));
      parts.push('');
    }

    parts.push('Current User Request:');
    parts.push(prompt);
    parts.push('');
    parts.push('Analyze this input against ProPar Core Brain rules and return your internal JSON decision.');

    return parts.join('\n');
  }

  private buildStage2UserMessage(
    prompt: string,
    platform: PlatformId,
    clarificationAnswers: ClarificationAnswer[],
    history: HistoryItem[],
    brainDecision: BrainDecision
  ): string {
    const platformInstructions = this.getPlatformInstructions(platform);
    const parts: string[] = [platformInstructions, ''];

    if (history.length > 0) {
      parts.push('Conversation History:');
      history.forEach((h) => parts.push(`- ${h.role.toUpperCase()}: ${h.content}`));
      parts.push('');
    }

    if (clarificationAnswers.length > 0) {
      parts.push('Clarification Answers Supplied:');
      clarificationAnswers.forEach((a) => parts.push(`- ${a.questionId}: ${a.answer}`));
      parts.push('');
    }

    parts.push('User Draft Input:');
    parts.push(prompt);
    parts.push('');

    parts.push('INTERNAL BRAIN DECISION FROM PROPAR CORE BRAIN:');
    parts.push(JSON.stringify(brainDecision, null, 2));
    parts.push('');

    parts.push('MANDATORY STAGE 2 GENERATION INSTRUCTIONS:');
    if (brainDecision.decision === 'answer') {
      parts.push('- Directly deliver a complete, detailed, actionable response in improvedPrompt.');
      parts.push('- Set needsClarification to false and clarificationQuestions to [].');
    } else if (brainDecision.decision === 'answer_with_assumptions') {
      parts.push('- In improvedPrompt, start with explicit, clearly labeled assumptions (e.g. "**Assumptions:** ...").');
      parts.push('- Follow with a complete, actionable, structured plan/answer.');
      parts.push('- Conclude improvedPrompt with 2-3 prioritized follow-up questions for the next iteration.');
      parts.push('- Set needsClarification to false and clarificationQuestions to [].');
    } else {
      parts.push('- Set needsClarification to true.');
      parts.push('- Use the exact priorityQuestions from the Brain Decision as clarificationQuestions.');
      parts.push('- Set improvedPrompt to a concise rationale explaining why these specific decisions are needed first.');
    }

    return parts.join('\n');
  }

  private parseAndValidate(
    rawContent: string,
    options: { brainDecision: BrainDecision; allowClarification: boolean }
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

  private normalizeParsedAnalysis(
    parsed: unknown,
    options: { brainDecision: BrainDecision; allowClarification: boolean }
  ): unknown {
    if (!this.isRecord(parsed)) {
      return parsed;
    }

    const normalized: Record<string, unknown> = {
      ...parsed,
    };

    const { decision, priorityQuestions } = options.brainDecision;

    // Enforce compliance with Brain Decision
    if (decision !== 'clarify' || !options.allowClarification) {
      normalized['needsClarification'] = false;
      normalized['clarificationQuestions'] = [];
    } else {
      normalized['needsClarification'] = true;
      if (!Array.isArray(normalized['clarificationQuestions']) || normalized['clarificationQuestions'].length === 0) {
        normalized['clarificationQuestions'] = priorityQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          reason: q.reason,
          expectedImprovement: 'Significantly improves tailored results.',
          informationGain: 'High impact context.',
          type: q.type,
          ...(q.options ? { options: q.options } : {}),
        }));
      }
    }

    if (!Array.isArray(normalized['clarificationQuestions'])) {
      normalized['clarificationQuestions'] = [];
    }

    const clarificationQuestions = (normalized['clarificationQuestions'] as unknown[]).slice(0, 3).map((question, idx) => {
      if (!this.isRecord(question)) {
        return {
          id: `q_${idx + 1}`,
          question: String(question),
          reason: 'To clarify requirement details',
          expectedImprovement: 'Significantly improves tailored results.',
          informationGain: 'High impact context.',
          type: 'text',
        };
      }

      const id = typeof question['id'] === 'string' && question['id'].trim() ? question['id'].trim() : `q_${idx + 1}`;
      const qText = typeof question['question'] === 'string' && question['question'].trim() ? question['question'].trim() : 'Clarification needed';
      const reason = typeof question['reason'] === 'string' && question['reason'].trim() ? question['reason'].trim() : 'To tailor the response';
      const expectedImprovement = typeof question['expectedImprovement'] === 'string' && question['expectedImprovement'].trim() ? question['expectedImprovement'].trim() : 'Significantly improves tailored results.';
      const informationGain = typeof question['informationGain'] === 'string' && question['informationGain'].trim() ? question['informationGain'].trim() : 'High impact context.';
      const type = question['type'] === 'multiple-choice' ? 'multiple-choice' : 'text';

      const base = {
        id,
        question: qText,
        reason,
        expectedImprovement,
        informationGain,
        type,
      };

      if (type === 'multiple-choice' && Array.isArray(question['options']) && question['options'].length >= 2) {
        return {
          ...base,
          options: (question['options'] as string[]).slice(0, 5),
        };
      }

      return base;
    });

    // Normalize missingContext array if strings were returned
    if (Array.isArray(normalized['missingContext'])) {
      normalized['missingContext'] = (normalized['missingContext'] as unknown[]).map((item) => {
        if (typeof item === 'string') {
          return { item, whyItMatters: 'Impacts quality of result.', expectedImpact: 'High' };
        }
        return item;
      });
    }

    // Normalize hiddenAssumptions array if strings were returned
    if (Array.isArray(normalized['hiddenAssumptions'])) {
      normalized['hiddenAssumptions'] = (normalized['hiddenAssumptions'] as unknown[]).map((item) => {
        if (typeof item === 'string') {
          return { assumption: item, risk: 'Potential misalignment', detectedBecause: 'Not specified in draft' };
        }
        return item;
      });
    }

    // Normalize suggestions array if strings were returned
    if (Array.isArray(normalized['suggestions'])) {
      normalized['suggestions'] = (normalized['suggestions'] as unknown[]).map((item) => {
        if (typeof item === 'string') {
          return { recommendation: item, reason: 'Best practice', consequence: 'Improved outcome', expectedBenefit: 'Better clarity' };
        }
        return item;
      });
    }

    return {
      ...normalized,
      clarificationQuestions,
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private extractJson(content: string): string {
    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let candidate = jsonBlockMatch?.[1] ? jsonBlockMatch[1].trim() : content.trim();

    const balancedJson =
      this.extractFirstBalancedJsonObject(candidate) ?? this.extractFirstBalancedJsonObject(content);
    if (balancedJson) candidate = balancedJson;

    return this.sanitizeJsonStringLiterals(candidate);
  }

  private sanitizeJsonStringLiterals(jsonStr: string): string {
    let result = '';
    let inString = false;
    let escaped = false;

    for (let i = 0; i < jsonStr.length; i += 1) {
      const char = jsonStr[i];

      if (escaped) {
        result += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        result += char;
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        result += char;
        continue;
      }

      if (inString) {
        if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          result += '\\r';
        } else if (char === '\t') {
          result += '\\t';
        } else {
          result += char;
        }
      } else {
        result += char;
      }
    }

    return result;
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

  private getPlatformInstructions(platform: PlatformId): string {
    if (platform === 'gmail') {
      return [
        'Platform adapter: Gmail.',
        'Use the exact ProPar Thinking Framework sections and JSON shape, but adapt every analysis field to email communication.',
        'The improvedPrompt field MUST be the final formatted email, containing [SUBJECT], [GREETING], [BODY], [CLOSING], [SIGNATURE].',
      ].join('\n');
    }

    if (platform === 'linkedin') {
      return [
        'Platform adapter: LinkedIn.',
        'Use the exact ProPar Thinking Framework sections and JSON shape, but adapt every analysis field to LinkedIn communication.',
        'The improvedPrompt field must be a polished, engaging LinkedIn post.',
      ].join('\n');
    }

    if (platform === 'claude') {
      return [
        'Platform adapter: Claude.',
        'The final improvedPrompt must be structured, clear, and professional markdown/plain text.',
      ].join('\n');
    }

    return [
      'Platform adapter: ChatGPT.',
      'Use OpenAI Prompt Engineering Standard.',
    ].join('\n');
  }

  private shouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= this.maxAttempts) return false;

    if (error instanceof AnalysisServiceError) {
      return error.code === 'MALFORMED_JSON' || error.code === 'INVALID_AI_RESPONSE';
    }

    return false;
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

    console.error('AI analysis attempt failed', details);
  }
}
