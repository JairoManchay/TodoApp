import type { Activity, ActivityPriority, ActivityStatus, ActivityType } from '../types/taskflow';
import { activityOverlapsRange } from './format';

export interface AreaFilters {
  startDate: string;
  endDate: string;
  type: 'all' | ActivityType;
  priority: 'all' | ActivityPriority;
  status: 'all' | ActivityStatus;
}

export const emptyAreaFilters: AreaFilters = {
  startDate: '',
  endDate: '',
  type: 'all',
  priority: 'all',
  status: 'all'
};

export function hasInvalidAreaFilterRange(filters: AreaFilters) {
  return Boolean(filters.startDate && filters.endDate && filters.endDate < filters.startDate);
}

export function filterActivities(activities: Activity[], filters: AreaFilters) {
  if (hasInvalidAreaFilterRange(filters)) return [];

  return activities.filter((activity) => {
    const dateMatch = activityOverlapsRange(activity.startDate, activity.dueDate, filters.startDate, filters.endDate);
    const typeMatch = filters.type === 'all' || activity.type === filters.type;
    const priorityMatch = filters.priority === 'all' || activity.priority === filters.priority;
    const statusMatch = filters.status === 'all' || activity.status === filters.status;
    return dateMatch && typeMatch && priorityMatch && statusMatch;
  });
}
