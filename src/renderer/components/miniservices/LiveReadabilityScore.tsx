/**
 * Live Readability Score - Mini Service Component
 * Real-time readability scoring with history timeline
 */
import React, { useEffect, useRef, useState } from 'react';
import Card from '../ui/Card';
import MiniServiceWrapper from './MiniServiceWrapper';

// Type definitions
interface CompositeScore {
  score: number;
  label: string;
  gradeLevel: string;
  readingTimeMinutes: number;
}

interface Totals {
  words: number;
  sentences: number;
  averageSentenceLength: number;
}

interface LiveScoreResults {
  compositeScore: CompositeScore;
  totals: Totals;
  meta?: {
    timestamp: string;
  };
}

interface HistoryEntry {
  timestamp: string;
  score: number;
  words: number;
}

const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const formatTimestamp = (iso: string): string => {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (_error) {
    return iso;
  }
};

const MAX_HISTORY_POINTS = 15;

const LiveReadabilityScore: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [language, setLanguage] = useState<string>('en');
  const [results, setResults] = useState<LiveScoreResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoAnalyze, setAutoAnalyze] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSignatureRef = useRef<string>('');

  const wordCount = getWordCount(content);

  useEffect(() => {
    if (!autoAnalyze) return undefined;

    if (!content.trim()) {
      setResults(null);
      return undefined;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      runAnalysis('auto');
    }, 800);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, language, autoAnalyze]);

  const runAnalysis = async (source: 'manual' | 'auto' = 'manual') => {
    const trimmed = content.trim();
    if (!trimmed) {
      setResults(null);
      return;
    }

    const signature = `${language}:${trimmed}`;
    if (source === 'auto' && lastSignatureRef.current === signature) {
      return;
    }

    if (!window.electronAPI?.readability?.analyzeLiveScore) {
      return;
    }

    setLoading(true);

    try {
      const payload = await window.electronAPI.readability.analyzeLiveScore(
        trimmed,
        {
          language,
        }
      ) as unknown as LiveScoreResults;

      setResults(payload);
      lastSignatureRef.current = signature;

      if (payload?.compositeScore) {
        const entry: HistoryEntry = {
          timestamp: payload.meta?.timestamp || new Date().toISOString(),
          score: Math.round(payload.compositeScore.score || 0),
          words: payload.totals?.words || 0,
        };
        setHistory(prev => {
          const next = [...prev, entry];
          return next.slice(-MAX_HISTORY_POINTS);
        });
      }
    } catch (err) {
      console.error('Live score analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalyze = async () => {
    await runAnalysis('manual');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <MiniServiceWrapper
      title="⚡ Live Readability Score"
      description="Real-time readability analysis with history tracking as you edit your content."
    >
      <Card className="input-card">
        <h3>Content & Settings</h3>

        <div className="form-group">
          <label htmlFor="live-content">Content to Analyze</label>
          <textarea
            id="live-content"
            rows={8}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Start typing or paste content here... (auto-updates as you type)"
            className="form-control"
          />
          <small className="form-help">
            Word count: {wordCount} words {loading && '(analyzing...)'}
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="live-language">Content Language</label>
            <select
              id="live-language"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="form-control"
            >
              <option value="en">English</option>
              <option value="el">Greek</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="live-auto">Auto-analysis</label>
            <div className="realtime-toggle">
              <input
                id="live-auto"
                type="checkbox"
                checked={autoAnalyze}
                onChange={e => setAutoAnalyze(e.target.checked)}
              />
              <span>Enabled</span>
            </div>
            <small className="form-help">
              Auto-refreshes readability score as you type
            </small>
          </div>
        </div>

        <div className="button-group">
          <button
            onClick={handleManualAnalyze}
            disabled={loading || !content.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Analyzing...' : 'Analyze Now'}
          </button>

          {history.length > 0 && (
            <button onClick={handleClearHistory} className="btn btn-secondary">
              Clear History
            </button>
          )}
        </div>
      </Card>

      <div className="results-container">
        {results && (
          <>
            <Card className="summary-card" title="Current Score">
              <div className="readability-score">
                <div className="score-value">
                  {Math.round(results.compositeScore.score || 0)}
                </div>
                <div className="score-label">
                  {results.compositeScore.label}
                </div>
                <div className="score-grade">
                  {results.compositeScore.gradeLevel}
                </div>
              </div>
            </Card>

            <Card className="results-card" title="Quick Stats">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{results.totals.words}</div>
                  <div className="stat-label">Words</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{results.totals.sentences}</div>
                  <div className="stat-label">Sentences</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {results.totals.averageSentenceLength}
                  </div>
                  <div className="stat-label">Avg Sentence</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {results.compositeScore.readingTimeMinutes}
                  </div>
                  <div className="stat-label">Min to Read</div>
                </div>
              </div>
            </Card>

            <Card className="results-card" title="Score Timeline">
              <p className="card-description">
                Recent scores tracked from auto and manual refreshes
              </p>
              <div className="timeline-list">
                {history.length === 0 && (
                  <div className="timeline-empty">
                    Scores will appear here as you analyze
                  </div>
                )}
                {history.map((item, index) => (
                  <div
                    key={`${item.timestamp}-${index}`}
                    className="timeline-item"
                  >
                    <div className="timeline-score">{item.score}</div>
                    <div className="timeline-meta">
                      <span>{formatTimestamp(item.timestamp)}</span>
                      <span>{item.words} words</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {!results && (
          <Card className="info-card">
            <div className="info-content">
              <div className="info-icon">⚡</div>
              <h3>Live Readability Scoring</h3>

              <div className="info-section">
                <h4>🔄 Real-time Analysis</h4>
                <p>
                  Enable auto-analysis to see your readability score update as
                  you type. Perfect for iterative writing and refinement.
                  Disable it for faster typing on longer documents.
                </p>
              </div>

              <div className="info-section">
                <h4>📊 Timeline Tracking</h4>
                <p>
                  Every analysis creates a data point in the timeline. Watch
                  your score improve as you shorten sentences, simplify
                  vocabulary, and restructure paragraphs.
                </p>
              </div>

              <div className="info-section">
                <h4>⚙️ How to Use</h4>
                <ul className="info-list">
                  <li>Enable auto-analysis (updates on 800ms debounce)</li>
                  <li>Type or paste content into the textarea</li>
                  <li>Watch the score update in real-time</li>
                  <li>Make edits and see immediate feedback</li>
                  <li>Review timeline to track progress</li>
                </ul>
              </div>

              <div className="info-section">
                <h4>💡 Optimization Loop</h4>
                <ol className="info-list">
                  <li>Start with initial content and baseline score</li>
                  <li>Identify low-scoring areas from other tabs</li>
                  <li>Edit the content directly in this textarea</li>
                  <li>Watch the score improve in real-time</li>
                  <li>Compare historical scores in the timeline</li>
                </ol>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MiniServiceWrapper>
  );
};

export default LiveReadabilityScore;
