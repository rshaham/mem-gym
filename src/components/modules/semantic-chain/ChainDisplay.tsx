import { useRef, useEffect } from 'react';

interface ChainDisplayProps {
  chain: string[];
  highlightLast?: boolean;
}

export function ChainDisplay({ chain, highlightLast = true }: ChainDisplayProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to show the latest word
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [chain]);

  if (chain.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        Chain will appear here...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap gap-2 p-4 bg-[var(--bg-secondary)] rounded-xl max-h-40 overflow-y-auto"
    >
      {chain.map((word, index) => {
        const isLast = index === chain.length - 1;
        const isFirst = index === 0;

        return (
          <div key={`${word}-${index}`} className="flex items-center">
            {/* Arrow between words */}
            {index > 0 && (
              <span className="text-[var(--text-secondary)] mx-1">→</span>
            )}

            {/* Word chip */}
            <span
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isFirst ? 'bg-gray-300 dark:bg-gray-600 text-[var(--text-primary)]' : ''}
                ${!isFirst && !isLast ? 'bg-accent-primary/20 text-accent-primary' : ''}
                ${isLast && highlightLast ? 'bg-accent-primary text-white animate-pulse' : ''}
                ${isLast && !highlightLast ? 'bg-accent-primary/20 text-accent-primary' : ''}
              `}
            >
              {word}
              {isLast && highlightLast && (
                <span className="ml-1 font-bold text-yellow-300">
                  {word.slice(-1).toUpperCase()}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
