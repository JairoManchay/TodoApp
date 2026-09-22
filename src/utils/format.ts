import type { ActivityPriority, ActivityStatus, AreaType } from '../types/taskflow';

export const areaLabels: Record<AreaType, string> = { university: 'Universidad', work: 'Trabajo', personal: 'Personal' };
export const statusLabels: Record<ActivityStatus, string> = { pending: 'Pendiente', in_progress: 'En proceso', review: 'Por revisar', completed: 'Finalizada', archived: 'Archivada' };
export const priorityLabels: Record<ActivityPriority, string> = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' };

export function formatDate(value?: string) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

export function isToday(value?: string) {
  if (!value) return false;
  return value === new Date().toISOString().slice(0, 10);
}

export function isWithinNextDays(value: string | undefined, days: number) {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  const diff = target.getTime() - today.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

export function formatDateRange(startDate?: string, dueDate?: string) {
  if (!startDate && !dueDate) return 'Sin fecha';
  if (startDate && dueDate) return `${formatDate(startDate)} - ${formatDate(dueDate)}`;
  if (startDate) return `Desde ${formatDate(startDate)}`;
  return `Hasta ${formatDate(dueDate)}`;
}

export function activityOverlapsRange(activityStart?: string, activityEnd?: string, filterStart?: string, filterEnd?: string) {
  if (!filterStart && !filterEnd) return true;
  const start = activityStart || activityEnd;
  const end = activityEnd || activityStart;
  if (!start && !end) return false;
  const normalizedStart = start ?? end;
  const normalizedEnd = end ?? start;
  if (filterStart && normalizedEnd && normalizedEnd < filterStart) return false;
  if (filterEnd && normalizedStart && normalizedStart > filterEnd) return false;
  return true;
}
