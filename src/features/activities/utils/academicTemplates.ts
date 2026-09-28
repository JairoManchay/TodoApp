import type { ActivityDraft, ActivityType } from '../../../types/taskflow';

export type StageDraft = ActivityDraft['stages'][number];

const templates: Partial<Record<ActivityType, StageDraft[]>> = {
  exam: [
    { title: 'Preparacion', subtasks: ['Revisar temario', 'Ordenar apuntes', 'Separar dudas principales'] },
    { title: 'Estudio', subtasks: ['Estudiar teoria', 'Resolver ejercicios', 'Repasar errores'] },
    { title: 'Repaso final', subtasks: ['Hacer simulacro', 'Revisar puntos debiles', 'Preparar materiales'] }
  ],
  pc: [
    { title: 'Practica', subtasks: ['Resolver ejercicios base', 'Practicar casos similares', 'Marcar dudas'] },
    { title: 'Revision', subtasks: ['Revisar procedimiento', 'Corregir errores frecuentes', 'Repasar formulas o conceptos'] }
  ],
  graded_practice: [
    { title: 'Preparacion', subtasks: ['Revisar indicaciones', 'Practicar ejercicios clave', 'Confirmar fecha y temas'] },
    { title: 'Cierre', subtasks: ['Resolver simulacro', 'Revisar respuestas', 'Anotar dudas finales'] }
  ],
  presentation: [
    { title: 'Investigacion', subtasks: ['Definir tema central', 'Buscar fuentes', 'Seleccionar ideas clave'] },
    { title: 'Material', subtasks: ['Armar diapositivas', 'Preparar ejemplos', 'Revisar ortografia'] },
    { title: 'Ensayo', subtasks: ['Practicar exposicion', 'Medir tiempo', 'Preparar respuestas'] }
  ],
  homework: [
    { title: 'Desarrollo', subtasks: ['Leer indicaciones', 'Resolver la tarea', 'Guardar evidencias'] },
    { title: 'Revision', subtasks: ['Revisar formato', 'Corregir errores', 'Confirmar entrega'] }
  ],
  project: [
    { title: 'Planificacion', subtasks: ['Definir alcance', 'Dividir tareas', 'Acordar responsabilidades'] },
    { title: 'Ejecucion', subtasks: ['Desarrollar entregables', 'Revisar avances', 'Resolver bloqueos'] },
    { title: 'Entrega', subtasks: ['Consolidar version final', 'Validar requisitos', 'Enviar proyecto'] }
  ],
  lab: [
    { title: 'Preparacion', subtasks: ['Revisar guia', 'Listar materiales', 'Repasar procedimiento'] },
    { title: 'Ejecucion', subtasks: ['Realizar practica', 'Registrar datos', 'Tomar evidencias'] },
    { title: 'Informe', subtasks: ['Analizar resultados', 'Redactar conclusiones', 'Revisar formato'] }
  ],
  report: [
    { title: 'Investigacion', subtasks: ['Reunir fuentes', 'Organizar informacion', 'Definir estructura'] },
    { title: 'Redaccion', subtasks: ['Escribir desarrollo', 'Agregar conclusiones', 'Citar fuentes'] },
    { title: 'Revision', subtasks: ['Revisar ortografia', 'Validar formato', 'Preparar entrega'] }
  ],
  delivery: [
    { title: 'Preparacion', subtasks: ['Confirmar requisitos', 'Completar pendientes', 'Revisar archivos'] },
    { title: 'Entrega', subtasks: ['Subir evidencia', 'Confirmar recepcion', 'Guardar comprobante'] }
  ],
  reading: [
    { title: 'Lectura', subtasks: ['Leer material', 'Subrayar ideas clave', 'Anotar dudas'] },
    { title: 'Resumen', subtasks: ['Crear resumen', 'Listar conceptos importantes', 'Preparar preguntas'] }
  ],
  other: [
    { title: 'Preparacion', subtasks: ['Definir objetivo', 'Listar pendientes', 'Organizar materiales'] },
    { title: 'Cierre', subtasks: ['Revisar avances', 'Confirmar pendientes', 'Registrar conclusiones'] }
  ]
};

export function getAcademicTemplate(type: ActivityType): StageDraft[] {
  return (templates[type] ?? templates.other ?? []).map((stage) => ({
    title: stage.title,
    subtasks: [...stage.subtasks]
  }));
}

export function hasAcademicTemplate(type: ActivityType) {
  return Boolean(templates[type]);
}