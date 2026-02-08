import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/api';

export function TwoFactorSetup() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const result = await authService.getTwoFactorStatus();
      setIsEnabled(result.enabled);
    } catch (err) {
      console.error('Failed to check 2FA status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async () => {
    try {
      setIsSubmitting(true);
      const result = await authService.generateTwoFactor();
      setQrCodeDataUrl(result.qrCodeDataUrl);
      setSecret(result.secret);
      setShowSetupDialog(true);
      setVerifyCode('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la génération';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnable = async () => {
    if (verifyCode.length !== 6) {
      toast.error('Veuillez entrer un code à 6 chiffres');
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.enableTwoFactor(verifyCode);
      toast.success('Authentification à deux facteurs activée !');
      setIsEnabled(true);
      setShowSetupDialog(false);
      setVerifyCode('');
      setQrCodeDataUrl('');
      setSecret('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Code invalide';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      toast.error('Veuillez entrer un code à 6 chiffres');
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.disableTwoFactor(disableCode);
      toast.success('Authentification à deux facteurs désactivée');
      setIsEnabled(false);
      setShowDisableDialog(false);
      setDisableCode('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Code invalide';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">Authentification à deux facteurs (2FA)</CardTitle>
                <CardDescription>
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </CardDescription>
              </div>
            </div>
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Activé' : 'Désactivé'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isEnabled
                ? 'Votre compte est protégé par l\'authentification à deux facteurs. Un code sera demandé à chaque connexion.'
                : 'Activez l\'authentification à deux facteurs pour sécuriser votre compte avec Google Authenticator ou une application TOTP compatible.'}
            </p>
            {isEnabled ? (
              <Button
                variant="destructive"
                onClick={() => {
                  setDisableCode('');
                  setShowDisableDialog(true);
                }}
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Désactiver 2FA
              </Button>
            ) : (
              <Button onClick={handleSetup} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2" />
                )}
                Activer 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurer l'authentification 2FA</DialogTitle>
            <DialogDescription>
              Scannez le QR code avec Google Authenticator ou une application TOTP compatible
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={qrCodeDataUrl} alt="QR Code 2FA" className="w-48 h-48" />
              </div>
            )}

            {/* Manual secret */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Ou entrez ce code manuellement :
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono text-center select-all">
                  {secret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(secret);
                    toast.success('Code copié !');
                  }}
                >
                  Copier
                </Button>
              </div>
            </div>

            {/* Verification code */}
            <div className="space-y-2">
              <Label htmlFor="verifyCode">Code de vérification</Label>
              <Input
                id="verifyCode"
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-lg font-mono tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Entrez le code à 6 chiffres affiché dans votre application
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleEnable}
              disabled={isSubmitting || verifyCode.length !== 6}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Activer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Désactiver l'authentification 2FA</DialogTitle>
            <DialogDescription>
              Entrez un code depuis votre application d'authentification pour confirmer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disableCode">Code de vérification</Label>
              <Input
                id="disableCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-lg font-mono tracking-widest"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={isSubmitting || disableCode.length !== 6}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Désactiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
