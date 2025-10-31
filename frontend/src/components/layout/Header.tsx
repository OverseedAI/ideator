import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface shadow-subtle">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-primary">Ideator</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
