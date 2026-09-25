import { db } from '../database/db';
import type { Activity, ActivityDraft, ActivityHistory, Course, Note, Project, ResourceLink, Settings, Subtask, TaskFlowBackup, TaskStage } from '../types/taskflow';
import { createId, nowIso } from '../utils/ids';

export interface TaskFlowData { courses: Course[]; projects: Project[]; activities: Activity[]; taskStages: TaskStage[]; subtasks: Subtask[]; notes: Note[]; activityHistory: ActivityHistory[]; resourceLinks: ResourceLink[]; settings: Settings[]; }

async function findOrCreateCourse(name?: string) {
  if (!name?.trim()) return undefined;
  const cleanName = name.trim();
  const existing = await db.courses.where('name').equalsIgnoreCase(cleanName).first();
  if (existing) return existing.id;
  const timestamp = nowIso();
  const course: Course = { id: createId(), name: cleanName, isArchived: false, createdAt: timestamp, updatedAt: timestamp };
  await db.courses.add(course);
  return course.id;
}

async function findOrCreateProject(name?: string) {
  if (!name?.trim()) return undefined;
  const cleanName = name.trim();
  const existing = await db.projects.where('name').equalsIgnoreCase(cleanName).first();
  if (existing) return existing.id;
  const timestamp = nowIso();
  const project: Project = { id: createId(), name: cleanName, isArchived: false, createdAt: timestamp, updatedAt: timestamp };
  await db.projects.add(project);
  return project.id;
}

async function addHistory(activityId: string, type: ActivityHistory['type'], message: string) {
  await db.activityHistory.add({ id: createId(), activityId, type, message, createdAt: nowIso() });
}

export const taskFlowRepository = {
  async getAll(): Promise<TaskFlowData> {
    const [courses, projects, activities, taskStages, subtasks, notes, activityHistory, resourceLinks, settings] = await Promise.all([
      db.courses.toArray(), db.projects.toArray(), db.activities.toArray(), db.taskStages.toArray(), db.subtasks.toArray(), db.notes.toArray(), db.activityHistory.toArray(), db.resourceLinks.toArray(), db.settings.toArray()
    ]);
    return { courses, projects, activities, taskStages, subtasks, notes, activityHistory, resourceLinks, settings };
  },

  async seedIfEmpty() {
    const count = await db.activities.count();
    if (count > 0) return;
    await this.createActivity({ title: 'Implementar endpoint de pagos', description: 'Endpoint principal para registrar pagos del orquestador IPS.', area: 'work', type: 'feature', projectName: 'IPS - Orquestador de pagos', priority: 'high', dueDate: '2026-09-16', stages: [ { title: 'Analisis y preparacion', subtasks: ['Revisar requerimiento funcional', 'Analizar endpoints relacionados', 'Crear rama feature/endpoint-pagos'] }, { title: 'Desarrollo', subtasks: ['Implementar controller y service', 'Agregar validaciones', 'Manejar errores y excepciones'] }, { title: 'Pruebas y documentacion', subtasks: ['Crear pruebas unitarias', 'Probar casos limite', 'Documentar Swagger/OpenAPI'] }, { title: 'Revision final', subtasks: ['Revisar todos los pasos', 'Confirmar que no existe ningun pendiente'] } ] });
    await this.createActivity({ title: 'PC de Inmunologia', area: 'university', type: 'pc', courseName: 'Inmunologia', priority: 'urgent', dueDate: new Date().toISOString().slice(0, 10), stages: [ { title: 'Preparacion', subtasks: ['Revisar teoria', 'Resolver ejercicios', 'Repasar apuntes'] } ] });
    await this.createActivity({ title: 'Gimnasio', area: 'personal', type: 'gym', personalCategory: 'Salud', priority: 'medium', dueDate: new Date().toISOString().slice(0, 10), stages: [ { title: 'Rutina', subtasks: ['Calentamiento', 'Fuerza', 'Estiramiento'] } ] });
  },

  async createActivity(draft: ActivityDraft) {
    const timestamp = nowIso();
    const activityId = createId();
    const courseId = draft.area === 'university' ? await findOrCreateCourse(draft.courseName) : undefined;
    const projectId = draft.area === 'work' ? await findOrCreateProject(draft.projectName) : undefined;
    const activity: Activity = { id: activityId, title: draft.title.trim(), description: draft.description?.trim(), area: draft.area, type: draft.type, courseId, projectId, personalCategory: draft.area === 'personal' ? draft.personalCategory?.trim() : undefined, priority: draft.priority, status: 'pending', startDate: draft.startDate, dueDate: draft.dueDate, reviewChecklist: { reviewedSteps: false, confirmedNoPending: false }, order: Date.now(), createdAt: timestamp, updatedAt: timestamp };
    await db.transaction('rw', db.activities, db.taskStages, db.subtasks, db.activityHistory, async () => {
      await db.activities.add(activity);
      for (const [stageIndex, stageDraft] of draft.stages.entries()) {
        if (!stageDraft.title.trim()) continue;
        const stageId = createId();
        const stage: TaskStage = { id: stageId, activityId, title: stageDraft.title.trim(), order: stageIndex, isCollapsed: false, createdAt: timestamp, updatedAt: timestamp };
        await db.taskStages.add(stage);
        for (const [subtaskIndex, title] of stageDraft.subtasks.entries()) {
          if (!title.trim()) continue;
          await db.subtasks.add({ id: createId(), activityId, stageId, title: title.trim(), isCompleted: false, order: subtaskIndex, createdAt: timestamp, updatedAt: timestamp });
        }
      }
      await addHistory(activityId, 'created', `Actividad creada: ${activity.title}`);
    });
    return activityId;
  },

  async updateStatus(activityId: string, status: Activity['status']) {
    const patch: Partial<Activity> = { status, updatedAt: nowIso() };
    if (status === 'completed') patch.completedAt = nowIso();
    if (status === 'archived') patch.archivedAt = nowIso();
    await db.activities.update(activityId, patch);
    await addHistory(activityId, status === 'completed' ? 'completed' : status === 'review' ? 'moved_to_review' : 'started', `Estado cambiado a ${status}`);
  },

  async updateDueDate(activityId: string, dueDate?: string) {
    await db.activities.update(activityId, { dueDate: dueDate || undefined, updatedAt: nowIso() });
    await addHistory(activityId, 'date_changed', dueDate ? `Extendiste la fecha fin hasta ${dueDate}` : 'Quitaste la fecha fin');
  },
  async toggleSubtask(subtask: Subtask) {
    const isCompleted = !subtask.isCompleted;
    await db.subtasks.update(subtask.id, { isCompleted, completedAt: isCompleted ? nowIso() : undefined, updatedAt: nowIso() });
    await addHistory(subtask.activityId, isCompleted ? 'subtask_completed' : 'subtask_reopened', `${isCompleted ? 'Completaste' : 'Reabriste'} "${subtask.title}"`);
    const remaining = await db.subtasks.where('activityId').equals(subtask.activityId).and((item) => item.id === subtask.id ? !isCompleted : !item.isCompleted).count();
    const activity = await db.activities.get(subtask.activityId);
    if (remaining === 0 && activity && activity.status !== 'completed' && activity.status !== 'archived') await this.updateStatus(subtask.activityId, 'review');
  },


  async restartActivity(activityId: string) {
    const timestamp = nowIso();
    await db.transaction('rw', [db.activities, db.subtasks, db.activityHistory], async () => {
      await db.subtasks.where('activityId').equals(activityId).modify({ isCompleted: false, completedAt: undefined, updatedAt: timestamp });
      await db.activities.update(activityId, { status: 'in_progress', completedAt: undefined, reviewChecklist: { reviewedSteps: false, confirmedNoPending: false }, updatedAt: timestamp });
      await addHistory(activityId, 'started', 'Actividad iniciada: checklist reiniciado');
    });
  },

  async addStage(activityId: string, title: string) {
    const timestamp = nowIso();
    const order = await db.taskStages.where('activityId').equals(activityId).count();
    await db.taskStages.add({ id: createId(), activityId, title: title.trim(), order, isCollapsed: false, createdAt: timestamp, updatedAt: timestamp });
    await db.activities.update(activityId, { status: 'in_progress', updatedAt: timestamp });
    await addHistory(activityId, 'stage_created', `Agregaste la etapa "${title.trim()}"`);
  },

  async moveSubtask(subtask: Subtask, direction: 'up' | 'down') {
    const stageSubtasks = await db.subtasks.where('stageId').equals(subtask.stageId).sortBy('order');
    const currentIndex = stageSubtasks.findIndex((item) => item.id === subtask.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const target = stageSubtasks[targetIndex];
    if (currentIndex < 0 || !target) return;
    await db.transaction('rw', db.subtasks, db.activityHistory, async () => {
      await db.subtasks.update(subtask.id, { order: target.order, updatedAt: nowIso() });
      await db.subtasks.update(target.id, { order: subtask.order, updatedAt: nowIso() });
      await addHistory(subtask.activityId, 'subtask_created', `Reordenaste "${subtask.title}"`);
    });
  },
  async addSubtask(activityId: string, stageId: string, title: string) {
    const timestamp = nowIso();
    const order = await db.subtasks.where('stageId').equals(stageId).count();
    await db.subtasks.add({ id: createId(), activityId, stageId, title: title.trim(), isCompleted: false, order, createdAt: timestamp, updatedAt: timestamp });
    await db.activities.update(activityId, { status: 'in_progress', updatedAt: timestamp });
    await addHistory(activityId, 'subtask_created', `Agregaste "${title.trim()}"`);
  },


  async deleteSubtask(subtask: Subtask) {
    await db.transaction('rw', db.subtasks, db.activities, db.activityHistory, async () => {
      await db.subtasks.delete(subtask.id);
      const siblings = await db.subtasks.where('stageId').equals(subtask.stageId).sortBy('order');
      await Promise.all(siblings.map((item, index) => db.subtasks.update(item.id, { order: index, updatedAt: nowIso() })));
      await db.activities.update(subtask.activityId, { status: 'in_progress', updatedAt: nowIso() });
      await addHistory(subtask.activityId, 'subtask_deleted', `Eliminaste "${subtask.title}"`);
    });
  },
  async addNote(activityId: string, content: string) {
    const timestamp = nowIso();
    const note: Note = { id: createId(), activityId, content: content.trim(), createdAt: timestamp, updatedAt: timestamp };
    await db.notes.add(note);
    await addHistory(activityId, 'note_created', 'Agregaste una nota');
  },

  async setReviewCheck(activityId: string, key: 'reviewedSteps' | 'confirmedNoPending', value: boolean) {
    const activity = await db.activities.get(activityId);
    if (!activity) return;
    await db.activities.update(activityId, { reviewChecklist: { ...activity.reviewChecklist, [key]: value }, updatedAt: nowIso() });
    await addHistory(activityId, 'review_checked', 'Actualizaste el doble check final');
  },


  async restoreBackup(backup: TaskFlowBackup) {
    await db.transaction('rw', [db.courses, db.projects, db.activities, db.taskStages, db.subtasks, db.notes, db.activityHistory, db.resourceLinks, db.settings], async () => {
      await Promise.all([
        db.courses.clear(),
        db.projects.clear(),
        db.activities.clear(),
        db.taskStages.clear(),
        db.subtasks.clear(),
        db.notes.clear(),
        db.activityHistory.clear(),
        db.resourceLinks.clear(),
        db.settings.clear()
      ]);
      await db.courses.bulkAdd(backup.data.courses);
      await db.projects.bulkAdd(backup.data.projects);
      await db.activities.bulkAdd(backup.data.activities);
      await db.taskStages.bulkAdd(backup.data.taskStages);
      await db.subtasks.bulkAdd(backup.data.subtasks);
      await db.notes.bulkAdd(backup.data.notes);
      await db.activityHistory.bulkAdd(backup.data.activityHistory);
      await db.resourceLinks.bulkAdd(backup.data.resourceLinks);
      await db.settings.bulkAdd(backup.data.settings);
    });
  },
  async deleteActivity(activityId: string) {
    await db.transaction('rw', [db.activities, db.taskStages, db.subtasks, db.notes, db.activityHistory, db.resourceLinks], async () => {
      await db.subtasks.where('activityId').equals(activityId).delete();
      await db.taskStages.where('activityId').equals(activityId).delete();
      await db.notes.where('activityId').equals(activityId).delete();
      await db.activityHistory.where('activityId').equals(activityId).delete();
      await db.resourceLinks.where('activityId').equals(activityId).delete();
      await db.activities.delete(activityId);
    });
  },

  async deleteProject(projectId: string) {
    const relatedActivities = await db.activities.where('projectId').equals(projectId).count();
    if (relatedActivities > 0) throw new Error('No puedes eliminar un proyecto con tareas asociadas. Elimina primero sus tareas.');
    await db.projects.delete(projectId);
  },

  async deleteCourse(courseId: string) {
    const relatedActivities = await db.activities.where('courseId').equals(courseId).count();
    if (relatedActivities > 0) throw new Error('No puedes eliminar un curso con actividades asociadas. Elimina primero sus actividades.');
    await db.courses.delete(courseId);
  }
};
