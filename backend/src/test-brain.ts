import { AnalysisService } from './services/analysis.service.js';
import { createAiProvider } from './providers/factory.js';
import type { HistoryItem, ClarificationAnswer } from './types/analysis.types.js';

interface TestCase {
  name: string;
  input: string;
  history: HistoryItem[];
  clarificationAnswers: ClarificationAnswer[];
}

async function runTests() {
  console.log('====================================================');
  console.log('PROPAR CORE BRAIN — TEST RUNNER FOR 6 TEST CASES');
  console.log('====================================================\n');

  const provider = createAiProvider();
  console.log(`Using AI Provider: ${provider.name} (${provider.model})\n`);
  const service = new AnalysisService(provider);

  const testCases: TestCase[] = [
    {
      name: 'USER TEST 1: Highly Ambiguous Startup Request',
      input: 'i want startt starup',
      history: [],
      clarificationAnswers: [],
    },
    {
      name: 'USER TEST 2: Clear Technical Explanation Request',
      input: 'Explain React hooks',
      history: [],
      clarificationAnswers: [],
    },
    {
      name: 'USER TEST 3: Specific SaaS Restaurant Startup Request',
      input: 'I want to start a SaaS startup for small restaurants to manage online orders.',
      history: [],
      clarificationAnswers: [],
    },
  ];

  for (const tc of testCases) {
    console.log(`----------------------------------------------------`);
    console.log(`RUNNING ${tc.name}`);
    console.log(`Input: "${tc.input}"`);
    if (tc.history.length > 0) {
      console.log(`History count: ${tc.history.length}`);
    }
    console.log(`----------------------------------------------------`);

    try {
      const result = await service.analyze(tc.input, 'chatgpt', tc.clarificationAnswers, tc.history);
      console.log(`SUCCESS!`);
      console.log(`Intent: "${result.analysis.intent}"`);
      console.log(`Needs Clarification: ${result.analysis.needsClarification}`);
      console.log(`Clarification Questions Count: ${result.analysis.clarificationQuestions.length}`);
      if (result.analysis.clarificationQuestions.length > 0) {
        result.analysis.clarificationQuestions.forEach((q, idx) => {
          console.log(`  Q${idx + 1}: ${q.question}`);
        });
      }
      console.log(`Improved Prompt Preview (first 250 chars):\n"${result.analysis.improvedPrompt.slice(0, 250)}..."\n`);
    } catch (err) {
      console.error(`FAILED ${tc.name}:`, err);
    }
    await new Promise((r) => setTimeout(r, 15000));
  }
}

runTests().catch(console.error);
