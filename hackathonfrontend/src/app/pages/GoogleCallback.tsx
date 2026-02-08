import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface GoogleCallbackProps {
  onLogin: (email: string, role: 'Formateurs' | 'responsableformation' | 'Admin') => void;
}

export function GoogleCallback({ onLogin }: GoogleCallbackProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion en cours...');

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const nom = searchParams.get('nom');
    const prenom = searchParams.get('prenom');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(decodeURIComponent(error));
      toast.error(decodeURIComponent(error));
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (token && userId && email && role) {
      // Stocker le token et les informations utilisateur
      localStorage.setItem('access_token', token);
      localStorage.setItem('userid', userId);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', role);
      if (nom) localStorage.setItem('userNom', nom);
      if (prenom) localStorage.setItem('userPrenom', prenom);

      // Check if onboarding is needed
      const onBoardingParam = searchParams.get('onBoarding');
      if (onBoardingParam === 'false') {
        localStorage.setItem('needsOnboarding', 'true');
      }

      setStatus('success');
      setMessage(`Bienvenue ${prenom || ''} ${nom || ''}!`);
      toast.success(`Connexion réussie! Bienvenue ${prenom || ''}!`);

      // Mapper le rôle pour le callback
      const userRole = (role.toLowerCase() as any) || 'Formateurs';
      onLogin(email, userRole);

      // Rediriger selon le rôle
      setTimeout(() => {
        switch (role.toLowerCase()) {
          case 'formateurs':
            navigate('/dashboard/instructor');
            break;
          case 'responsableformation':
            navigate('/dashboard/manager');
            break;
          case 'admin':
            navigate('/dashboard/admin');
            break;
          default:
            navigate('/dashboard/instructor');
        }
      }, 1500);
    } else {
      setStatus('error');
      setMessage('Paramètres de connexion manquants');
      toast.error('Erreur de connexion Google');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate, onLogin]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                Connexion Google
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Connexion réussie
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-6 w-6 text-destructive" />
                Erreur de connexion
              </>
            )}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">
                Traitement de votre connexion...
              </p>
            </div>
          )}
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              Redirection vers votre tableau de bord...
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-muted-foreground">
              Vous allez être redirigé vers la page de connexion...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
