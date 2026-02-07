import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/api';

interface LoginProps {
  onLogin: (email: string, role: 'student' | 'instructor' | 'manager' | 'admin') => void;
}

export function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Charger l'email sauvegardé et gérer les erreurs Google OAuth
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }

    // Gérer l'erreur de Google OAuth
    const error = searchParams.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setIsLoading(true);

    try {
      // Call auth service
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      toast.success(`Bienvenue ${result.user?.name || ''}! Connexion réussie.`);
      
      localStorage.setItem('userid', result.user?._id || '');
      localStorage.setItem('userNom', (result.user as any)?.nom || '');
      localStorage.setItem('userPrenom', (result.user as any)?.prenom || '');
      localStorage.setItem('userRole', result.user?.role || '');

      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberEmail', formData.email);
      }

      // Check if onboarding is needed
      const onBoarding = (result.user as any)?.onBoarding;
      if (!onBoarding) {
        localStorage.setItem('needsOnboarding', 'true');
      }

      // Call onLogin callback with email and default role
      // Note: You might want to get the role from the API response
      const userRole = (result.user?.role?.toLowerCase() as any) || 'Formateurs';
      onLogin(formData.email, userRole);

      // Navigate based on role
      switch (userRole) {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email ou mot de passe incorrect';
      setErrors({ ...errors, password: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="mb-2">Connexion</h1>
          <p className="text-muted-foreground">
            Accédez à votre espace de formation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Se connecter</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive" aria-label="requis">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={errors.email ? 'border-destructive' : ''}
                  placeholder="vous@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mot de passe <span className="text-destructive" aria-label="requis">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                    className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-1"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p id="password-error" className="text-sm text-destructive" role="alert">
                    {errors.password}
                  </p>
                ) : (
                  <p id="password-hint" className="text-sm text-muted-foreground">
                    Minimum 6 caractères
                  </p>
                )}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleChange('rememberMe', checked as boolean)}
                    aria-label="Se souvenir de moi"
                  />
                  <Label htmlFor="rememberMe" className="cursor-pointer">
                    Se souvenir de moi
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>

           
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                window.location.href = 'http://localhost:3000/api/auth/google';
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuer avec Google
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
