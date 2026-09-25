import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { ActivityDetailPage } from '../features/activities/pages/ActivityDetailPage';
import { ActivityFormPage } from '../features/activities/pages/ActivityFormPage';
import { ActivitiesPage } from '../features/activities/pages/ActivitiesPage';
import { CalendarPage } from '../features/calendar/pages/CalendarPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { PersonalPage } from '../features/personal/pages/PersonalPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { UniversityPage } from '../features/university/pages/UniversityPage';
import { WorkPage } from '../features/work/pages/WorkPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'activities', element: <ActivitiesPage /> },
      { path: 'activities/new', element: <ActivityFormPage /> },
      { path: 'activities/:activityId', element: <ActivityDetailPage /> },
      { path: 'university', element: <UniversityPage /> },
      { path: 'work', element: <WorkPage /> },
      { path: 'personal', element: <PersonalPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
]);
