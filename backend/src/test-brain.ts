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
      name: 'TEST CASE 1: Open-ended Portfolio Plan',
      input: 'Provide a comprehensive plan and actionable guidance for preparing a portfolio website.',
      history: [],
      clarificationAnswers: [],
    },
    {
      name: 'TEST CASE 2: Specific Developer Portfolio Context',
      input: 'I am a BCA graduate. I know React, Node.js, MongoDB and Express. I want a portfolio to get a software developer job. I have 6 projects.',
      history: [],
      clarificationAnswers: [],
    },
    {
      name: 'TEST CASE 3: Underspecified Gym Website Build',
      input: 'Build a website for my gym.',
      history: [],
      clarificationAnswers: [],
    },
    {
      name: 'TEST CASE 4: Clear Technical Question',
      input: 'Explain React hooks.',
      history: [],
      clarificationAnswers: [],
    },
    {
      name: 'TEST CASE 5: High Ambiguity Request',
      input: 'Make my portfolio better.',
      history: [],
      clarificationAnswers: [],
    },
    {
      name: 'TEST CASE 6: Multi-turn Follow-up Context Preservation',
      input: 'The gym is located in Austin, TX. The main goal is driving new membership signups.',
      history: [
        { role: 'user', content: 'Build a website for my gym.' },
        { role: 'assistant', content: 'Before building, I need key decisions on primary goal and location.' },
      ],
      clarificationAnswers: [
        { questionId: 'gym_goal', answer: 'Driving new membership signups' },
        { questionId: 'gym_location', answer: 'Austin, TX' },
      ],
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
