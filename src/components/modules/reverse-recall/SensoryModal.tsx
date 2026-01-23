import { useState, useEffect, useRef } from 'react';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';

interface SensoryModalProps {
  isOpen: boolean;
  sense: 'sight' | 'sound' | 'smell' | 'touch' | 'taste';
  currentValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

const SENSE_CONFIG: Record<
  'sight' | 'sound' | 'smell' | 'touch' | 'taste',
  { title: string; placeholder: string; icon: string }
> = {
  sight: {
    title: 'What did you see?',
    placeholder: 'Describe what you saw... colors, shapes, people, objects',
    icon: '\u{1F441}',
  },
  sound: {
    title: 'What did you hear?',
    placeholder: 'Describe sounds... voices, music, ambient noise',
    icon: '\u{1F442}',
  },
  smell: {
    title: 'What did you smell?',
    placeholder: 'Describe scents... food, nature, fragrances',
    icon: '\u{1F443}',
  },
  touch: {
    title: 'What did you feel?',
    placeholder: 'Describe textures, temperatures, physical sensations',
    icon: '\u{270B}',
  },
  taste: {
    title: 'What did you taste?',
    placeholder: 'Describe flavors... sweet, salty, bitter, savory',
    icon: '\u{1F445}',
  },
};

export function SensoryModal({
  isOpen,
  sense,
  currentValue,
  onSave,
  onClose,
}: SensoryModalProps): JSX.Element {
  const [inputValue, setInputValue] = useState(currentValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const config = SENSE_CONFIG[sense];

  // Reset input value when modal opens with new value
  useEffect(() => {
    if (isOpen) {
      setInputValue(currentValue);
      // Focus textarea after a short delay to allow modal animation
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, currentValue]);

  function handleSave(): void {
    onSave(inputValue.trim());
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    // Allow Cmd/Ctrl+Enter to save
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${config.icon} ${config.title}`}
    >
      <div className="space-y-4">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={config.placeholder}
          className="
            w-full min-h-[120px] max-h-[200px] p-3
            bg-[var(--bg-secondary)] text-[var(--text-primary)]
            border border-gray-200 dark:border-gray-700
            rounded-lg resize-none
            placeholder:text-[var(--text-tertiary)]
            focus:outline-none focus:ring-2 focus:ring-reverse-recall focus:border-transparent
          "
          aria-label={`${config.title} - sensory detail input`}
        />

        <p className="text-xs text-[var(--text-tertiary)]">
          Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to save quickly
        </p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-reverse-recall hover:bg-green-600 active:bg-green-700"
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
