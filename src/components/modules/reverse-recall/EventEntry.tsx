import { useState, useRef, useEffect } from 'react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import type { ReverseRecallEvent } from '../../../types';

interface EventEntryProps {
  events: ReverseRecallEvent[];
  chainLevel: 1 | 2 | 3;
  targetEvents: number;
  onAddEvent: (description: string) => void;
  onSensoryTap: (eventId: string, sense: 'sight' | 'sound' | 'smell' | 'touch' | 'taste') => void;
  onFinish: () => void;
}

const SENSE_ICONS: Record<'sight' | 'sound' | 'smell' | 'touch' | 'taste', string> = {
  sight: '\u{1F441}',
  sound: '\u{1F442}',
  smell: '\u{1F443}',
  touch: '\u{270B}',
  taste: '\u{1F445}',
};

const SENSE_LABELS: Record<'sight' | 'sound' | 'smell' | 'touch' | 'taste', string> = {
  sight: 'Sight',
  sound: 'Sound',
  smell: 'Smell',
  touch: 'Touch',
  taste: 'Taste',
};

export function EventEntry({
  events,
  chainLevel,
  targetEvents,
  onAddEvent,
  onSensoryTap,
  onFinish,
}: EventEntryProps): JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const timelineEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isTargetReached = events.length >= targetEvents;
  const currentEventNumber = events.length + 1;

  // Scroll to bottom of timeline when new event is added
  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onAddEvent(trimmedValue);
      setInputValue('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function getPromptText(): string {
    if (events.length === 0) {
      return "What's the last thing you did before opening this app?";
    }
    return 'And before that?';
  }

  function hasSensoryDetail(
    event: ReverseRecallEvent,
    sense: 'sight' | 'sound' | 'smell' | 'touch' | 'taste'
  ): boolean {
    return Boolean(event.sensoryDetails?.[sense]);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress indicator */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Event {Math.min(currentEventNumber, targetEvents)} of {targetEvents}
          </span>
          <span className="text-sm text-reverse-recall font-semibold">
            Level {chainLevel}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-reverse-recall transition-all duration-normal rounded-full"
            style={{ width: `${Math.min((events.length / targetEvents) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Timeline of events (building upward - newest at bottom) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-tertiary)] text-center px-4">
            <p>Your timeline will build here as you recall events backward through your day.</p>
          </div>
        ) : (
          <>
            {/* Events displayed in order (oldest first at top, newest at bottom) */}
            {events.map((event, index) => (
              <Card key={event.id} padding="sm" className="relative">
                {/* Timeline connector */}
                {index < events.length - 1 && (
                  <div className="absolute left-6 -bottom-3 w-0.5 h-3 bg-reverse-recall/30" />
                )}

                <div className="flex gap-3">
                  {/* Event number badge */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-reverse-recall/10 text-reverse-recall flex items-center justify-center font-semibold text-sm">
                    {events.length - index}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-primary)] text-sm leading-relaxed">
                      {event.description}
                    </p>

                    {/* Sensory icons - optional on all levels for bonus XP */}
                    <div className="flex gap-2 mt-2">
                      {(Object.keys(SENSE_ICONS) as Array<keyof typeof SENSE_ICONS>).map((sense) => {
                        const hasSense = hasSensoryDetail(event, sense);
                        return (
                          <button
                            type="button"
                            key={sense}
                            onClick={() => onSensoryTap(event.id, sense)}
                            className={`
                              min-w-touch min-h-[36px] px-2 py-1 rounded-lg text-lg
                              transition-all duration-fast
                              ${hasSense
                                ? 'bg-reverse-recall/20 border-2 border-reverse-recall'
                                : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent opacity-50 hover:opacity-100'
                              }
                            `}
                            aria-label={`${hasSense ? 'Edit' : 'Add'} ${SENSE_LABELS[sense]} detail`}
                            title={SENSE_LABELS[sense]}
                          >
                            {SENSE_ICONS[sense]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <div ref={timelineEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-[var(--bg-primary)]">
        {isTargetReached ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)] text-center">
              Great job! You've recalled {events.length} events.
              Tap the sense icons to add sensory details for bonus XP.
            </p>
            <Button
              onClick={onFinish}
              fullWidth
              className="bg-reverse-recall hover:bg-green-600 active:bg-green-700"
            >
              Finish
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm font-medium text-reverse-recall">
              {getPromptText()}
            </label>
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you were doing..."
                className="
                  flex-1 min-h-[80px] max-h-[120px] p-3
                  bg-[var(--bg-secondary)] text-[var(--text-primary)]
                  border border-gray-200 dark:border-gray-700
                  rounded-lg resize-none
                  placeholder:text-[var(--text-tertiary)]
                  focus:outline-none focus:ring-2 focus:ring-reverse-recall focus:border-transparent
                "
                aria-label="Event description"
              />
            </div>
            <Button
              type="submit"
              fullWidth
              disabled={!inputValue.trim()}
              className="bg-reverse-recall hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300"
            >
              Add Event
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
