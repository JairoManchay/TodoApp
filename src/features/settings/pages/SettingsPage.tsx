import { AlertTriangle, Database, Download, FileJson, FileSpreadsheet, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { buildBackup, downloadJson, exportActivitiesExcel, getBackupSummary, readBackupFile } from '../../../services/backupService';
import type { TaskFlowBackup } from '../../../types/taskflow';
import { useActivityStore } from '../../activities/stores/activityStore';

const LAST_BACKUP_KEY = 'taskflow:last-backup-at';

function formatDateTime(value?: string | null) {
  if (!value) return 'Aun no registras backup en este navegador';
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function SettingsPage() {
  const data = useActivityStore();
  const restoreBackup = useActivityStore((state) => state.restoreBackup);
  const [lastBackupAt, setLastBackupAt] = useState(() => localStorage.getItem(LAST_BACKUP_KEY));
  const [importCandidate, setImportCandidate] = useState<TaskFlowBackup | null>(null);
  const [importMessage, setImportMessage] = useState('');
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const backup = useMemo(() => buildBackup(data), [data]);
  const summary = getBackupSummary(backup);
  const candidateSummary = importCandidate ? getBackupSummary(importCandidate) : null;
  const currentOrigin = window.location.origin;

  function handleExportJson() {
    downloadJson(`taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`, backup);
    const timestamp = new Date().toISOString();
    localStorage.setItem(LAST_BACKUP_KEY, timestamp);
    setLastBackupAt(timestamp);
    setImportMessage('Backup JSON generado correctamente.');
  }

  async function handleImportFile(file?: File) {
    setImportCandidate(null);
    if (!file) return;
    const result = await readBackupFile(file);
    if (!result.ok) {
      setImportMessage(result.message);
      return;
    }
    setImportCandidate(result.backup);
    setImportMessage('Backup validado. Revisa el resumen antes de restaurar.');
  }

  async function handleRestore() {
    if (!importCandidate) return;
    await restoreBackup(importCandidate);
    setIsRestoreOpen(false);
    setImportCandidate(null);
    setImportMessage('Backup restaurado correctamente.');
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-medium text-teal-700">Ajustes</p>
        <h1 className="text-2xl font-semibold">Configuracion y respaldos</h1>
      </header>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} />
          <div>
            <h2 className="font-semibold text-amber-900">Recordatorio de backup</h2>
            <p className="mt-1 text-sm text-amber-800">Tus datos viven en IndexedDB para esta URL. Antes de cambiar de navegador, limpiar datos, publicar en Vercel o usar otra URL, exporta un backup JSON.</p>
            <p className="mt-2 text-sm font-medium text-amber-900">Ultimo backup: {formatDateTime(lastBackupAt)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2"><Database className="text-teal-700" size={18} /><h2 className="font-semibold">Origen actual de datos</h2></div>
          <dl className="space-y-2 text-sm">
            <div><dt className="font-medium text-slate-700">URL</dt><dd className="break-all text-slate-500">{currentOrigin}</dd></div>
            <div><dt className="font-medium text-slate-700">Base IndexedDB</dt><dd className="text-slate-500">taskflow-db</dd></div>
          </dl>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2"><FileJson className="text-teal-700" size={18} /><h2 className="font-semibold">Contenido exportable</h2></div>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
            <p>Actividades: <strong>{summary.activities}</strong></p>
            <p>Etapas: <strong>{summary.stages}</strong></p>
            <p>Subtareas: <strong>{summary.subtasks}</strong></p>
            <p>Notas: <strong>{summary.notes}</strong></p>
            <p>Cursos: <strong>{summary.courses}</strong></p>
            <p>Proyectos: <strong>{summary.projects}</strong></p>
            <p>Historial: <strong>{summary.history}</strong></p>
            <p>Recursos: <strong>{summary.resourceLinks}</strong></p>
          </div>
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <button className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm" onClick={handleExportJson}>
          <Download className="text-teal-700" />
          <span><strong>Crear backup JSON</strong><br /><small className="text-slate-500">Exporta toda la base local.</small></span>
        </button>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm">
          <Upload className="text-sky-700" />
          <span><strong>Importar backup JSON</strong><br /><small className="text-slate-500">Valida antes de restaurar.</small></span>
          <input accept="application/json" className="hidden" type="file" onChange={(event) => void handleImportFile(event.target.files?.[0])} />
        </label>

        <button className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm" onClick={() => exportActivitiesExcel(data)}>
          <FileSpreadsheet className="text-emerald-700" />
          <span><strong>Exportar Excel</strong><br /><small className="text-slate-500">Actividades en una hoja.</small></span>
        </button>
      </section>

      {importMessage ? <p className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-600">{importMessage}</p> : null}

      {candidateSummary ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Backup listo para restaurar</h2>
          <p className="mt-1 text-sm text-slate-500">Exportado: {formatDateTime(importCandidate?.exportedAt)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600 md:grid-cols-4">
            <p>Actividades: <strong>{candidateSummary.activities}</strong></p>
            <p>Etapas: <strong>{candidateSummary.stages}</strong></p>
            <p>Subtareas: <strong>{candidateSummary.subtasks}</strong></p>
            <p>Notas: <strong>{candidateSummary.notes}</strong></p>
            <p>Cursos: <strong>{candidateSummary.courses}</strong></p>
            <p>Proyectos: <strong>{candidateSummary.projects}</strong></p>
            <p>Historial: <strong>{candidateSummary.history}</strong></p>
            <p>Recursos: <strong>{candidateSummary.resourceLinks}</strong></p>
          </div>
          <button className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => setIsRestoreOpen(true)}>Restaurar este backup</button>
        </section>
      ) : null}

      <ConfirmDialog
        confirmLabel="Restaurar backup"
        description="Esto reemplazara todos los datos locales actuales por el contenido del backup seleccionado. Crea un backup actual antes de continuar si tienes dudas."
        isOpen={isRestoreOpen}
        onCancel={() => setIsRestoreOpen(false)}
        onConfirm={handleRestore}
        title="Restaurar datos"
      />
    </div>
  );
}
