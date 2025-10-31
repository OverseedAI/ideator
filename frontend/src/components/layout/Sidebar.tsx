import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';

const navItems = [
  { name: 'Dashboard', path: '/app' },
  { name: 'Profile', path: '/app/profile' },
  { name: 'Settings', path: '/app/settings' },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-border bg-surface">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/app'}
            className={({ isActive }) =>
              cn(
                'block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-primary hover:bg-background'
              )
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
