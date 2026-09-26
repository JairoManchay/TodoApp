import { ProgressCharts } from '../components/ProgressCharts';
import { useActivityStore } from '../../activities/stores/activityStore';

export function ReportsPage() {
  const { activities, getProgress } = useActivityStore();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <p className="text-sm font-medium text-teal-700">Reportes</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">Progreso de actividades</h1>
      </header>
      <ProgressCharts activities={activities} getProgress={getProgress} />
    </div>
  );
}
