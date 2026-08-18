import { ProParMark } from './ProParMark';
import type { ReactNode } from 'react';
import type { ActivePlatformAdapter } from '../../../platform/adapters/types';

interface AnalysisShellProps {
  isDark?: boolean;
  onClose: () => void;
  children: ReactNode;
  platform: ActivePlatformAdapter;
}

export function AnalysisShell({ isDark = false, onClose, children, platform }: AnalysisShellProps) {
  const title = platform.id === 'linkedin' ? 'Communication Review' : 'Think before you send.';
  const eyebrow = platform.id === 'linkedin' ? 'ProPaar Coach' : 'ProPaar';

  return (
    <aside className="analysis-shell" aria-label={`ProPaar ${platform.platformName} ${title}`} role="dialog">
      <header className="analysis-shell-header">
        <div className="analysis-shell-title-group">
          <ProParMark className="h-6 w-6 shrink-0" isDark={isDark} />
          <div>
            <p className="analysis-shell-eyebrow">{eyebrow}</p>
            <h1 className="analysis-shell-title">{title}</h1>
          </div>
        </div>

        <button className="icon-button" onClick={onClose} aria-label="Close ProPaar">
          <span aria-hidden="true">&times;</span>
        </button>
      </header>
      <div className="analysis-shell-body">{children}</div>
    </aside>
  );
}