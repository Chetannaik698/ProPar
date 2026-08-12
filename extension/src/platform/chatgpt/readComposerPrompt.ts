import { chatGptAdapter, CHATGPT_COMPOSER_SELECTORS } from './adapter';

export { CHATGPT_COMPOSER_SELECTORS };

export function readChatGptComposerPrompt(): string {
  return chatGptAdapter.readComposer();
}

export function replaceChatGptComposerPrompt(prompt: string): boolean {
  return chatGptAdapter.replaceComposer(prompt);
}

