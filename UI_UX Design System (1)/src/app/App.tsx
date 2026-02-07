import { useState, useMemo } from 'react';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './routes';
import { authService } from '../services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<'student' | 'instructor' | 'manager' | 'admin'>('student');

  const handleLogin = (email: string, role: 'student' | 'instructor' | 'manager' | 'admin') => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserRole(role);
  };

  const handleRegister = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserRole('student');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUserEmail('');
      setUserRole('student');
    }
  };

  const router = useMemo(
    () =>
      createAppRouter({
        isAuthenticated,
        userRole,
        onLogin: handleLogin,
        onRegister: handleRegister,
        onLogout: handleLogout,
      }),
    [isAuthenticated, userRole]
  );

  return <RouterProvider router={router} />;
}
