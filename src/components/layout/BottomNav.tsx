import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, BrainIcon, ChartIcon, SettingsIcon } from '../icons';
import { ModuleSelector } from '../dashboard/ModuleSelector';

export function BottomNav(): JSX.Element {
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const location = useLocation();

  // Check if we're on a training page
  const isTrainingActive = location.pathname.startsWith('/train/');

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-[var(--bg-primary)] border-t border-gray-200 dark:border-gray-800 pb-safe">
        <div className="flex items-center justify-around h-16">
          {/* Home */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-touch min-h-touch px-3 py-2 transition-colors duration-fast ${
                isActive
                  ? 'text-dual-n-back'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`
            }
            aria-label="Home"
          >
            <HomeIcon size={22} className="mb-0.5" />
            <span className="text-xs font-medium">Home</span>
          </NavLink>

          {/* Train button - opens module selector */}
          <button
            type="button"
            onClick={() => setShowModuleSelector(true)}
            className={`flex flex-col items-center justify-center min-w-touch min-h-touch px-3 py-2 transition-colors duration-fast ${
              isTrainingActive
                ? 'text-dual-n-back'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            aria-label="Train"
          >
            <BrainIcon size={22} className="mb-0.5" />
            <span className="text-xs font-medium">Train</span>
          </button>

          {/* Stats */}
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-touch min-h-touch px-3 py-2 transition-colors duration-fast ${
                isActive
                  ? 'text-dual-n-back'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`
            }
            aria-label="Stats"
          >
            <ChartIcon size={22} className="mb-0.5" />
            <span className="text-xs font-medium">Stats</span>
          </NavLink>

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-touch min-h-touch px-3 py-2 transition-colors duration-fast ${
                isActive
                  ? 'text-dual-n-back'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`
            }
            aria-label="Settings"
          >
            <SettingsIcon size={22} className="mb-0.5" />
            <span className="text-xs font-medium">Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* Module Selector Bottom Sheet */}
      <ModuleSelector
        isOpen={showModuleSelector}
        onClose={() => setShowModuleSelector(false)}
      />
    </>
  );
}
