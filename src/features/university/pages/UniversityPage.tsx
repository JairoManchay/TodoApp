import { Filter, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { ProgressBar } from '../../../components/common/ProgressBar';
import type { Activity, Course } from '../../../types/taskflow';
import { emptyAreaFilters, filterActivities, hasInvalidAreaFilterRange, type AreaFilters } from '../../../utils/activityFilters';
import { formatDateRange } from '../../../utils/format';
import { useActivityStore } from '../../activities/stores/activityStore';

type DeleteTarget =
  | { type: 'activity'; activity: Activity }
  | { type: 'course'; course: Course; activityCount: number }
  | null;

export function UniversityPage() {
  const { courses, activities, getProgress, deleteActivity, deleteCourse } = useActivityStore();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AreaFilters>(emptyAreaFilters);
  const invalidFilterRange = hasInvalidAreaFilterRange(filters);
  const filteredActivities = filterActivities(activities.filter((activity) => activity.area === 'university'), filters);

  async function confirmDelete() {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'activity') {
      await deleteActivity(deleteTarget.activity.id);
      setDeleteTarget(null);
      return;
    }

    if (deleteTarget.activityCount > 0) return;
    await deleteCourse(deleteTarget.course.id);
    setDeleteTarget(null);
  }

  const dialogTitle = deleteTarget?.type === 'activity' ? 'Eliminar actividad' : 'Eliminar curso';
  const dialogDescription =
    deleteTarget?.type === 'activity'
      ? `Se eliminara "${deleteTarget.activity.title}" junto con sus etapas, subtareas, notas e historial.`
      : deleteTarget?.activityCount
        ? 'Primero elimina las actividades asociadas. Asi evitamos borrar trabajo importante por accidente.'
        : `Se eliminara el curso "${deleteTarget?.course.name}".`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-teal-700">Universidad</p>
          <h1 className="text-2xl font-semibold">Cursos</h1>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold" onClick={() => setShowFilters((value) => !value)}>
            <Filter size={16} />
            Filtros
          </button>
          <Link className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white" to="/activities/new">Nueva actividad</Link>
        </div>
      </header>

      {showFilters ? (
        <section className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
          <input aria-label="Filtrar desde fecha inicio" className="h-10 rounded-md border border-slate-200 px-3 text-sm" type="date" value={filters.startDate} onChange={(event) => setFilters({ ...filters, startDate: event.target.value })} />
          <input aria-label="Filtrar hasta fecha fin" className="h-10 rounded-md border border-slate-200 px-3 text-sm" type="date" value={filters.endDate} onChange={(event) => setFilters({ ...filters, endDate: event.target.value })} />
          <select aria-label="Filtrar por tipo" className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value as AreaFilters['type'] })}>
            <option value="all">Todos los tipos</option>
            <option value="exam">Examen</option>
            <option value="graded_practice">Practica calificada</option>
            <option value="pc">PC</option>
            <option value="presentation">Exposicion</option>
            <option value="homework">Tarea</option>
            <option value="project">Proyecto</option>
            <option value="lab">Laboratorio</option>
            <option value="report">Informe</option>
            <option value="delivery">Entrega</option>
            <option value="reading">Lectura</option>
            <option value="other">Otro</option>
          </select>
          <select aria-label="Filtrar por prioridad" className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value as AreaFilters['priority'] })}>
            <option value="all">Toda prioridad</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
          <select aria-label="Filtrar por estado" className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as AreaFilters['status'] })}>
            <option value="all">Todo estado</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En proceso</option>
            <option value="review">Por revisar</option>
            <option value="completed">Finalizada</option>
            <option value="archived">Archivada</option>
          </select>
        </section>
      ) : null}
      {invalidFilterRange ? <p className="mb-4 text-sm text-red-600">La fecha fin del filtro debe ser igual o posterior a la fecha inicio.</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const courseActivities = filteredActivities.filter((activity) => activity.courseId === course.id);
          const completed = courseActivities.filter((activity) => activity.status === 'completed').length;

          return (
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={course.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{course.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{courseActivities.length} actividades - {completed} completadas</p>
                </div>
                <button className="rounded-md border border-red-200 p-2 text-red-600" onClick={() => setDeleteTarget({ type: 'course', course, activityCount: activities.filter((activity) => activity.courseId === course.id).length })} title="Eliminar curso">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {courseActivities.map((activity) => {
                  const progress = getProgress(activity.id);
                  return (
                    <div className="rounded-md bg-slate-50 p-3 text-sm" key={activity.id}>
                      <div className="flex items-start justify-between gap-3">
                        <Link className="font-semibold text-slate-950 hover:text-teal-700" to={`/activities/${activity.id}`}>{activity.title}</Link>
                        <button className="rounded-md border border-red-200 p-1 text-red-600" onClick={() => setDeleteTarget({ type: 'activity', activity })} title="Eliminar actividad">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{formatDateRange(activity.startDate, activity.dueDate)}</p>
                      <div className="mt-2"><ProgressBar completed={progress.completedSubtasks} total={progress.totalSubtasks} percentage={progress.percentage} /></div>
                    </div>
                  );
                })}
                {courseActivities.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-500">Falta construir tu primera Tarea</p> : null}
              </div>
            </article>
          );
        })}
        {courses.length === 0 ? <p className="text-sm text-slate-500">Falta construir tu primera Tarea</p> : null}
      </section>

      <ConfirmDialog
        confirmLabel={deleteTarget?.type === 'course' && deleteTarget.activityCount > 0 ? 'Entendido' : 'Eliminar'}
        description={dialogDescription}
        isOpen={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteTarget?.type === 'course' && deleteTarget.activityCount > 0 ? () => setDeleteTarget(null) : confirmDelete}
        title={dialogTitle}
      />
    </div>
  );
}
