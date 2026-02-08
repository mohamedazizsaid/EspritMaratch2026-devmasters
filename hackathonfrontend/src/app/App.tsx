import { useState, useMemo } from 'react';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './routes';
import { authService } from '../services/api';
import { I18nProvider } from './lib/i18n';
import { translations } from './lib/translations';
import { OnBoarding } from './components/OnBoarding';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<'Formateurs' | 'responsableformation' | 'Admin'>('Formateurs');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<{
    userId: string;
    userName: string;
    userRole: string;
    redirectPath: string;
  } | null>(null);

  const handleLogin = (email: string, role: 'Formateurs' | 'responsableformation' | 'Admin') => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserRole(role);

    // Vérifier si l'onboarding doit être affiché
    const needsOnboarding = localStorage.getItem('needsOnboarding');
    if (needsOnboarding === 'true') {
      const userId = localStorage.getItem('userid') || '';
      const prenom = localStorage.getItem('userPrenom') || '';
      const nom = localStorage.getItem('userNom') || '';
      const rawRole = localStorage.getItem('userRole') || role;

      let redirectPath = '/dashboard/instructor';
      switch (rawRole.toLowerCase()) {
        case 'formateurs': redirectPath = '/dashboard/instructor'; break;
        case 'responsableformation': redirectPath = '/dashboard/manager'; break;
        case 'admin': redirectPath = '/dashboard/admin'; break;
      }

      setOnboardingData({
        userId,
        userName: `${prenom} ${nom}`.trim() || email,
        userRole: rawRole,
        redirectPath,
      });
      setShowOnboarding(true);
      localStorage.removeItem('needsOnboarding');
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboardingData(null);
  };

  const handleRegister = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserRole('Formateurs');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUserEmail('');
      setUserRole('Formateurs');
      setShowOnboarding(false);
      setOnboardingData(null);
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

  return (
    <I18nProvider translations={translations}>
      <RouterProvider router={router} />
      {showOnboarding && onboardingData && (
        <OnBoarding
          userId={onboardingData.userId}
          userName={onboardingData.userName}
          userRole={onboardingData.userRole}
          onComplete={handleOnboardingComplete}
        />
      )}
    </I18nProvider>
  );
}
