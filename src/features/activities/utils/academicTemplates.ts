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
  homework: [
    { title: 'Desarrollo', subtasks: ['Leer indicaciones', 'Resolver el trabajo', 'Guardar evidencias'] },
    { title: 'Revision', subtasks: ['Revisar formato', 'Corregir errores', 'Confirmar entrega'] }
  ],
  project: [
    { title: 'Planificacion', subtasks: ['Definir alcance', 'Dividir tareas', 'Acordar responsabilidades'] },
    { title: 'Ejecucion', subtasks: ['Desarrollar entregables', 'Revisar avances', 'Resolver bloqueos'] },
    { title: 'Entrega', subtasks: ['Consolidar version final', 'Validar requisitos', 'Enviar proyecto'] }
  ],
  presentation: [
    { title: 'Investigacion', subtasks: ['Definir tema central', 'Buscar fuentes', 'Seleccionar ideas clave'] },
    { title: 'Material', subtasks: ['Armar diapositivas', 'Preparar ejemplos', 'Revisar ortografia'] },
    { title: 'Ensayo', subtasks: ['Practicar exposicion', 'Medir tiempo', 'Preparar respuestas'] }
  ],
  reading: [
    { title: 'Repaso', subtasks: ['Revisar apuntes', 'Subrayar ideas clave', 'Anotar dudas'] },
    { title: 'Refuerzo', subtasks: ['Resolver ejercicios', 'Crear resumen', 'Repasar puntos debiles'] }
  ],
  reminder: [
    { title: 'Recordatorio', subtasks: ['Confirmar pendiente', 'Revisar fecha', 'Marcar como completado'] }
  ],
  graded_practice: [
    { title: 'Practica', subtasks: ['Revisar indicaciones', 'Practicar ejercicios clave', 'Confirmar fecha y temas'] },
    { title: 'Cierre', subtasks: ['Resolver simulacro', 'Revisar respuestas', 'Anotar dudas finales'] }
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
  ]
};

export function getAcademicTemplate(type: ActivityType): StageDraft[] {
  return (templates[type] ?? templates.reminder ?? []).map((stage) => ({
    title: stage.title,
    subtasks: [...stage.subtasks]
  }));
}

export function hasAcademicTemplate(type: ActivityType) {
  return Boolean(templates[type]);
}