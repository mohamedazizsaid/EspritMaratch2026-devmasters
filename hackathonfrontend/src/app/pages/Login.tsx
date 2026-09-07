import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/api';
import { API_CONFIG } from '../../services/api/config';
import { ScrollReveal } from '../components/ScrollReveal';

interface LoginProps {
  onLogin: (email: string, role: 'Formateurs' | 'responsableformation' | 'Admin') => void;
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
      setFormData((prev) => ({
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
      newErrors.email = "L'adresse email est requise";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
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
      toast.error('Veuillez remplir correctement tous les champs obligatoires.');
      return;
    }

    setIsLoading(true);

    try {
      // Call auth service
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      // Handle 2FA required
      if (result.requiresTwoFactor) {
        localStorage.setItem('2fa_tempUserId', result.tempUserId || '');
        localStorage.setItem('2fa_email', result.user?.email || formData.email);
        toast.info('Vérification 2FA requise');
        navigate('/verify-2fa');
        return;
      }

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
      const userRole = (result.user?.role?.toLowerCase() as any) || 'Formateurs';
      console.log('User role from API:', userRole);

      // Store redirect path BEFORE calling onLogin (which recreates the router)
      let redirectPath = '/dashboard/instructor';
      switch (userRole) {
        case 'formateurs':
          redirectPath = '/dashboard/instructor';
          break;
        case 'responsableformation':
          redirectPath = '/dashboard/manager';
          break;
        case 'admin':
          redirectPath = '/dashboard/admin';
          break;
      }

      localStorage.setItem('pendingRedirect', redirectPath);
      onLogin(formData.email, userRole);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email ou mot de passe incorrect';
      setErrors({ ...errors, password: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-background">
      {/* Dynamic ambient glow backdrops */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-primary/20 via-indigo-500/10 to-transparent blur-3xl -z-10 rounded-full animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 right-10 w-96 h-96 bg-primary/10 blur-3xl -z-10 rounded-full" />

      <ScrollReveal direction="up" className="w-full max-w-xl">
        <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl transition-all duration-300">
          <CardHeader className="text-center pb-4 pt-8 px-6 sm:px-8">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shadow-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Espace Sécurisé · Authentification</span>
            </div>

            <CardTitle className="text-3xl font-black tracking-tight text-foreground">
              Bon retour parmi nous
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground mt-1.5 max-w-md mx-auto">
              Accédez à votre espace pédagogique, vos cours et vos outils de formation interactifs.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-6">
            {/* Status / Platform badge display */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/60 text-xs sm:text-sm mb-5">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Accès plateforme :
              </span>
              <Badge variant="outline" className="border-primary/30 text-primary font-semibold px-3 py-1 rounded-full bg-primary/10">
                Formateur · Responsable · Admin
              </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Professionnel <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`rounded-xl bg-background/60 border-border/80 transition-all focus:ring-2 focus:ring-primary/30 ${
                    errors.email ? 'border-destructive' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mot de passe <span className="text-destructive">*</span>
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`rounded-xl pr-10 bg-background/60 border-border/80 transition-all focus:ring-2 focus:ring-primary/30 ${
                      errors.password ? 'border-destructive' : ''
                    }`}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2 pt-1 pb-1">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleChange('rememberMe', checked as boolean)}
                  className="rounded-md"
                />
                <Label htmlFor="rememberMe" className="text-xs sm:text-sm text-muted-foreground font-medium cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <span>Se connecter à mon espace</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                <span className="bg-card px-3 text-muted-foreground">Ou continuer avec</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full py-5 rounded-2xl border-border/80 bg-background/50 hover:bg-muted/60 transition-all flex items-center justify-center gap-3 font-semibold text-sm shadow-sm"
              onClick={() => {
                window.location.href = `${API_CONFIG.BASE_URL}/auth/google`;
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
              Google
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center border-t border-border/60 bg-muted/20 py-4 px-6 sm:px-8 space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Vous êtes nouveau formateur ?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline transition-colors">
                Créer un compte Formateur
              </Link>
            </p>
            <p className="text-xs text-muted-foreground/70 text-center max-w-sm leading-relaxed">
              Pour les comptes administrateurs et responsables, l'attribution se fait via l'administration centrale.
            </p>
          </CardFooter>
        </Card>
      </ScrollReveal>
    </div>
  );
}

