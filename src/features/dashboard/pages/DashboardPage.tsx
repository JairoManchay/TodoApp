import { AlertTriangle, ArrowRight, CalendarClock, ClipboardCheck, ListTodo, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaBadge, PriorityBadge, StatusBadge } from '../../../components/common/Badges';
import { ProgressBar } from '../../../components/common/ProgressBar';
import { ProgressCharts } from '../../../components/common/ProgressCharts';
import { useActivityStore } from '../../activities/stores/activityStore';
import { formatDateRange, isToday, isWithinNextDays } from '../../../utils/format';

export function DashboardPage() {
  const { activities, getProgress } = useActivityStore();
  const summary = [
    { label: 'Pendientes', value: activities.filter((a) => a.status === 'pending').length, tone: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'En proceso', value: activities.filter((a) => a.status === 'in_progress').length, tone: 'bg-sky-50 text-sky-700 border-sky-200' },
    { label: 'Por revisar', value: activities.filter((a) => a.status === 'review').length, tone: 'bg-violet-50 text-violet-700 border-violet-200' },
    { label: 'Completadas', value: activities.filter((a) => a.status === 'completed').length, tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  ];
  const todayActivities = activities.filter((activity) => isToday(activity.dueDate));
  const weekActivities = activities.filter((activity) => isWithinNextDays(activity.dueDate, 7));
  const reviewCount = activities.filter((activity) => activity.status === 'review').length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-medium text-teal-700">Buenos dias, Jairo</p><h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">Tus actividades de hoy</h1></div><div className="flex items-center gap-2"><Link className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm" to="/activities" title="Buscar"><Search size={18} /></Link><Link className="flex h-10 items-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm" to="/activities/new"><Plus size={18} />Nueva</Link></div></header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{summary.map((item) => <Link className={`rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${item.tone}`} key={item.label} to="/activities"><p className="text-sm font-medium">{item.label}</p><p className="mt-2 text-3xl font-semibold">{item.value}</p></Link>)}</section>
      <ProgressCharts activities={activities} getProgress={getProgress} />
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]"><div><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold text-slate-950">Hoy</h2><Link className="flex items-center gap-1 text-sm font-medium text-teal-700" to="/activities">Ver todo<ArrowRight size={16} /></Link></div><div className="space-y-3">{todayActivities.map((activity) => { const progress = getProgress(activity.id); return <Link className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md" key={activity.id} to={`/activities/${activity.id}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-950">{activity.title}</h3><div className="mt-2 flex flex-wrap gap-2"><AreaBadge area={activity.area} /><PriorityBadge priority={activity.priority} /><StatusBadge status={activity.status} /></div></div></div><div className="mt-4"><ProgressBar completed={progress.completedSubtasks} total={progress.totalSubtasks} percentage={progress.percentage} /></div></Link>; })}{todayActivities.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No tienes actividades para hoy.</div> : null}</div></div><aside className="space-y-4"><Link className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md" to="/calendar"><div className="mb-3 flex items-center gap-2"><CalendarClock className="text-teal-700" size={18} /><h2 className="text-base font-semibold">Esta semana</h2></div><div className="space-y-3 text-sm">{weekActivities.slice(0, 5).map((activity) => <p className="flex justify-between gap-4" key={activity.id}><span>{formatDateRange(activity.startDate, activity.dueDate)}</span><strong>{activity.title}</strong></p>)}</div></Link><Link className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:shadow-md" to="/calendar"><div className="mb-3 flex items-center gap-2"><AlertTriangle className="text-amber-600" size={18} /><h2 className="text-base font-semibold">Proximamente</h2></div><div className="space-y-2 text-sm text-slate-600">{activities.filter((a) => a.dueDate && !isToday(a.dueDate)).slice(0, 4).map((a) => <p key={a.id}>{a.title}</p>)}</div></Link><Link className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md" to="/activities"><div className="mb-3 flex items-center gap-2"><ClipboardCheck className="text-emerald-700" size={18} /><h2 className="text-base font-semibold">Por revisar</h2></div><p className="text-sm text-slate-600">{reviewCount} actividad(es) esperan doble check antes de finalizar.</p></Link></aside></section>
      <Link className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg lg:hidden" to="/activities/new" title="Nueva actividad"><ListTodo size={22} /></Link>
    </div>
  );
}




