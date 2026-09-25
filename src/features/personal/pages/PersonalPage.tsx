import { Filter } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaBadge, PriorityBadge, StatusBadge } from '../../../components/common/Badges';
import { ProgressBar } from '../../../components/common/ProgressBar';
import { formatDateRange } from '../../../utils/format';
import { emptyAreaFilters, filterActivities, hasInvalidAreaFilterRange, type AreaFilters } from '../../../utils/activityFilters';
import { useActivityStore } from '../../activities/stores/activityStore';

export function PersonalPage() {
  const { activities, getProgress } = useActivityStore();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AreaFilters>(emptyAreaFilters);
  const invalidFilterRange = hasInvalidAreaFilterRange(filters);
  const personal = filterActivities(activities.filter((activity) => activity.area === 'personal'), filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div><p className="text-sm font-medium text-teal-700">Personal</p><h1 className="text-2xl font-semibold">Vida personal</h1></div>
        <div className="flex gap-2"><button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold" onClick={() => setShowFilters((value) => !value)}><Filter size={16} />Filtros</button><Link className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white" to="/activities/new">Nueva actividad</Link></div>
      </header>

      {showFilters ? <section className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5"><input aria-label="Filtrar desde fecha inicio" className="h-10 rounded-md border border-slate-200 px-3 text-sm" type="date" value={filters.startDate} onChange={(event) => setFilters({ ...filters, startDate: event.target.value })} /><input aria-label="Filtrar hasta fecha fin" className="h-10 rounded-md border border-slate-200 px-3 text-sm" type="date" value={filters.endDate} onChange={(event) => setFilters({ ...filters, endDate: event.target.value })} /><select aria-label="Filtrar por tipo" className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value as AreaFilters['type'] })}><option value="all">Todos los tipos</option><option value="gym">Gimnasio</option><option value="shopping">Compras</option><option value="errand">Tramite</option><option value="payment">Pago</option><option value="appointment">Cita</option><option value="reminder">Recordatorio</option><option value="personal_goal">Objetivo</option><option value="other">Otro</option></select><select aria-label="Filtrar por prioridad" className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value as AreaFilters['priority'] })}><option value="all">Toda prioridad</option><option value="urgent">Urgente</option><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select><select aria-label="Filtrar por estado" className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as AreaFilters['status'] })}><option value="all">Todo estado</option><option value="pending">Pendiente</option><option value="in_progress">En proceso</option><option value="review">Por revisar</option><option value="completed">Finalizada</option><option value="archived">Archivada</option></select></section> : null}
      {invalidFilterRange ? <p className="mb-4 text-sm text-red-600">La fecha fin del filtro debe ser igual o posterior a la fecha inicio.</p> : null}

      <section className="space-y-3">{personal.map((activity) => { const progress = getProgress(activity.id); return <Link className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={activity.id} to={`/activities/${activity.id}`}><h2 className="font-semibold">{activity.title}</h2><p className="mt-1 text-sm text-slate-500">{formatDateRange(activity.startDate, activity.dueDate)}</p><div className="mt-3 flex flex-wrap gap-2"><AreaBadge area={activity.area} /><PriorityBadge priority={activity.priority} /><StatusBadge status={activity.status} /></div><div className="mt-3"><ProgressBar completed={progress.completedSubtasks} total={progress.totalSubtasks} percentage={progress.percentage} /></div></Link>; })}{personal.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Falta construir tu primera Tarea</p> : null}</section>
    </div>
  );
}
