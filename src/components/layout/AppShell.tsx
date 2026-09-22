import { BriefcaseBusiness, CalendarDays, CheckCircle2, GraduationCap, Home, Layers3, MoreHorizontal, Settings, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navigationItems = [
  { label: 'Inicio', icon: Home, to: '/' },
  { label: 'Universidad', icon: GraduationCap, to: '/university' },
  { label: 'Trabajo', icon: BriefcaseBusiness, to: '/work' },
  { label: 'Personal', icon: UserRound, to: '/personal' },
  { label: 'Calendario', icon: CalendarDays, to: '/calendar' },
  { label: 'Ajustes', icon: Settings, to: '/settings' }
];

const areaItems = [
  { label: 'Trabajo', icon: BriefcaseBusiness, to: '/work' },
  { label: 'Universidad', icon: GraduationCap, to: '/university' },
  { label: 'Personal', icon: UserRound, to: '/personal' }
];

const moreItems = [
  { label: 'Actividades', icon: CheckCircle2, to: '/activities' },
  { label: 'Calendario', icon: CalendarDays, to: '/calendar' },
  { label: 'Ajustes', icon: Settings, to: '/settings' }
];

interface AppShellProps {
  children: ReactNode;
}

type MobileMenu = 'areas' | 'more' | null;

export function AppShell({ children }: AppShellProps) {
  const [openMenu, setOpenMenu] = useState<MobileMenu>(null);
  const location = useLocation();
  const isAreaActive = areaItems.some((item) => location.pathname.startsWith(item.to));
  const isMoreActive = moreItems.some((item) => item.to !== '/' && location.pathname.startsWith(item.to));

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

      {openMenu ? (
        <button className="fixed inset-0 z-30 bg-slate-950/10 lg:hidden" onClick={() => setOpenMenu(null)} title="Cerrar menú" type="button" />
      ) : null}

      {openMenu ? (
        <div className="fixed inset-x-3 bottom-20 z-40 rounded-lg border border-slate-200 bg-white p-2 shadow-lg lg:hidden">
          {(openMenu === 'areas' ? areaItems : moreItems).map((item) => (
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold ${isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-700'}`
              }
              key={item.label}
              onClick={() => setOpenMenu(null)}
              to={item.to}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-slate-200 bg-white px-3 py-2 shadow-sm lg:hidden">
        <NavLink
          className={({ isActive }) => `flex flex-col items-center gap-1 rounded-md py-1 text-[11px] ${isActive ? 'text-teal-800' : 'text-slate-600'}`}
          end
          onClick={() => setOpenMenu(null)}
          to="/"
        >
          <Home size={19} />
          <span>Inicio</span>
        </NavLink>
        <button className={`flex flex-col items-center gap-1 rounded-md py-1 text-[11px] ${isAreaActive || openMenu === 'areas' ? 'text-teal-800' : 'text-slate-600'}`} onClick={() => setOpenMenu(openMenu === 'areas' ? null : 'areas')} type="button">
          <Layers3 size={19} />
          <span>Áreas</span>
        </button>
        <button className={`flex flex-col items-center gap-1 rounded-md py-1 text-[11px] ${isMoreActive || openMenu === 'more' ? 'text-teal-800' : 'text-slate-600'}`} onClick={() => setOpenMenu(openMenu === 'more' ? null : 'more')} type="button">
          <MoreHorizontal size={19} />
          <span>Más</span>
        </button>
      </nav>
    </div>
  );
}


