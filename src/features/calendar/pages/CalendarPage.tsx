import { Link } from 'react-router-dom';
import { AreaBadge, StatusBadge } from '../../../components/common/Badges';
import { useActivityStore } from '../../activities/stores/activityStore';
import { formatDateRange } from '../../../utils/format';

export function CalendarPage() {
  const { activities } = useActivityStore();
  const dated = activities.filter((activity) => activity.dueDate).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
  return <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><header className="mb-5"><p className="text-sm font-medium text-teal-700">Calendario</p><h1 className="text-2xl font-semibold">Semana y mes</h1></header><section className="space-y-3">{dated.map((activity) => <Link className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[140px_1fr_auto] md:items-center" key={activity.id} to={`/activities/${activity.id}`}><strong className="text-sm text-slate-600">{formatDateRange(activity.startDate, activity.dueDate)}</strong><span className="font-semibold">{activity.title}</span><span className="flex gap-2"><AreaBadge area={activity.area} /><StatusBadge status={activity.status} /></span></Link>)}</section></div>;
}


