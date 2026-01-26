import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMotion } from '../../hooks/useMotion';
import { Card } from '../common/Card';
import { GridIcon, VolumeIcon, EyeIcon, RewindIcon, XIcon, SudokuIcon } from '../icons';
import type { ModuleType } from '../../types';

interface ModuleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModuleOption {
  id: ModuleType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  colorClass: string;
  bgClass: string;
}

const modules: ModuleOption[] = [
  {
    id: 'dual-n-back',
    name: 'Dual N-Back',
    description: 'Position and audio sequences',
    icon: GridIcon,
    colorClass: 'text-dual-n-back',
    bgClass: 'bg-dual-n-back-light dark:bg-dual-n-back/20',
  },
  {
    id: 'echo-chamber',
    name: 'Echo Chamber',
    description: 'Sentence recall training',
    icon: VolumeIcon,
    colorClass: 'text-echo-chamber',
    bgClass: 'bg-echo-chamber-light dark:bg-echo-chamber/20',
  },
  {
    id: 'detail-hunter',
    name: 'Detail Hunter',
    description: 'Visual memory challenges',
    icon: EyeIcon,
    colorClass: 'text-detail-hunter',
    bgClass: 'bg-detail-hunter-light dark:bg-detail-hunter/20',
  },
  {
    id: 'reverse-recall',
    name: 'Reverse Recall',
    description: 'Trace your day backwards',
    icon: RewindIcon,
    colorClass: 'text-reverse-recall',
    bgClass: 'bg-reverse-recall-light dark:bg-reverse-recall/20',
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    description: 'Logic puzzle training',
    icon: SudokuIcon,
    colorClass: 'text-indigo-500',
    bgClass: 'bg-indigo-100 dark:bg-indigo-500/20',
  },
];

export function ModuleSelector({ isOpen, onClose }: ModuleSelectorProps): JSX.Element | null {
  const navigate = useNavigate();
  const { animations } = useMotion();

  // Handle selecting a module
  const handleSelectModule = useCallback((moduleId: ModuleType) => {
    onClose();
    navigate(`/train/${moduleId}`);
  }, [navigate, onClose]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Select training module">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${animations.fadeIn}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-[var(--bg-primary)] rounded-t-3xl shadow-2xl ${animations.slideUp}`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Choose Module
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close module selector"
          >
            <XIcon className="text-[var(--text-secondary)]" size={24} />
          </button>
        </div>

        {/* Module grid */}
        <div className="px-4 pb-8 grid grid-cols-2 gap-3">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card
                key={module.id}
                variant="interactive"
                className="cursor-pointer"
                onClick={() => handleSelectModule(module.id)}
                role="button"
                tabIndex={0}
                aria-label={`Start ${module.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectModule(module.id);
                  }
                }}
              >
                <div className="flex flex-col items-center text-center gap-3 py-2">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${module.bgClass}`}
                  >
                    <IconComponent className={module.colorClass} size={28} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                      {module.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  );
}
