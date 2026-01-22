import { useParams, Navigate } from 'react-router-dom';
import { DualNBack } from '../modules/dual-n-back/DualNBack';
import { DetailHunter } from '../modules/detail-hunter/DetailHunter';
import { EchoChamber } from '../modules/echo-chamber/EchoChamber';
import type { ModuleType } from '../../types';

const moduleComponents: Record<ModuleType, () => JSX.Element> = {
  'dual-n-back': DualNBack,
  'echo-chamber': EchoChamber,
  'detail-hunter': DetailHunter,
  'reverse-recall': () => <ComingSoon name="Reverse Recall" />,
};

function ComingSoon({ name }: { name: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{name}</h2>
      <p className="text-[var(--text-secondary)] text-center">
        This module is coming soon!
      </p>
    </div>
  );
}

export function TrainModule(): JSX.Element {
  const { module } = useParams<{ module: string }>();

  if (!module || !(module in moduleComponents)) {
    return <Navigate to="/" replace />;
  }

  const ModuleComponent = moduleComponents[module as ModuleType];
  return <ModuleComponent />;
}
