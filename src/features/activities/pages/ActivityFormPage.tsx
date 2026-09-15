import { BriefcaseBusiness, Dumbbell, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ActivityDraft, ActivityType, AreaType } from '../../../types/taskflow';
import { useActivityStore } from '../stores/activityStore';

const defaultStage = { title: 'Preparacion', subtasks: [''] };

const areaOptions: Array<{ value: AreaType; label: string; icon: typeof BriefcaseBusiness }> = [
  { value: 'work', label: 'Trabajo', icon: BriefcaseBusiness },
  { value: 'university', label: 'Universidad', icon: GraduationCap },
  { value: 'personal', label: 'Personal', icon: Dumbbell }
];

const typeOptions: Record<AreaType, Array<{ value: ActivityType; label: string }>> = {
  work: [
    { value: 'feature', label: 'Funcionalidad' },
    { value: 'bugfix', label: 'Correccion' },
    { value: 'documentation', label: 'Documentacion' },
    { value: 'meeting', label: 'Reunion' },
    { value: 'other', label: 'Otro' }
  ],
  university: [
    { value: 'exam', label: 'Examen' },
    { value: 'pc', label: 'PC' },
    { value: 'presentation', label: 'Exposicion' },
    { value: 'homework', label: 'Tarea' },
    { value: 'lab', label: 'Laboratorio' },
    { value: 'report', label: 'Informe' },
    { value: 'reading', label: 'Lectura' },
    { value: 'other', label: 'Otro' }
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
  return typeOptions[area][0].value;
}

export function ActivityFormPage() {
  const navigate = useNavigate();
  const createActivity = useActivityStore((state) => state.createActivity);
  const [draft, setDraft] = useState<ActivityDraft>({ title: '', description: '', area: 'work', type: 'feature', projectName: '', courseName: '', personalCategory: '', priority: 'medium', dueDate: '', stages: [defaultStage] });

  function updateArea(area: AreaType) {
    setDraft((current) => ({ ...current, area, type: defaultTypeForArea(area) }));
  }

  function updateStage(index: number, title: string) { setDraft((current) => ({ ...current, stages: current.stages.map((stage, stageIndex) => stageIndex === index ? { ...stage, title } : stage) })); }
  function updateSubtask(stageIndex: number, subtaskIndex: number, title: string) { setDraft((current) => ({ ...current, stages: current.stages.map((stage, index) => index === stageIndex ? { ...stage, subtasks: stage.subtasks.map((item, itemIndex) => itemIndex === subtaskIndex ? title : item) } : stage) })); }
  function addStage() { setDraft((current) => ({ ...current, stages: [...current.stages, { title: '', subtasks: [''] }] })); }
  function addSubtask(stageIndex: number) { setDraft((current) => ({ ...current, stages: current.stages.map((stage, index) => index === stageIndex ? { ...stage, subtasks: [...stage.subtasks, ''] } : stage) })); }
  function removeStage(stageIndex: number) { setDraft((current) => ({ ...current, stages: current.stages.filter((_, index) => index !== stageIndex) })); }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    const activityId = await createActivity({ ...draft, stages: draft.stages.map((stage) => ({ ...stage, subtasks: stage.subtasks.filter(Boolean) })).filter((stage) => stage.title.trim()) });
    navigate(`/activities/${activityId}`);
  }

  return (
    <form className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8" onSubmit={handleSubmit}>
      <header><p className="text-sm font-medium text-teal-700">Nueva actividad</p><h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">Crear guia de trabajo</h1></header>
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="md:col-span-2"><span className="text-sm font-medium">Titulo</span><input required className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>

        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">Area</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {areaOptions.map((option) => (
              <button className={`flex items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-medium ${draft.area === option.value ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-600'}`} key={option.value} type="button" onClick={() => updateArea(option.value)}>
                <option.icon size={18} />
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">Tipo de actividad</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {typeOptions[draft.area].map((option) => (
              <button className={`rounded-md border px-3 py-2 text-sm font-medium ${draft.type === option.value ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-600'}`} key={option.value} type="button" onClick={() => setDraft({ ...draft, type: option.value })}>
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label><span className="text-sm font-medium">Prioridad</span><select className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as ActivityDraft['priority'] })}><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></label>
        <label><span className="text-sm font-medium">Fecha</span><input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label>
        {draft.area === 'work' ? <label className="md:col-span-2"><span className="text-sm font-medium">Proyecto de trabajo</span><input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" placeholder="Ej. IPS - Orquestador de pagos" value={draft.projectName} onChange={(event) => setDraft({ ...draft, projectName: event.target.value })} /></label> : null}
        {draft.area === 'university' ? <label className="md:col-span-2"><span className="text-sm font-medium">Curso</span><input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" placeholder="Ej. Inmunologia" value={draft.courseName} onChange={(event) => setDraft({ ...draft, courseName: event.target.value })} /></label> : null}
        {draft.area === 'personal' ? <label className="md:col-span-2"><span className="text-sm font-medium">Categoria personal</span><input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" placeholder="Ej. Salud, pagos, tramites" value={draft.personalCategory} onChange={(event) => setDraft({ ...draft, personalCategory: event.target.value })} /></label> : null}
        <label className="md:col-span-2"><span className="text-sm font-medium">Descripcion</span><textarea className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Etapas y subtareas</h2><button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium" type="button" onClick={addStage}><Plus size={16} />Etapa</button></div>
        {draft.stages.map((stage, stageIndex) => <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={stageIndex}><div className="flex gap-2"><input className="h-10 flex-1 rounded-md border border-slate-200 px-3 text-sm font-medium" placeholder="Nombre de etapa" value={stage.title} onChange={(event) => updateStage(stageIndex, event.target.value)} /><button className="h-10 w-10 rounded-md border border-slate-200 text-slate-500" type="button" onClick={() => removeStage(stageIndex)}><Trash2 className="mx-auto" size={16} /></button></div><div className="mt-3 space-y-2">{stage.subtasks.map((subtask, subtaskIndex) => <input className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" key={subtaskIndex} placeholder="Subtarea" value={subtask} onChange={(event) => updateSubtask(stageIndex, subtaskIndex, event.target.value)} />)}<button className="text-sm font-medium text-teal-700" type="button" onClick={() => addSubtask(stageIndex)}>Agregar subtarea</button></div></article>)}
      </section>
      <div className="flex justify-end"><button className="h-11 rounded-md bg-teal-700 px-5 text-sm font-semibold text-white" type="submit">Crear actividad</button></div>
    </form>
  );
}
