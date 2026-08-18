import { useEffect, useRef, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Analysis } from '../types/analysis';
import {
  BlindSpotsCard,
  ExpertConsiderationsCard,
  GoalDiscoveryCard,
  ImprovedPromptCard,
  MissingContextCard,
  SuggestionCard,
  ThinkingCard,
  WhatChangedCard,
  ThinkingScoreCard,
  MetricCard,
  SuccessToast
} from './ResultCards';
import { formatImprovedPrompt } from '../services/promptFormatter';
import type { ActivePlatformAdapter } from '../../../platform/adapters/types';
import { Clipboard, FilePenLine, CheckCircle2, RotateCw, Check } from 'lucide-react';

interface ResultsViewProps {
  analysis: Analysis;
  onClose: () => void;
  platform: ActivePlatformAdapter;
  isOriginalPromptEmpty?: boolean;
  onRegenerate?: () => void;
}
export type CopyState = 'idle' | 'copied';

function parseGmailEmail(text = '') {
  let subject = '';
  let greeting = '';
  let body = '';
  let closing = '';
  let signature = '';

  const subjectMatch = text.match(/\[SUBJECT\]\s*([\s\S]*?)(?=\[(?:GREETING|BODY|CLOSING|SIGNATURE)\]|$)/i);
  const greetingMatch = text.match(/\[GREETING\]\s*([\s\S]*?)(?=\[(?:SUBJECT|BODY|CLOSING|SIGNATURE)\]|$)/i);
  const bodyMatch = text.match(/\[BODY\]\s*([\s\S]*?)(?=\[(?:SUBJECT|GREETING|CLOSING|SIGNATURE)\]|$)/i);
  const closingMatch = text.match(/\[CLOSING\]\s*([\s\S]*?)(?=\[(?:SUBJECT|GREETING|BODY|SIGNATURE)\]|$)/i);
  const signatureMatch = text.match(/\[SIGNATURE\]\s*([\s\S]*?)(?=\[(?:SUBJECT|GREETING|BODY|CLOSING)\]|$)/i);

  if (subjectMatch) subject = subjectMatch[1].trim();
  if (greetingMatch) greeting = greetingMatch[1].trim();
  if (bodyMatch) body = bodyMatch[1].trim();
  if (closingMatch) closing = closingMatch[1].trim();
  if (signatureMatch) signature = signatureMatch[1].trim();

  if (!subject && !greeting && !body && !closing && !signature) {
    body = text;
  }

  return { subject, greeting, body, closing, signature };
}

export function ResultsView({ analysis, onClose, platform, isOriginalPromptEmpty = false, onRegenerate }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<'output' | 'insights'>('output');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [replaceState, setReplaceState] = useState<'idle' | 'ready' | 'success'>('idle');
  const timers = useRef<number[]>([]);
  const formattedPrompt = formatImprovedPrompt(analysis.improvedPrompt);

  const isGmail = platform.id === 'gmail';
  const parsed = useMemo(() => parseGmailEmail(analysis.improvedPrompt ?? ''), [analysis.improvedPrompt]);

  const [subject, setSubject] = useState('');
  const [greeting, setGreeting] = useState('');
  const [body, setBody] = useState('');
  const [closing, setClosing] = useState('');
  const [signature, setSignature] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isGmail) {
      setSubject(parsed.subject);
      setGreeting(parsed.greeting);
      setBody(parsed.body);
      setClosing(parsed.closing);
      setSignature(parsed.signature);
    }
  }, [parsed, isGmail]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const getFormattedEmailText = () => {
    return `[SUBJECT] ${subject}
[GREETING] ${greeting}
[BODY] ${body}
[CLOSING] ${closing}
[SIGNATURE] ${signature}`;
  };

  const handleCopy = async () => {
    let textToCopy = '';
    if (isGmail) {
      const parts = [];
      if (subject) parts.push(`Subject: ${subject}`);
      if (greeting) parts.push(greeting);
      if (body) parts.push(body);
      if (closing) parts.push(closing);
      if (signature) parts.push(signature);
      textToCopy = parts.join('\n\n');
    } else {
      textToCopy = formattedPrompt.text;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyState('copied');
      timers.current.push(window.setTimeout(() => setCopyState('idle'), 1700));
    } catch {
      setCopyState('idle');
    }
  };

  const handleReplace = () => {
    const textToReplace = isGmail ? getFormattedEmailText() : formattedPrompt.text;
    const didReplace = platform.replaceComposer(textToReplace);
    setReplaceState(didReplace ? 'success' : 'idle');
    if (didReplace) {
      onClose();
    }
  };

  const showMode1EmailUI = isGmail && isOriginalPromptEmpty;

  return (
    <div className="results-view">
      <div className="results-intro">
        <div>
          <p className="results-kicker">Analysis complete</p>
          <h2>{platform.labels.analysisCompleteTitle}</h2>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="segmented-tab-control" role="tablist" aria-label="Analysis results tabs">
        <button
          aria-selected={activeTab === 'output'}
          className={`tab-btn ${activeTab === 'output' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('output')}
          role="tab"
          type="button"
        >
          Final Output
        </button>
        <button
          aria-selected={activeTab === 'insights'}
          className={`tab-btn ${activeTab === 'insights' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('insights')}
          role="tab"
          type="button"
        >
          Review & Insights
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'output' ? (
          <motion.div
            key="output-tab"
            animate={{ opacity: 1, y: 0 }}
            className="tab-pane"
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <WhatChangedCard items={analysis.whatChanged} labels={platform.labels} />

            {isGmail ? (
              <section className="result-card improved-prompt-card">
                <div>
                  <p className="card-label">{platform.labels.finalCardLabel}</p>
                  <p className="card-caption">{platform.labels.finalCardCaption}</p>
                </div>

                <div className="prompt-box">
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Subject</label>
                        <input
                          onChange={(e) => setSubject(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.12)', background: 'transparent', color: 'inherit' }}
                          type="text"
                          value={subject}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Greeting</label>
                        <input
                          onChange={(e) => setGreeting(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.12)', background: 'transparent', color: 'inherit' }}
                          type="text"
                          value={greeting}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Body</label>
                        <textarea
                          onChange={(e) => setBody(e.target.value)}
                          rows={6}
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.12)', background: 'transparent', color: 'inherit', fontFamily: 'inherit' }}
                          value={body}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Closing</label>
                        <input
                          onChange={(e) => setClosing(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.12)', background: 'transparent', color: 'inherit' }}
                          type="text"
                          value={closing}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Signature</label>
                        <input
                          onChange={(e) => setSignature(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.12)', background: 'transparent', color: 'inherit' }}
                          type="text"
                          value={signature}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {subject && <p><strong>Subject:</strong> {subject}</p>}
                      {greeting && <p style={{ margin: 0 }}>{greeting}</p>}
                      {body && <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{body}</p>}
                      {closing && <p style={{ margin: 0 }}>{closing}</p>}
                      {signature && <p style={{ margin: 0 }}><em>{signature}</em></p>}
                    </div>
                  )}
                </div>

                <div className="prompt-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  <button
                    className={copyState === 'copied' ? 'secondary-action action-success' : 'secondary-action'}
                    onClick={() => { void handleCopy(); }}
                    style={{ flex: '1 1 auto' }}
                    type="button"
                  >
                    {copyState === 'copied' ? <CheckCircle2 size={15} /> : <Clipboard size={15} />}
                    {copyState === 'copied' ? 'Copied!' : 'Copy'}
                  </button>

                  {showMode1EmailUI && (
                    <button
                      className="secondary-action"
                      onClick={() => setIsEditing(!isEditing)}
                      style={{ flex: '1 1 auto' }}
                      type="button"
                    >
                      <Check size={15} />
                      {isEditing ? 'Save' : 'Edit'}
                    </button>
                  )}

                  {onRegenerate && (
                    <button
                      className="secondary-action"
                      onClick={onRegenerate}
                      style={{ flex: '1 1 auto' }}
                      type="button"
                    >
                      <RotateCw size={15} />
                      Regenerate
                    </button>
                  )}

                  <button
                    className={replaceState !== 'idle' ? 'primary-action action-success' : 'primary-action'}
                    onClick={handleReplace}
                    style={{ flex: '2 1 100%' }}
                    type="button"
                  >
                    {replaceState !== 'idle' ? <CheckCircle2 size={15} /> : <FilePenLine size={15} />}
                    {replaceState !== 'idle' ? platform.labels.replacedAction : (showMode1EmailUI ? 'Insert into Gmail' : 'Replace Draft')}
                  </button>
                </div>

                {replaceState === 'success' ? <SuccessToast message={platform.labels.successToast} /> : null}
              </section>
            ) : (
              <ImprovedPromptCard
                copyState={copyState}
                formattedPrompt={formattedPrompt}
                labels={platform.labels}
                onCopy={handleCopy}
                onReplace={handleReplace}
                replaceState={replaceState}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="insights-tab"
            animate={{ opacity: 1, y: 0 }}
            className="tab-pane"
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {isGmail && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <ThinkingScoreCard score={analysis.thinkingScore} />
                <MetricCard value={analysis.estimatedImprovement} />
              </div>
            )}

            <GoalDiscoveryCard fallbackIntent={analysis.intent} goalDiscovery={analysis.goalDiscovery} labels={platform.labels} />
            <ThinkingCard hiddenAssumptions={analysis.hiddenAssumptions} labels={platform.labels} thinkingGap={analysis.thinkingGap} />
            <ExpertConsiderationsCard items={analysis.expertConsiderations} labels={platform.labels} />
            <BlindSpotsCard items={analysis.blindSpots} labels={platform.labels} />
            <MissingContextCard items={analysis.missingContext ?? []} labels={platform.labels} />

            <section className="result-card collection-card">
              <div>
                <p className="card-label">{platform.labels.recommendationsTitle || 'Recommended Improvements'}</p>
                <p className="card-caption">{platform.labels.recommendationsCaption}</p>
              </div>
              <div className="collection-list">
                {(analysis.suggestions ?? []).map((suggestion, index) => {
                  const key = typeof suggestion === 'string' ? suggestion : suggestion.recommendation;
                  return <SuggestionCard key={`${key}-${index}`} suggestion={suggestion} />;
                })}
                {!analysis.suggestions?.length && <p className="collection-empty">No additional suggestions.</p>}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
