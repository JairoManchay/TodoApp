export type AreaType = 'university' | 'work' | 'personal';
export type ActivityStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'archived';
export type ActivityPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ActivityType = 'exam' | 'graded_practice' | 'pc' | 'presentation' | 'homework' | 'project' | 'lab' | 'report' | 'delivery' | 'reading' | 'feature' | 'bugfix' | 'documentation' | 'meeting' | 'gym' | 'shopping' | 'errand' | 'payment' | 'appointment' | 'reminder' | 'personal_goal' | 'other';
export type HistoryEventType = 'created' | 'started' | 'stage_created' | 'subtask_created' | 'subtask_completed' | 'subtask_reopened' | 'subtask_deleted' | 'moved_to_review' | 'review_checked' | 'completed' | 'archived' | 'note_created';

export interface Course { id: string; name: string; description?: string; color?: string; isArchived: boolean; createdAt: string; updatedAt: string; }
export interface Project { id: string; name: string; description?: string; color?: string; isArchived: boolean; createdAt: string; updatedAt: string; }
export interface ReviewChecklist { reviewedSteps: boolean; confirmedNoPending: boolean; }
export interface Activity { id: string; title: string; description?: string; area: AreaType; type: ActivityType; courseId?: string; projectId?: string; personalCategory?: string; priority: ActivityPriority; status: ActivityStatus; dueDate?: string; startDate?: string; completedAt?: string; archivedAt?: string; reviewChecklist: ReviewChecklist; order: number; createdAt: string; updatedAt: string; }
export interface TaskStage { id: string; activityId: string; title: string; description?: string; order: number; isCollapsed: boolean; createdAt: string; updatedAt: string; }
export interface Subtask { id: string; activityId: string; stageId: string; title: string; notes?: string; isCompleted: boolean; completedAt?: string; order: number; createdAt: string; updatedAt: string; }
export interface Note { id: string; activityId: string; content: string; createdAt: string; updatedAt: string; }
export interface ActivityHistory { id: string; activityId: string; type: HistoryEventType; message: string; metadata?: Record<string, unknown>; createdAt: string; }
export interface ResourceLink { id: string; activityId: string; name: string; url?: string; description?: string; createdAt: string; updatedAt: string; }
export interface Settings { id: 'app-settings'; userName: string; theme: 'light' | 'dark' | 'system'; autoMoveToReview: boolean; defaultArea: AreaType; createdAt: string; updatedAt: string; }
export interface ActivityProgress { totalSubtasks: number; completedSubtasks: number; percentage: number; label: string; }
export interface ActivityDraft { title: string; description?: string; area: AreaType; type: ActivityType; courseName?: string; projectName?: string; personalCategory?: string; priority: ActivityPriority; startDate?: string; dueDate?: string; stages: Array<{ title: string; subtasks: string[] }>; }
export interface TaskFlowBackup { appName: 'TaskFlow'; schemaVersion: 1; exportedAt: string; data: { courses: Course[]; projects: Project[]; activities: Activity[]; taskStages: TaskStage[]; subtasks: Subtask[]; notes: Note[]; activityHistory: ActivityHistory[]; resourceLinks: ResourceLink[]; settings: Settings[]; }; }



