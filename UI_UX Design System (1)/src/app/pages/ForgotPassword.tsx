import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Eye, EyeOff, ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/api';
import '../styles/forgot-password.css';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer for code expiry
  const handleTimerStart = () => {
    setTimeLeft(3600); // 1 hour in seconds
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const validateEmailForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCodeForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.resetCode.trim()) {
      newErrors.resetCode = 'Le code est requis';
    } else if (!/^\d{6}$/.test(formData.resetCode)) {
      newErrors.resetCode = 'Le code doit être un nombre à 6 chiffres';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation est requise';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmailForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.requestPasswordReset(formData.email);
      toast.success('Code de réinitialisation envoyé à votre email');
      setEmailSent(true);
      setStep('code');
      handleTimerStart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code';
      setErrors({ email: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCodeForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.validateResetCode(
        formData.email,
        formData.resetCode,
        formData.newPassword
      );
      toast.success('Mot de passe réinitialisé avec succès!');
      
      // Clear form and redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réinitialisation';
      
      if (errorMessage.includes('expiré')) {
        setErrors({ resetCode: 'Le code a expiré. Demandez un nouveau code.' });
      } else if (errorMessage.includes('incorrect')) {
        setErrors({ resetCode: 'Code incorrect' });
      } else {
        setErrors({ resetCode: errorMessage });
      }
      
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

  const handleBackToEmail = () => {
    setStep('email');
    setFormData({
      ...formData,
      resetCode: '',
      newPassword: '',
      confirmPassword: '',
    });
    setEmailSent(false);
  };

  return (
    <div className="forgot-password-container">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">Réinitialiser votre mot de passe</h1>
          <p className="forgot-password-description">
            {step === 'email'
              ? 'Entrez votre email pour recevoir un code de réinitialisation'
              : 'Entrez le code reçu et votre nouveau mot de passe'}
          </p>
        </div>

        <Card className="forgot-password-card">
          {/* Step Indicator */}
          <div className="forgot-password-steps">
            <div className={`step-item ${step === 'email' ? 'active' : step === 'code' ? 'completed' : ''}`}>
              <div className="step-number">
                {step === 'code' ? <CheckCircle2 className="h-6 w-6" /> : '1'}
              </div>
              <span className="step-label">Email</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${step === 'code' ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span className="step-label">Code & Mot de passe</span>
            </div>
          </div>

          {/* Form Content */}
          <CardContent className="forgot-password-content">
            <div className={`step-content ${step === 'email' ? 'active' : ''}`}>
              <form onSubmit={handleRequestReset} className="space-y-6" noValidate>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Adresse email<span className="text-destructive" aria-label="requis">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      placeholder="vous@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <div id="email-error" className="flex items-center gap-2 text-sm text-destructive" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Vous recevrez un code par email
                  </p>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full forgot-password-btn"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? 'Envoi en cours...' : 'Continuer'}
                </Button>
              </form>
            </div>

            <div className={`step-content ${step === 'code' ? 'active' : ''}`}>
              <form onSubmit={handleValidateCode} className="space-y-6" noValidate>
                {/* Email Display */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Code envoyé à</p>
                  <p className="font-medium break-all">{formData.email}</p>
                </div>

                {/* Reset Code */}
                <div className="space-y-2">
                  <Label htmlFor="resetCode">
                    Code de réinitialisation<span className="text-destructive" aria-label="requis">*</span>
                  </Label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        id="resetCode"
                        type="text"
                        value={formData.resetCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          handleChange('resetCode', value);
                        }}
                        aria-required="true"
                        aria-invalid={!!errors.resetCode}
                        aria-describedby={errors.resetCode ? 'code-error' : undefined}
                        className={`text-center text-lg font-mono tracking-widest ${
                          errors.resetCode ? 'border-destructive' : ''
                        }`}
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        disabled={isLoading}
                      />
                    </div>
                    {timeLeft > 0 && (
                      <p className="text-xs text-muted-foreground min-w-fit">
                        {formatTime(timeLeft)}
                      </p>
                    )}
                  </div>
                  {errors.resetCode && (
                    <div id="code-error" className="flex items-center gap-2 text-sm text-destructive" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      {errors.resetCode}
                    </div>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    Nouveau mot de passe<span className="text-destructive" aria-label="requis">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleChange('newPassword', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.newPassword}
                      aria-describedby={errors.newPassword ? 'password-error' : 'password-hint'}
                      className={`pr-10 ${errors.newPassword ? 'border-destructive' : ''}`}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-1"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      tabIndex={0}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword ? (
                    <div id="password-error" className="flex items-center gap-2 text-sm text-destructive" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      {errors.newPassword}
                    </div>
                  ) : (
                    <p id="password-hint" className="text-xs text-muted-foreground">
                      Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmer le mot de passe<span className="text-destructive" aria-label="requis">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                      className={`pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-1"
                      aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                      tabIndex={0}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div id="confirm-error" className="flex items-center gap-2 text-sm text-destructive" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full forgot-password-btn"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleBackToEmail}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link
              to="/login"
              className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Accessibility: Loading announcer */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isLoading && 'Traitement en cours...'}
      </div>
    </div>
  );
}
