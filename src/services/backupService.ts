import * as XLSX from 'xlsx';
import type { TaskFlowBackup } from '../types/taskflow';
import type { TaskFlowData } from '../repositories/taskFlowRepository';

const REQUIRED_COLLECTIONS: Array<keyof TaskFlowBackup['data']> = [
  'courses',
  'projects',
  'activities',
  'taskStages',
  'subtasks',
  'notes',
  'activityHistory',
  'resourceLinks',
  'settings'
];

export function buildBackup(data: TaskFlowData): TaskFlowBackup {
  return {
    appName: 'TaskFlow',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    data: {
      courses: data.courses,
      projects: data.projects,
      activities: data.activities,
      taskStages: data.taskStages,
      subtasks: data.subtasks,
      notes: data.notes,
      activityHistory: data.activityHistory,
      resourceLinks: data.resourceLinks,
      settings: data.settings
    }
  };
}

export function getBackupSummary(backup: TaskFlowBackup) {
  return {
    courses: backup.data.courses.length,
    projects: backup.data.projects.length,
    activities: backup.data.activities.length,
    stages: backup.data.taskStages.length,
    subtasks: backup.data.subtasks.length,
    notes: backup.data.notes.length,
    history: backup.data.activityHistory.length,
    resourceLinks: backup.data.resourceLinks.length,
    settings: backup.data.settings.length
  };
}

export function validateBackup(value: unknown): { ok: true; backup: TaskFlowBackup } | { ok: false; message: string } {
  if (!value || typeof value !== 'object') return { ok: false, message: 'El archivo no contiene un objeto JSON valido.' };
  const candidate = value as Partial<TaskFlowBackup>;
  if (candidate.appName !== 'TaskFlow') return { ok: false, message: 'El archivo no corresponde a TaskFlow.' };
  if (candidate.schemaVersion !== 1) return { ok: false, message: 'Version de backup no compatible.' };
  if (!candidate.exportedAt || typeof candidate.exportedAt !== 'string') return { ok: false, message: 'El backup no tiene fecha de exportacion valida.' };
  if (!candidate.data || typeof candidate.data !== 'object') return { ok: false, message: 'El backup no contiene data restaurable.' };

  for (const collection of REQUIRED_COLLECTIONS) {
    if (!Array.isArray(candidate.data[collection])) {
      return { ok: false, message: `El backup no contiene la coleccion requerida: ${collection}.` };
    }
  }

  const data = candidate.data as TaskFlowBackup['data'];
  const activityIds = new Set(data.activities.map((activity) => activity.id));
  const stageIds = new Set(data.taskStages.map((stage) => stage.id));

  if (data.taskStages.some((stage) => !activityIds.has(stage.activityId))) {
    return { ok: false, message: 'El backup tiene etapas asociadas a actividades inexistentes.' };
  }

  if (data.subtasks.some((subtask) => !activityIds.has(subtask.activityId) || !stageIds.has(subtask.stageId))) {
    return { ok: false, message: 'El backup tiene subtareas con referencias incompatibles.' };
  }

  return { ok: true, backup: candidate as TaskFlowBackup };
}

export async function readBackupFile(file: File): Promise<{ ok: true; backup: TaskFlowBackup } | { ok: false; message: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as unknown;
    return validateBackup(parsed);
  } catch {
    return { ok: false, message: 'No se pudo leer el archivo JSON.' };
  }
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportActivitiesExcel(data: TaskFlowData) {
  const rows = data.activities.map((activity) => ({ titulo: activity.title, area: activity.area, estado: activity.status, prioridad: activity.priority, fecha: activity.dueDate ?? '', completada: activity.completedAt ?? '' }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Actividades');
  XLSX.writeFile(book, 'taskflow-actividades.xlsx');
}
