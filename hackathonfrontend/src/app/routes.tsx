import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { InstructorDashboard } from './pages/dashboards/InstructorDashboard';
import { FormationNiveaux } from './pages/dashboards/FormationNiveaux';
import { NiveauSeances } from './pages/dashboards/NiveauSeances';
import { ManagerDashboard } from './pages/dashboards/ManagerDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ForgotPassword } from './pages/ForgotPassword';
import { GoogleCallback } from './pages/GoogleCallback';

interface RouterProps {
  isAuthenticated: boolean;
  userRole?: 'student' | 'instructor' | 'manager' | 'admin';
  onLogin: (email: string, role: 'student' | 'instructor' | 'manager' | 'admin') => void;
  onRegister: (email: string) => void;
  onLogout: () => void;
}

export const createAppRouter = ({
  isAuthenticated,
  userRole,
  onLogin,
  onRegister,
  onLogout,
}: RouterProps) => {
  return createBrowserRouter([
    {
      path: '/',
      element: <Root isAuthenticated={isAuthenticated} userRole={userRole} onLogout={onLogout} />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: 'about',
          element: <About />,
        },
        {
          path: 'contact',
          element: <Contact />,
        },
        {
          path: 'forgot-password',
          element: <ForgotPassword />,
        },
        {
          path: 'login',
          element: <Login onLogin={onLogin} />,
        },
         {
          path: 'auth/google/callback',
          element: <GoogleCallback onLogin={onLogin} />,
        },
        {
          path: 'dashboard/instructor',
          element: <InstructorDashboard />,
        },
        {
          path: 'dashboard/instructor/formation/:formationId',
          element: <FormationNiveaux />,
        },
        {
          path: 'dashboard/instructor/formation/:formationId/niveau/:niveauId',
          element: <NiveauSeances />,
        },
        {
          path: 'dashboard/manager',
          element: <ManagerDashboard />,
        },
        {
          path: 'dashboard/admin',
          element: <AdminDashboard />,
        },
        {
          path: '*',
          element: (
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center">
                <h1 className="mb-4">Page non trouvée</h1>
                <p className="text-muted-foreground mb-6">
                  La page que vous recherchez n'existe pas.
                </p>
                <a href="/" className="text-primary hover:underline">
                  Retour à l'accueil
                </a>
              </div>
            </div>
          ),
        },
      ],
    },
  ]);
};
