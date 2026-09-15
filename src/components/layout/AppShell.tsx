import { CalendarDays, CheckCircle2, Home, Settings, UserRound, BriefcaseBusiness, GraduationCap } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const navigationItems = [
  { label: 'Inicio', icon: Home, to: '/' },
  { label: 'Universidad', icon: GraduationCap, to: '/university' },
  { label: 'Trabajo', icon: BriefcaseBusiness, to: '/work' },
  { label: 'Personal', icon: UserRound, to: '/personal' },
  { label: 'Calendario', icon: CalendarDays, to: '/calendar' },
  { label: 'Ajustes', icon: Settings, to: '/settings' }
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <NavLink className="mb-8 flex items-center gap-3 rounded-md px-2" to="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold">TaskFlow</p>
            <p className="text-xs text-slate-500">Guia de trabajo personal</p>
          </div>
        </NavLink>
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                  isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`
              }
              end={item.to === '/'}
              key={item.label}
              to={item.to}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="pb-20 lg:ml-64 lg:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-6 border-t border-slate-200 bg-white px-2 py-2 shadow-sm lg:hidden">
        {navigationItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-md py-1 text-[11px] ${isActive ? 'text-teal-800' : 'text-slate-600'}`
            }
            end={item.to === '/'}
            key={item.label}
            to={item.to}
          >
            <item.icon size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

