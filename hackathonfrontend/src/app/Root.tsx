import { useState } from 'react';
import { Outlet } from 'react-router';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Toaster } from './components/ui/sonner';
import { AccessibilityPanel, AccessibilityTrigger } from './components/AccessibilityPanel';
import { TabFlowIndicator } from './components/TabFlowIndicator';
import { VoiceAssistant } from './components/VoiceAssistant';
import { useTranslation } from './lib/i18n';

interface RootProps {
  isAuthenticated: boolean;
  userRole?: 'student' | 'instructor' | 'manager' | 'admin';
  onLogout: () => void;
}

export function Root({ isAuthenticated, userRole, onLogout }: RootProps) {
  const [a11yOpen, setA11yOpen] = useState(false);
  const { t } = useTranslation();

  // Read voice state from localStorage for the indicator
  const voiceActive = (() => {
    try {
      const raw = localStorage.getItem('accessibility-settings');
      if (raw) return JSON.parse(raw).voiceEnabled === true;
    } catch {}
    return false;
  })();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Tab flow navigation indicator (shows on keyboard nav) */}
      <TabFlowIndicator />

      {/* Skip-to-content link visible only on Tab focus */}
      <a href="#main-content" className="skip-link">
        {t('a11y.skipToContent')}
      </a>
      <Header isAuthenticated={isAuthenticated} userRole={userRole} onLogout={onLogout} />
      <main id="main-content" role="main" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" />

      {/* Voice Assistant (Siri-like) */}
      <VoiceAssistant />

      {/* Accessibility floating button + panel */}
      <AccessibilityTrigger onClick={() => setA11yOpen(true)} voiceActive={voiceActive} />
      <AccessibilityPanel open={a11yOpen} onOpenChange={setA11yOpen} side="right" />
    </div>
  );
}
