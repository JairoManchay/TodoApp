import { useMemo, useState } from 'react';
import type { Activity, ActivityProgress, AreaType } from '../../types/taskflow';
import { activityOverlapsRange } from '../../utils/format';

type Period = 'week' | 'month' | 'year';

type AreaMetric = {
  area: AreaType;
  label: string;
  completed: number;
  total: number;
  percentage: number;
  tone: string;
};

interface ProgressChartsProps {
  activities: Activity[];
  getProgress: (activityId: string) => ActivityProgress;
}

const periodLabels: Record<Period, string> = { week: 'Semana', month: 'Mes', year: 'Ano' };
const areaLabels: Record<AreaType, string> = { work: 'Trabajo', university: 'Universidad', personal: 'Personal' };
const areaTone: Record<AreaType, string> = { work: 'bg-cyan-600', university: 'bg-indigo-600', personal: 'bg-emerald-600' };

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getPeriodRange(period: Period) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (period === 'week') {
    const day = start.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diffToMonday);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
  }

  if (period === 'month') {
    start.setDate(1);
    end.setMonth(start.getMonth() + 1, 0);
  }

  if (period === 'year') {
    start.setMonth(0, 1);
    end.setMonth(11, 31);
  }

  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

function summarizeArea(area: AreaType, activities: Activity[], getProgress: ProgressChartsProps['getProgress']): AreaMetric {
  const totals = activities
    .filter((activity) => activity.area === area)
    .reduce(
      (acc, activity) => {
        const progress = getProgress(activity.id);
        return {
          completed: acc.completed + progress.completedSubtasks,
          total: acc.total + progress.totalSubtasks
        };
      },
      { completed: 0, total: 0 }
    );
  const percentage = totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100);

  return { area, label: areaLabels[area], completed: totals.completed, total: totals.total, percentage, tone: areaTone[area] };
}

export function ProgressCharts({ activities, getProgress }: ProgressChartsProps) {
  const [period, setPeriod] = useState<Period>('week');
  const metrics = useMemo(() => {
    const range = getPeriodRange(period);
    const scopedActivities = activities.filter((activity) => activityOverlapsRange(activity.startDate, activity.dueDate, range.start, range.end));
    const areas: AreaMetric[] = [
      summarizeArea('work', scopedActivities, getProgress),
      summarizeArea('university', scopedActivities, getProgress),
      summarizeArea('personal', scopedActivities, getProgress)
    ];
    const completed = areas.reduce((sum, area) => sum + area.completed, 0);
    const total = areas.reduce((sum, area) => sum + area.total, 0);
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { areas, completed, total, percentage, activityCount: scopedActivities.length, range };
  }, [activities, getProgress, period]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Progreso</p>
          <h2 className="text-base font-semibold text-slate-950">Avance por periodo</h2>
        </div>
        <div className="grid grid-cols-3 rounded-md border border-slate-200 bg-slate-50 p-1 text-sm font-semibold">
          {(['week', 'month', 'year'] as Period[]).map((value) => (
            <button className={`rounded px-3 py-1.5 ${period === value ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'}`} key={value} onClick={() => setPeriod(value)}>
              {periodLabels[value]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr] lg:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(#0f766e ${metrics.percentage}%, #e2e8f0 0)` }}>
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
              <div>
                <p className="text-3xl font-semibold text-slate-950">{metrics.percentage}%</p>
                <p className="text-xs text-slate-500">{metrics.completed}/{metrics.total}</p>
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-600 lg:hidden">
            <p>{metrics.activityCount} actividades</p>
            <p>{metrics.range.start} - {metrics.range.end}</p>
          </div>
        </div>

        <div className="space-y-3">
          {metrics.areas.map((area) => (
            <div key={area.area}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{area.label}</span>
                <span className="text-slate-500">{area.completed}/{area.total} - {area.percentage}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${area.tone}`} style={{ width: `${area.percentage}%` }} />
              </div>
            </div>
          ))}
          <p className="hidden text-sm text-slate-500 lg:block">{metrics.activityCount} actividades entre {metrics.range.start} y {metrics.range.end}</p>
        </div>
      </div>
    </section>
  );
}
