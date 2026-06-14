import { Outlet, NavLink } from 'react-router-dom';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/groups',   icon: 'group',         label: 'Grupos'    },
  { to: '/matches',  icon: 'emoji_events',  label: 'Partidos'  },
  { to: '/rankings', icon: 'leaderboard',   label: 'Rankings'  },
  { to: '/profile',  icon: 'person',        label: 'Perfil'    },
];

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-(--color-surface)">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-(--color-surface) shadow-sm flex items-center justify-between px-4 h-16 w-full">
        <div className="flex items-center gap-2">
          <MaterialIcon icon="sports_soccer" className="text-(--color-stadium-green-light) text-3xl" />
          <span className="text-xl font-bold text-(--color-stadium-green-dark) tracking-tight">
            Mundialito
          </span>
        </div>
        <button
          aria-label="Notificaciones"
          className="p-2 rounded-full hover:bg-(--color-surface-container) transition-colors"
        >
          <MaterialIcon icon="notifications" className="text-(--color-on-surface-variant)" />
        </button>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-[720px] w-full mx-auto px-4 pb-32">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-(--color-jersey-white) shadow-[0px_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl pb-safe">
        <div className="flex justify-around items-center px-4 py-2">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 transition-all duration-150',
                  isActive
                    ? 'bg-(--color-primary-container) text-(--color-on-primary-container) rounded-full px-4 py-1'
                    : 'text-(--color-on-surface-variant) p-2',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <MaterialIcon
                    icon={icon}
                    filled={isActive}
                    className="text-[24px]"
                  />
                  <span className="text-[12px] font-medium leading-4">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
