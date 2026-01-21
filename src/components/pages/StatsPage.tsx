import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { useGame } from '../../context/GameContext';

export function StatsPage(): JSX.Element {
  const { progress } = useGame();
  const { moduleStats } = progress;

  return (
    <div className="p-4 space-y-4">
      {/* Dual N-Back Stats */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-dual-n-back/20 flex items-center justify-center text-xl">
            🧠
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">Dual N-Back</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Current N-Level</span>
            <span className="font-medium text-[var(--text-primary)]">
              N={moduleStats.dualNBack.currentN}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Highest N-Level</span>
            <span className="font-medium text-[var(--text-primary)]">
              N={moduleStats.dualNBack.highestN}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Total Sessions</span>
            <span className="font-medium text-[var(--text-primary)]">
              {moduleStats.dualNBack.totalSessions}
            </span>
          </div>
          <ProgressBar
            value={moduleStats.dualNBack.averageAccuracy}
            label="Average Accuracy"
            showLabel
            color="primary"
          />
        </div>
      </Card>

      {/* Echo Chamber Stats */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-echo-chamber/20 flex items-center justify-center text-xl">
            🔊
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">Echo Chamber</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Current Difficulty</span>
            <span className="font-medium text-[var(--text-primary)] capitalize">
              {moduleStats.echoChamber.currentDifficulty}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Total Sessions</span>
            <span className="font-medium text-[var(--text-primary)]">
              {moduleStats.echoChamber.totalSessions}
            </span>
          </div>
          <ProgressBar
            value={moduleStats.echoChamber.averageAccuracy}
            label="Average Accuracy"
            showLabel
            color="custom"
            customColor="var(--echo-chamber)"
          />
        </div>
      </Card>

      {/* Detail Hunter Stats */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-detail-hunter/20 flex items-center justify-center text-xl">
            👁️
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">Detail Hunter</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Total Sessions</span>
            <span className="font-medium text-[var(--text-primary)]">
              {moduleStats.detailHunter.totalSessions}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Successful Recalls</span>
            <span className="font-medium text-[var(--text-primary)]">
              {moduleStats.detailHunter.successfulRecalls}
            </span>
          </div>
          <ProgressBar
            value={moduleStats.detailHunter.averageAccuracy}
            label="Average Accuracy"
            showLabel
            color="custom"
            customColor="var(--detail-hunter)"
          />
        </div>
      </Card>

      {/* Reverse Recall Stats */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-reverse-recall/20 flex items-center justify-center text-xl">
            ⏪
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">Reverse Recall</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Total Sessions</span>
            <span className="font-medium text-[var(--text-primary)]">
              {moduleStats.reverseRecall.totalSessions}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Events Logged</span>
            <span className="font-medium text-[var(--text-primary)]">
              {moduleStats.reverseRecall.totalEventsLogged}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Longest Chain</span>
            <span className="font-medium text-[var(--text-primary)]">
              {moduleStats.reverseRecall.longestChain} events
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
