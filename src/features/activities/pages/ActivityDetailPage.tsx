import { ArrowDown, ArrowUp, CheckCircle2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AreaBadge, PriorityBadge, StatusBadge } from '../../../components/common/Badges';
import { ProgressBar } from '../../../components/common/ProgressBar';
import type { ActivityType, AreaType } from '../../../types/taskflow';
import { formatDateRange } from '../../../utils/format';
import { useActivityStore } from '../stores/activityStore';
const areaLabels: Record<AreaType, string> = { work: 'Trabajo', university: 'Universidad', personal: 'Personal' };

const detailTypeOptions: Record<AreaType, Array<{ value: ActivityType; label: string }>> = {
  work: [
    { value: 'feature', label: 'Funcionalidad' },
    { value: 'bugfix', label: 'Correccion' },
    { value: 'documentation', label: 'Documentacion' },
    { value: 'meeting', label: 'Reunion' },
    { value: 'other', label: 'Otro' }
  ],
  university: [
    { value: 'exam', label: 'Examen' },
    { value: 'pc', label: 'Practica' },
    { value: 'homework', label: 'Trabajo' },
    { value: 'project', label: 'Proyecto' },
    { value: 'presentation', label: 'Exposicion' },
    { value: 'reading', label: 'Repaso' },
    { value: 'reminder', label: 'Recordatorio' }
  ],
  personal: [
    { value: 'gym', label: 'Gimnasio' },
    { value: 'shopping', label: 'Compras' },
    { value: 'errand', label: 'Tramite' },
    { value: 'payment', label: 'Pago' },
    { value: 'appointment', label: 'Cita' },
    { value: 'reminder', label: 'Recordatorio' },
    { value: 'personal_goal', label: 'Objetivo' },
    { value: 'other', label: 'Otro' }
  ]
};

function defaultTypeForArea(area: AreaType): ActivityType {
  return detailTypeOptions[area][0].value;
}

export function ActivityDetailPage() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const {
    activities,
    courses,
    projects,
    taskStages,
    subtasks,
    notes,
    activityHistory,
    getProgress,
    toggleSubtask,
    addSubtask,
    addStage,
    addNote,
    moveSubtask,
    deleteSubtask,
    restartActivity,
    setStatus,
    updateDueDate,
    updateActivityArea,
    setReviewCheck,
    deleteActivity
  } = useActivityStore();
  const [tab, setTab] = useState<'checklist' | 'missing' | 'notes' | 'history'>('checklist');
  const [newSubtask, setNewSubtask] = useState<Record<string, string>>({});
  const [newStageTitle, setNewStageTitle] = useState('');
  const [note, setNote] = useState('');
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [dueDateDraft, setDueDateDraft] = useState('');
  const [isEditingArea, setIsEditingArea] = useState(false);
  const [areaDraft, setAreaDraft] = useState<AreaType>('work');
  const [typeDraft, setTypeDraft] = useState<ActivityType>('feature');
  const [groupDraft, setGroupDraft] = useState('');
  const activity = activities.find((item) => item.id === activityId);

  if (!activity) {
    return <div className="p-6"><p className="text-sm text-slate-500">Actividad no encontrada.</p><Link className="mt-3 inline-block text-sm font-medium text-teal-700" to="/activities">Volver</Link></div>;
  }

  const selectedActivity = activity;
  const stages = taskStages.filter((stage) => stage.activityId === selectedActivity.id).sort((a, b) => a.order - b.order);
  const activitySubtasks = subtasks.filter((subtask) => subtask.activityId === selectedActivity.id);
  const pending = activitySubtasks.filter((subtask) => !subtask.isCompleted);
  const completed = activitySubtasks.filter((subtask) => subtask.isCompleted);
  const progress = getProgress(selectedActivity.id);
  const canFinish = selectedActivity.status === 'review' && pending.length === 0 && selectedActivity.reviewChecklist.reviewedSteps && selectedActivity.reviewChecklist.confirmedNoPending;

  async function handleAddStage() {
    await addStage(selectedActivity.id, newStageTitle);
    setNewStageTitle('');
  }

  async function removeActivity() {
    await deleteActivity(selectedActivity.id);
    navigate('/activities');
  }

  async function saveDueDate() {
    if (selectedActivity.startDate && dueDateDraft && dueDateDraft < selectedActivity.startDate) return;
    await updateDueDate(selectedActivity.id, dueDateDraft || undefined);
    setIsEditingDueDate(false);
  }

  function openAreaEditor() {
    setAreaDraft(selectedActivity.area);
    setTypeDraft(selectedActivity.type);
    setGroupDraft(selectedActivity.area === 'work' ? projects.find((project) => project.id === selectedActivity.projectId)?.name ?? '' : selectedActivity.area === 'university' ? courses.find((course) => course.id === selectedActivity.courseId)?.name ?? '' : selectedActivity.personalCategory ?? '');
    setIsEditingArea(true);
  }

  function changeArea(area: AreaType) {
    setAreaDraft(area);
    setTypeDraft(defaultTypeForArea(area));
    setGroupDraft('');
  }

  async function saveAreaChange() {
    if ((areaDraft === 'work' || areaDraft === 'university') && !groupDraft.trim()) return;
    await updateActivityArea(selectedActivity.id, {
      area: areaDraft,
      type: typeDraft,
      projectName: areaDraft === 'work' ? groupDraft : undefined,
      courseName: areaDraft === 'university' ? groupDraft : undefined,
      personalCategory: areaDraft === 'personal' ? groupDraft : undefined
    });
    setIsEditingArea(false);
  }
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">Detalle de actividad</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">{selectedActivity.title}</h1>
            <p className="mt-2 text-sm text-slate-500">Fecha: {formatDateRange(selectedActivity.startDate, selectedActivity.dueDate)}</p>
            {isEditingDueDate ? (
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label><span className="text-xs font-medium text-slate-500">Fecha inicio registrada</span><input className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-500" disabled type="date" value={selectedActivity.startDate || ''} /></label>
                  <label><span className="text-xs font-medium text-slate-500">Fecha fin</span><input aria-label="Fecha fin de la actividad" className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" min={selectedActivity.startDate || undefined} type="date" value={dueDateDraft} onChange={(event) => setDueDateDraft(event.target.value)} /></label>
                </div>
                {selectedActivity.startDate && dueDateDraft && dueDateDraft < selectedActivity.startDate ? <p className="mt-2 text-sm text-red-600">La fecha fin debe ser igual o posterior a la fecha inicio registrada.</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white" onClick={saveDueDate}>Guardar fecha fin</button>
                  <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" onClick={() => setIsEditingDueDate(false)}>Cancelar</button>
                  <button className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-700" onClick={() => { void updateDueDate(selectedActivity.id, undefined); setDueDateDraft(''); setIsEditingDueDate(false); }}>Quitar fecha fin</button>
                </div>
              </div>
            ) : null}
            {isEditingArea ? (
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <label><span className="text-xs font-medium text-slate-500">Modulo</span><select className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={areaDraft} onChange={(event) => changeArea(event.target.value as AreaType)}>{(['work', 'university', 'personal'] as AreaType[]).map((area) => <option key={area} value={area}>{areaLabels[area]}</option>)}</select></label>
                  <label><span className="text-xs font-medium text-slate-500">Tipo</span><select className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={typeDraft} onChange={(event) => setTypeDraft(event.target.value as ActivityType)}>{detailTypeOptions[areaDraft].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                  <label><span className="text-xs font-medium text-slate-500">{areaDraft === 'work' ? 'Proyecto' : areaDraft === 'university' ? 'Curso' : 'Categoria'}</span><input className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" placeholder={areaDraft === 'work' ? 'Ej. Proyecto web' : areaDraft === 'university' ? 'Ej. Inmunologia' : 'Ej. Salud'} value={groupDraft} onChange={(event) => setGroupDraft(event.target.value)} /></label>
                </div>
                {(areaDraft === 'work' || areaDraft === 'university') && !groupDraft.trim() ? <p className="mt-2 text-sm text-amber-700">Indica {areaDraft === 'work' ? 'un proyecto' : 'un curso'} para que la actividad aparezca en su modulo.</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:bg-slate-300" disabled={(areaDraft === 'work' || areaDraft === 'university') && !groupDraft.trim()} onClick={saveAreaChange}>Guardar modulo</button>
                  <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" onClick={() => setIsEditingArea(false)}>Cancelar</button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2"><AreaBadge area={selectedActivity.area} /><PriorityBadge priority={selectedActivity.priority} /><StatusBadge status={selectedActivity.status} /></div>
        </div>
        <div className="mt-5"><ProgressBar completed={progress.completedSubtasks} total={progress.totalSubtasks} percentage={progress.percentage} /></div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm" onClick={() => restartActivity(selectedActivity.id)}><RotateCcw size={16} />Iniciar</button>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm" onClick={() => { setDueDateDraft(selectedActivity.dueDate || ''); setIsEditingDueDate(true); }}>Editar fecha fin</button>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm" onClick={openAreaEditor}>Cambiar modulo</button>
          <button className="rounded-md border border-violet-200 px-3 py-2 text-sm text-violet-700" onClick={() => setStatus(selectedActivity.id, 'review')}>Pasar a revision</button>
          <button disabled={!canFinish} className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300" onClick={() => setStatus(selectedActivity.id, 'completed')}>Finalizar actividad</button>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm" onClick={() => setStatus(selectedActivity.id, 'archived')}>Archivar</button>
          <button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700" onClick={removeActivity} title="Eliminar actividad"><Trash2 size={16} /></button>
        </div>
      </header>

      <nav className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {(['checklist', 'missing', 'notes', 'history'] as const).map((item) => <button className={`px-3 py-2 text-sm font-medium ${tab === item ? 'border-b-2 border-teal-700 text-teal-800' : 'text-slate-500'}`} key={item} onClick={() => setTab(item)}>{item === 'checklist' ? 'Checklist' : item === 'missing' ? 'Que me falta' : item === 'notes' ? 'Notas' : 'Historial'}</button>)}
      </nav>

      {tab === 'checklist' ? (
        <section className="space-y-3">
          {stages.map((stage) => {
            const stageSubtasks = activitySubtasks.filter((subtask) => subtask.stageId === stage.id).sort((a, b) => a.order - b.order);
            const done = stageSubtasks.filter((subtask) => subtask.isCompleted).length;
            return (
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={stage.id}>
                <h2 className="font-semibold">{stage.title} <span className="text-sm font-normal text-slate-500">{done}/{stageSubtasks.length}</span></h2>
                <div className="mt-3 space-y-2">
                  {stageSubtasks.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-500">Falta construir tu primera Tarea</p> : null}
                  {stageSubtasks.map((subtask, index) => (
                    <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-md border border-slate-100 p-3 text-sm" key={subtask.id}>
                      <input className="mt-1 h-4 w-4" type="checkbox" checked={subtask.isCompleted} onChange={() => toggleSubtask(subtask)} />
                      <span className={subtask.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}>{subtask.title}</span>
                      <div className="flex gap-1">
                        <button disabled={index === 0} className="rounded-md border border-slate-200 p-1 text-slate-500 disabled:opacity-30" onClick={() => moveSubtask(subtask, 'up')} title="Subir subtarea"><ArrowUp size={15} /></button>
                        <button disabled={index === stageSubtasks.length - 1} className="rounded-md border border-slate-200 p-1 text-slate-500 disabled:opacity-30" onClick={() => moveSubtask(subtask, 'down')} title="Bajar subtarea"><ArrowDown size={15} /></button>
                        <button className="rounded-md border border-red-200 p-1 text-red-600" onClick={() => deleteSubtask(subtask)} title="Eliminar subtarea"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input className="h-10 flex-1 rounded-md border border-slate-200 px-3 text-sm" placeholder="Agregar pendiente descubierto" value={newSubtask[stage.id] ?? ''} onChange={(event) => setNewSubtask({ ...newSubtask, [stage.id]: event.target.value })} />
                  <button className="h-10 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white" onClick={() => { void addSubtask(selectedActivity.id, stage.id, newSubtask[stage.id] ?? ''); setNewSubtask({ ...newSubtask, [stage.id]: '' }); }}><Plus size={16} /></button>
                </div>
              </article>
            );
          })}

          <article className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
            <h2 className="font-semibold">Agregar etapa</h2>
            <div className="mt-3 flex gap-2"><input className="h-10 flex-1 rounded-md border border-slate-200 px-3 text-sm" placeholder="Nombre de la nueva etapa" value={newStageTitle} onChange={(event) => setNewStageTitle(event.target.value)} /><button className="h-10 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white" onClick={handleAddStage}>Crear etapa</button></div>
          </article>

          <article className="rounded-lg border border-violet-200 bg-violet-50 p-4">
            <h2 className="font-semibold text-violet-900">Doble check final</h2>
            <label className="mt-3 flex gap-3 text-sm"><input type="checkbox" checked={selectedActivity.reviewChecklist.reviewedSteps} onChange={(event) => setReviewCheck(selectedActivity.id, 'reviewedSteps', event.target.checked)} />Revise todos los pasos</label>
            <label className="mt-2 flex gap-3 text-sm"><input type="checkbox" checked={selectedActivity.reviewChecklist.confirmedNoPending} onChange={(event) => setReviewCheck(selectedActivity.id, 'confirmedNoPending', event.target.checked)} />Confirme que no existe ningun pendiente</label>
          </article>
        </section>
      ) : null}

      {tab === 'missing' ? <section className="grid gap-4 md:grid-cols-2"><article className="rounded-lg border border-emerald-200 bg-white p-4"><h2 className="mb-3 flex items-center gap-2 font-semibold text-emerald-700"><CheckCircle2 size={18} />Completado</h2>{completed.length === 0 ? <p className="text-sm text-slate-500">Aun no completaste tareas.</p> : null}{completed.map((item) => <p className="py-1 text-sm text-slate-600" key={item.id}>{item.title}</p>)}</article><article className="rounded-lg border border-amber-200 bg-white p-4"><h2 className="mb-3 font-semibold text-amber-700">Te falta</h2>{pending.map((item) => <p className="py-1 text-sm text-slate-700" key={item.id}>{item.title}</p>)}{pending.length === 0 ? <p className="text-sm text-slate-500">Falta construir tu primera Tarea o ya no queda nada pendiente.</p> : null}</article></section> : null}
      {tab === 'notes' ? <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><textarea className="min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm" placeholder="Escribe una nota de apoyo" value={note} onChange={(event) => setNote(event.target.value)} /><button className="mt-3 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => { void addNote(selectedActivity.id, note); setNote(''); }}>Guardar nota</button><div className="mt-4 space-y-2">{notes.filter((item) => item.activityId === selectedActivity.id).map((item) => <p className="rounded-md bg-slate-50 p-3 text-sm" key={item.id}>{item.content}</p>)}</div></section> : null}
      {tab === 'history' ? <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">{activityHistory.filter((item) => item.activityId === selectedActivity.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((item) => <p className="border-b border-slate-100 py-3 text-sm" key={item.id}><span className="text-slate-400">{new Date(item.createdAt).toLocaleString('es-PE')}</span> - {item.message}</p>)}</section> : null}
    </div>
  );
}
