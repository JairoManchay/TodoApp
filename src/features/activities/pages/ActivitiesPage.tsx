import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { AreaBadge, PriorityBadge, StatusBadge } from '../../../components/common/Badges';
import { ProgressBar } from '../../../components/common/ProgressBar';
import { useActivityStore } from '../stores/activityStore';
import { formatDateRange } from '../../../utils/format';

export function ActivitiesPage() {
  const { activities, filters, setFilters, getProgress, isLoading } = useActivityStore();
  const filtered = activities.filter((activity) => {
    const textMatch = activity.title.toLowerCase().includes(filters.text.toLowerCase());
    const areaMatch = filters.area === 'all' || activity.area === filters.area;
    const statusMatch = filters.status === 'all' || activity.status === filters.status;
    return textMatch && areaMatch && statusMatch;
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><p className="text-sm font-medium text-teal-700">Actividades</p><h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">Tu flujo de trabajo</h1></div>
        <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm" to="/activities/new"><Plus size={18} />Nueva actividad</Link>
      </header>

      <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px]">
        <label className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={18} /><input className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-teal-500" placeholder="Buscar actividad" value={filters.text} onChange={(event) => setFilters({ text: event.target.value })} /></label>
        <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.area} onChange={(event) => setFilters({ area: event.target.value as typeof filters.area })}><option value="all">Todas las areas</option><option value="university">Universidad</option><option value="work">Trabajo</option><option value="personal">Personal</option></select>
        <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.status} onChange={(event) => setFilters({ status: event.target.value as typeof filters.status })}><option value="all">Todos los estados</option><option value="pending">Pendiente</option><option value="in_progress">En proceso</option><option value="review">Por revisar</option><option value="completed">Finalizada</option><option value="archived">Archivada</option></select>
      </section>

      <section className="space-y-3">
        {isLoading ? <p className="text-sm text-slate-500">Cargando actividades...</p> : null}
        {filtered.map((activity) => {
          const progress = getProgress(activity.id);
          return <Link className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md" key={activity.id} to={`/activities/${activity.id}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><h2 className="font-semibold text-slate-950">{activity.title}</h2><p className="mt-1 text-sm text-slate-500">Fecha: {formatDateRange(activity.startDate, activity.dueDate)}</p></div><div className="flex flex-wrap gap-2"><AreaBadge area={activity.area} /><PriorityBadge priority={activity.priority} /><StatusBadge status={activity.status} /></div></div>
            <div className="mt-4"><ProgressBar completed={progress.completedSubtasks} total={progress.totalSubtasks} percentage={progress.percentage} /></div>
          </Link>;
        })}
        {!isLoading && filtered.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Falta construir tu primera Tarea</div> : null}
      </section>
    </div>
  );
}



