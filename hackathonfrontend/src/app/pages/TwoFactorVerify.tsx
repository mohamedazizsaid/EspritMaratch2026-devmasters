import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/api';
import { ScrollReveal } from '../components/ScrollReveal';

interface TwoFactorVerifyProps {
  onLogin: (email: string, role: 'Formateurs' | 'responsableformation' | 'Admin') => void;
}

export function TwoFactorVerify({ onLogin }: TwoFactorVerifyProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get userId from navigation state or search params (for Google OAuth redirect)
  const tempUserId = searchParams.get('tempUserId') || localStorage.getItem('2fa_tempUserId') || '';
  const userEmail = searchParams.get('email') || localStorage.getItem('2fa_email') || '';

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // If no tempUserId, redirect to login
    if (!tempUserId) {
      navigate('/login');
    }
  }, [tempUserId, navigate]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newCode.every(d => d !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeStr?: string) => {
    const fullCode = codeStr || code.join('');
    if (fullCode.length !== 6) {
      setError('Veuillez entrer les 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.verifyTwoFactor(tempUserId, fullCode);

      // Clean up temp storage
      localStorage.removeItem('2fa_tempUserId');
      localStorage.removeItem('2fa_email');

      toast.success('Authentification réussie !');

      // Store user info
      localStorage.setItem('userid', result.user?._id || '');
      localStorage.setItem('userNom', (result.user as any)?.nom || '');
      localStorage.setItem('userPrenom', (result.user as any)?.prenom || '');
      localStorage.setItem('userRole', result.user?.role || '');

      const onBoarding = (result.user as any)?.onBoarding;
      if (!onBoarding) {
        localStorage.setItem('needsOnboarding', 'true');
      }

      console.log('[TwoFactorVerify] User data received:', {
        _id: result.user?._id,
        email: result.user?.email,
        role: result.user?.role,
        hasToken: !!result.access_token,
      });

      const userRole = (result.user?.role?.toLowerCase() as any) || '';
      
      console.log('[TwoFactorVerify] Extracted userRole:', userRole);
      
      if (!userRole) {
        toast.error('Rôle utilisateur non reconnu');
        console.error('[TwoFactorVerify] No role found. Full user object:', result.user);
        navigate('/login');
        return;
      }

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
        default:
          toast.error('Rôle utilisateur non reconnu');
          navigate('/login');
          return;
      }
      
      localStorage.setItem('pendingRedirect', redirectPath);
      onLogin(result.user?.email || '', userRole);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Code invalide ou expiré';
      setError(errorMessage);
      toast.error(errorMessage);
      // Reset code
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/15 blur-[130px] -z-10 rounded-full pointer-events-none" />

      <ScrollReveal direction="up" className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/15">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Vérification 2FA</h1>
          <p className="text-sm text-muted-foreground">
            Entrez le code de votre application d'authentification
          </p>
        </div>

        <Card className="rounded-3xl border border-border/80 shadow-2xl backdrop-blur-xl bg-card/90 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-center">Code à 6 chiffres</CardTitle>
            <CardDescription className="text-center">
              Ouvrez Google Authenticator et entrez le code affiché pour{' '}
              <span className="font-medium text-foreground">{userEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 6-digit code input */}
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-2xl font-bold ${error ? 'border-destructive' : ''}`}
                    aria-label={`Chiffre ${index + 1}`}
                    disabled={isLoading}
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-destructive text-center" role="alert">
                  {error}
                </p>
              )}

              <Button
                onClick={() => handleVerify()}
                className="w-full"
                size="lg"
                disabled={isLoading || code.some(d => d === '')}
              >
                {isLoading ? 'Vérification...' : 'Vérifier'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('2fa_tempUserId');
                    localStorage.removeItem('2fa_email');
                    navigate('/login');
                  }}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  Retour à la connexion
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
