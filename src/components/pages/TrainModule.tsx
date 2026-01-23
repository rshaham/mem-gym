import { useParams, Navigate } from 'react-router-dom';
import { DualNBack } from '../modules/dual-n-back/DualNBack';
import { DetailHunter } from '../modules/detail-hunter/DetailHunter';
import { EchoChamber } from '../modules/echo-chamber/EchoChamber';
import { ReverseRecall } from '../modules/reverse-recall/ReverseRecall';
import type { ModuleType } from '../../types';

const moduleComponents: Record<ModuleType, () => JSX.Element> = {
  'dual-n-back': DualNBack,
  'echo-chamber': EchoChamber,
  'detail-hunter': DetailHunter,
  'reverse-recall': ReverseRecall,
};

export function TrainModule(): JSX.Element {
  const { module } = useParams<{ module: string }>();

  if (!module || !(module in moduleComponents)) {
    return <Navigate to="/" replace />;
  }

  const ModuleComponent = moduleComponents[module as ModuleType];
  return <ModuleComponent />;
}
