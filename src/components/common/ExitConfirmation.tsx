import { useCallback, useEffect } from 'react';
import { useMotion } from '../../hooks/useMotion';
import { Button } from './Button';

interface ExitConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExitConfirmation({
  isOpen,
  onConfirm,
  onCancel,
}: ExitConfirmationProps): JSX.Element | null {
  const { animations } = useMotion();

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(() => {
    onCancel();
  }, [onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${animations.fadeIn}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={`relative bg-[var(--bg-primary)] rounded-2xl shadow-xl max-w-sm w-full p-6 ${animations.scaleIn}`}
      >
        <h2
          id="exit-confirm-title"
          className="text-xl font-bold text-[var(--text-primary)] mb-2"
        >
          Exit Session?
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Your progress in this session will be lost. Are you sure you want to exit?
        </p>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onConfirm}
          >
            Exit
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onCancel}
          >
            Stay
          </Button>
        </div>
      </div>
    </div>
  );
}
