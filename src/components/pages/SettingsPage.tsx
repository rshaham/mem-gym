import { Card } from '../common/Card';
import { useGame } from '../../context/GameContext';

export function SettingsPage(): JSX.Element {
  const { settings, updateSettings } = useGame();

  return (
    <div className="p-4 space-y-4">
      {/* Audio Settings */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Audio</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-[var(--text-primary)]">Sound Effects</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-5 h-5 rounded accent-accent-primary"
            />
          </label>
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-primary)]">Speech Rate</span>
              <span className="text-sm text-[var(--text-secondary)]">
                {settings.ttsRate.toFixed(1)}x
              </span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.ttsRate}
              onChange={(e) => updateSettings({ ttsRate: parseFloat(e.target.value) })}
              className="w-full accent-accent-primary"
            />
          </div>
        </div>
      </Card>

      {/* Feedback Settings */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Feedback</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-[var(--text-primary)]">Haptic Feedback</span>
            <input
              type="checkbox"
              checked={settings.hapticFeedback}
              onChange={(e) => updateSettings({ hapticFeedback: e.target.checked })}
              className="w-5 h-5 rounded accent-accent-primary"
            />
          </label>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-[var(--text-primary)]">Enable Notifications</span>
              <p className="text-sm text-[var(--text-secondary)]">
                For Detail Hunter reminders
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
              className="w-5 h-5 rounded accent-accent-primary"
            />
          </label>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Appearance</h3>
        <div className="space-y-2">
          {(['system', 'light', 'dark'] as const).map((theme) => (
            <label
              key={theme}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <input
                type="radio"
                name="theme"
                value={theme}
                checked={settings.theme === theme}
                onChange={() => updateSettings({ theme })}
                className="w-4 h-4 accent-accent-primary"
              />
              <span className="text-[var(--text-primary)] capitalize">{theme}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* App Info */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">About</h3>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <p>Memory Gym v0.0.1</p>
          <p>Train your brain with daily exercises</p>
        </div>
      </Card>
    </div>
  );
}
