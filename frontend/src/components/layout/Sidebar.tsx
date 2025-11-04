import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Idea } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import * as ideaService from '@/services/ideaService';

const navItems = [
  { name: 'Dashboard', path: '/app' },
  { name: 'Profile', path: '/app/profile' },
];

// Helper function to get user initials for avatar
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const Sidebar = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);

  const loadIdeas = async () => {
    try {
      setIsLoadingIdeas(true);
      const data = await ideaService.getUserIdeas();
      setIdeas(data);
    } catch (err) {
      console.error('Failed to load ideas:', err);
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  useEffect(() => {
    loadIdeas();

    // Reload ideas every 30 seconds to catch new ones or status changes
    const interval = setInterval(loadIdeas, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="flex flex-col w-64 border-r border-border bg-surface overflow-hidden">
      {/* Logo at top */}
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Ideator</h1>
      </div>

      {/* Navigation content */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1 mb-6">
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
        </div>

        {/* Ideas section */}
        <div>
          <h3 className="px-4 text-xs font-semibold uppercase text-text-secondary mb-2">
            Your Ideas
          </h3>
          {isLoadingIdeas ? (
            <div className="px-4 py-2 text-sm text-text-secondary">
              Loading...
            </div>
          ) : ideas.length === 0 ? (
            <div className="px-4 py-2 text-sm text-text-secondary">
              No ideas yet
            </div>
          ) : (
            <div className="space-y-1">
              {ideas.slice(0, 10).map((idea) => (
                <NavLink
                  key={idea.id}
                  to={`/app/ideas/${idea.id}`}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-lg px-4 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-primary hover:bg-background'
                    )
                  }
                >
                  <div className="truncate font-medium">{idea.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        idea.status === 'completed' && 'bg-green-500',
                        idea.status === 'analyzing' && 'bg-yellow-500',
                        idea.status === 'pending' && 'bg-gray-400',
                        idea.status === 'failed' && 'bg-red-500'
                      )}
                    />
                    <span className="text-xs opacity-70">
                      {idea.status}
                    </span>
                  </div>
                </NavLink>
              ))}
              {ideas.length > 10 && (
                <NavLink
                  to="/app"
                  className="block px-4 py-2 text-xs text-text-secondary hover:text-text-primary"
                >
                  View all {ideas.length} ideas →
                </NavLink>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Profile section at bottom */}
      <div className="p-4 border-t border-border">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors',
              isActive
                ? 'bg-primary text-white'
                : 'text-text-primary hover:bg-background'
            )
          }
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
            {user?.name ? getInitials(user.name) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {user?.name || 'User'}
            </div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};
