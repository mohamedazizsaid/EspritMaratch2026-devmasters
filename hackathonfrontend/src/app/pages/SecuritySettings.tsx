import { TwoFactorSetup } from '../components/TwoFactorSetup';
import { ShieldCheck } from 'lucide-react';

export function SecuritySettings() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Sécurité du compte</h1>
            <p className="text-muted-foreground">
              Gérez les paramètres de sécurité de votre compte
            </p>
          </div>
        </div>

        <TwoFactorSetup />
      </div>
    </div>
  );
}
