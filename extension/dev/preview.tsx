import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUp, Mic } from 'lucide-react';
import { AnalysisCard } from '../src/features/prompt-analysis/components/AnalysisCard';
import { FloatingLauncher } from '../src/features/prompt-analysis/components/FloatingLauncher';
import { chatGptAdapter } from '../src/platform/chatgpt/adapter';
import '../src/styles/index.css';

export function Preview() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas p-8 font-sans text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-end justify-center">
        <div className="relative mb-10 w-full max-w-3xl rounded-[28px] border border-line bg-white p-4 shadow-sm">
          <p className="m-0 min-h-20 text-sm leading-6 text-zinc-700">Build me a gym website</p>
          <div className="flex items-center justify-end gap-1">
            <button aria-label="Voice input" className="flex h-9 w-9 items-center justify-center rounded-xl bg-transparent" type="button">
              <Mic className="h-5 w-5" />
            </button>
            <div className="relative h-9 w-9">
              <FloatingLauncher isOpen={isOpen} onClick={() => setIsOpen((open) => !open)} />
              {isOpen && (
                <div className="absolute bottom-[calc(100%+8px)] right-0 w-[min(340px,calc(100vw-24px))]">
                  <AnalysisCard onClose={() => setIsOpen(false)} platform={chatGptAdapter} />
                </div>
              )}
            </div>
            <button aria-label="Send prompt" className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white" type="button">
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
