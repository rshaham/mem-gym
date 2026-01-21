import { NavLink } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/train/dual-n-back', label: 'Train', icon: '🧠' },
  { path: '/stats', label: 'Stats', icon: '📊' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export function BottomNav(): JSX.Element {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-[var(--bg-primary)] border-t border-gray-200 dark:border-gray-800 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-touch min-h-touch px-3 py-2 transition-colors duration-fast ${
                isActive
                  ? 'text-accent-primary'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`
            }
            aria-label={item.label}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
