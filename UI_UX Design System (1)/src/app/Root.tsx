import { Outlet } from 'react-router';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Toaster } from './components/ui/sonner';

interface RootProps {
  isAuthenticated: boolean;
  userRole?: 'student' | 'instructor' | 'manager' | 'admin';
  onLogout: () => void;
}

export function Root({ isAuthenticated, userRole, onLogout }: RootProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={isAuthenticated} userRole={userRole} onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}
