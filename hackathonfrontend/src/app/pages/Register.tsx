import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Eye, EyeOff, GraduationCap, CheckCircle2, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/api';
import { ScrollReveal } from '../components/ScrollReveal';

interface RegisterProps {
  onRegister?: (email: string) => void;
}

export function Register({ onRegister }: RegisterProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    specialite: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est requise";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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
      // Register with role locked to Formateurs
      const result = await authService.register({
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: 'Formateurs',
      });

      toast.success(`Bienvenue ${formData.prenom} ! Votre compte Formateur a été créé.`);

      const userId = result.user?._id || '';
      const nom = (result.user as any)?.nom || formData.nom;
      const prenom = (result.user as any)?.prenom || formData.prenom;
      const email = result.user?.email || formData.email;

      // Save user credentials & trigger onboarding flag
      localStorage.setItem('userid', userId);
      localStorage.setItem('userNom', nom);
      localStorage.setItem('userPrenom', prenom);
      localStorage.setItem('userRole', 'Formateurs');
      localStorage.setItem('needsOnboarding', 'true');
      localStorage.setItem('pendingRedirect', '/dashboard/instructor');

      if (onRegister) {
        onRegister(email);
      } else {
        navigate('/dashboard/instructor');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
      toast.error(errorMessage);
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const passwordMeetsRequirements = formData.password.length >= 6;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-background">
      {/* Dynamic ambient glow backdrops */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-primary/20 via-indigo-500/10 to-transparent blur-3xl -z-10 rounded-full animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 right-10 w-96 h-96 bg-primary/10 blur-3xl -z-10 rounded-full" />

      <ScrollReveal direction="up" className="w-full max-w-xl">
        <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl transition-all duration-300">
          <CardHeader className="text-center pb-4 pt-8 px-6 sm:px-8">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shadow-sm">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>Espace Formateur · Accès Pédagogique</span>
            </div>

            <CardTitle className="text-3xl font-black tracking-tight text-foreground">
              Créer mon compte Formateur
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground mt-1.5 max-w-md mx-auto">
              Rejoignez l'équipe pédagogique, concevez vos cours et suivez vos apprenants avec nos outils intelligents.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role badge display */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/60 text-xs sm:text-sm">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Rôle attribué à la création :
                </span>
                <Badge variant="default" className="bg-primary/90 text-primary-foreground font-semibold px-3 py-1 rounded-full">
                  Formateur Certifié
                </Badge>
              </div>

              {/* Prénom & Nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="prenom" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Prénom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="prenom"
                    type="text"
                    placeholder="Ex: Jean"
                    value={formData.prenom}
                    onChange={(e) => handleChange('prenom', e.target.value)}
                    className={`rounded-xl bg-background/60 border-border/80 transition-all focus:ring-2 focus:ring-primary/30 ${
                      errors.prenom ? 'border-destructive' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {errors.prenom && <p className="text-xs text-destructive">{errors.prenom}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nom" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nom"
                    type="text"
                    placeholder="Ex: Dupont"
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    className={`rounded-xl bg-background/60 border-border/80 transition-all focus:ring-2 focus:ring-primary/30 ${
                      errors.nom ? 'border-destructive' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {errors.nom && <p className="text-xs text-destructive">{errors.nom}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Professionnel <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="formateur@exemple.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`rounded-xl bg-background/60 border-border/80 transition-all focus:ring-2 focus:ring-primary/30 ${
                    errors.email ? 'border-destructive' : ''
                  }`}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Spécialité (optionnel) */}
              <div className="space-y-1.5">
                <Label htmlFor="specialite" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Domaine d'expertise / Spécialité <span className="text-muted-foreground/60 text-[10px] font-normal">(Optionnel)</span>
                </Label>
                <Input
                  id="specialite"
                  type="text"
                  placeholder="Ex: Intelligence Artificielle, Frontend, UI/UX..."
                  value={formData.specialite}
                  onChange={(e) => handleChange('specialite', e.target.value)}
                  className="rounded-xl bg-background/60 border-border/80 transition-all focus:ring-2 focus:ring-primary/30"
                  disabled={isLoading}
                />
              </div>

              {/* Mot de passe & Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mot de passe <span className="text-destructive">*</span>
                  </Label>
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

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirmation <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={`rounded-xl pr-10 bg-background/60 border-border/80 transition-all focus:ring-2 focus:ring-primary/30 ${
                        errors.confirmPassword ? 'border-destructive' : ''
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Requirement pill */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <CheckCircle2
                  className={`w-3.5 h-3.5 transition-colors ${
                    passwordMeetsRequirements ? 'text-emerald-500' : 'text-muted-foreground/50'
                  }`}
                />
                <span>Minimum 6 caractères</span>
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
                    Création en cours...
                  </>
                ) : (
                  <>
                    <span>Créer mon compte et configurer mon profil</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center border-t border-border/60 bg-muted/20 py-4 px-6 sm:px-8">
            <p className="text-sm text-muted-foreground">
              Vous possédez déjà un compte ?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline transition-colors">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </Card>
      </ScrollReveal>
    </div>
  );
}
