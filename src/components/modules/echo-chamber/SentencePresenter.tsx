import { useEffect, useRef, useState } from 'react';
import { Card } from '../../common/Card';
import type { EchoChamberMode } from '../../../types';

interface SentencePresenterProps {
  sentence: string;
  mode: EchoChamberMode;
  onComplete: () => void;
}

const VISUAL_DISPLAY_DURATION_MS = 3000;

export function SentencePresenter({
  sentence,
  mode,
  onComplete,
}: SentencePresenterProps): JSX.Element {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated to avoid stale closures
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const hasSpeechSynthesis = 'speechSynthesis' in window;

    // Clear any existing timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (mode === 'visual') {
      // Visual mode: display for 3 seconds then call onComplete
      timerRef.current = setTimeout(() => {
        onCompleteRef.current();
      }, VISUAL_DISPLAY_DURATION_MS);
    } else if (hasSpeechSynthesis) {
      // Audio mode: use Web Speech API
      window.speechSynthesis.cancel(); // Cancel any pending speech first

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onCompleteRef.current();
      };

      utterance.onerror = () => {
        // If speech fails, fall back to completing after a delay
        setIsSpeaking(false);
        onCompleteRef.current();
      };

      // Small delay before speaking to let component render
      timerRef.current = setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } else {
      // Fallback: if speechSynthesis not available, show visually and complete
      timerRef.current = setTimeout(() => {
        onCompleteRef.current();
      }, VISUAL_DISPLAY_DURATION_MS);
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      if (mode === 'audio' && hasSpeechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [sentence, mode]); // Remove onComplete from deps, use ref instead

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)]">
      <Card padding="lg" className="w-full max-w-md text-center">
        {/* Header */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            {mode === 'visual' ? (
              <svg
                className="w-8 h-8 text-echo-chamber"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg
                className={`w-8 h-8 text-echo-chamber ${isSpeaking ? 'animate-pulse' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </div>
          <h2 className="text-lg font-semibold text-echo-chamber">
            {mode === 'visual' ? 'Remember this:' : 'Listen carefully...'}
          </h2>
        </div>

        {/* Sentence Display */}
        {mode === 'visual' ? (
          <p
            className="text-xl md:text-2xl font-medium text-[var(--text-primary)] leading-relaxed mb-6"
            role="alert"
            aria-live="assertive"
          >
            {sentence}
          </p>
        ) : (
          <div className="mb-6">
            {isSpeaking ? (
              <div className="flex items-center justify-center gap-1" aria-label="Speaking">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-echo-chamber rounded-full animate-pulse"
                    style={{
                      height: `${16 + Math.random() * 24}px`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-secondary)]">Preparing audio...</p>
            )}
          </div>
        )}

        {/* Progress indicator for visual mode */}
        {mode === 'visual' && (
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-echo-chamber rounded-full"
              style={{
                animation: `shrink ${VISUAL_DISPLAY_DURATION_MS}ms linear forwards`,
              }}
            />
          </div>
        )}
      </Card>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
