import { useState } from 'react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { useGame } from '../../../context/GameContext';

// Placeholder - will be fully implemented in Phase 2
export function DualNBack(): JSX.Element {
  const { progress } = useGame();
  const [started, setStarted] = useState(false);

  const currentN = progress.moduleStats.dualNBack.currentN;

  if (!started) {
    return (
      <div className="p-4 space-y-6">
        <Card className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Dual N-Back
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Train your working memory by tracking position and audio sequences.
          </p>
          <div className="text-lg font-semibold text-accent-primary mb-6">
            Current Level: N={currentN}
          </div>
          <Button onClick={() => setStarted(true)} fullWidth size="lg">
            Start Training
          </Button>
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">How to Play</h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>• Watch the grid for position cues</li>
            <li>• Listen for letter sounds</li>
            <li>• Press "Position" if it matches {currentN} step(s) back</li>
            <li>• Press "Sound" if it matches {currentN} step(s) back</li>
          </ul>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-[var(--text-secondary)] mb-4">
        Full game implementation coming in Phase 2...
      </p>
      <Button variant="secondary" onClick={() => setStarted(false)}>
        Back
      </Button>
    </div>
  );
}
