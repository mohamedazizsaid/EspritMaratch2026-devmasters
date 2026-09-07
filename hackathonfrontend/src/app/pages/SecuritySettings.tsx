import { TwoFactorSetup } from '../components/TwoFactorSetup';
import { ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export function SecuritySettings() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-primary/5 via-background to-background py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-primary/10 blur-[130px] -z-10 rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <ScrollReveal direction="up" className="flex items-center gap-4 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/15">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
              <Lock className="h-3 w-3" />
              Protection Maximale
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Sécurité du compte</h1>
            <p className="text-sm text-muted-foreground">
              Configurez vos paramètres de protection et d'authentification forte
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.15}>
          <TwoFactorSetup />
        </ScrollReveal>
      </div>
    </div>
  );
}
