import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Mic, MicOff, X } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

// ─── Types ───────────────────────────────────────────────────────────────────
type Language = 'fr' | 'en' | 'ar' | 'es';

interface VoiceCommand {
  keywords: Record<Language, string[]>;
  action: 'navigate' | 'scroll' | 'theme' | 'custom';
  route?: string;
  handler?: () => void;
  feedbackKey: string; // i18n key for confirmation message
}

type AssistantState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

// ─── Helper: click a dashboard tab by value ─────────────────────────────────
// Maps tab values to text patterns that appear inside the tab trigger button
const TAB_TEXT_PATTERNS: Record<string, string[]> = {
  courses: ['formation', 'formations', 'mes formations', 'courses', 'my courses', 'trainings'],
  students: ['étudiant', 'étudiants', 'mes étudiants', 'students', 'my students', 'eleves', 'élèves'],
  calendar: ['calendrier', 'calendar'],
  chatbot: ['assistant ia', 'assistant', 'chatbot', 'ai assistant', 'bot'],
  dashboard: ['tableau de bord', 'dashboard'],
  formations: ['formation', 'formations'],
  eleves: ['élèves', 'eleves', 'étudiants'],
  seances: ['séances', 'seances', 'sessions'],
  inscriptions: ['inscriptions', 'enrollments'],
  certifications: ['certifications'],
  analytics: ['analytics', 'analytique'],
  users: ['utilisateurs', 'users'],
  roles: ['rôles', 'roles'],
  logs: ['logs', 'journaux'],
};

function clickDashboardTab(tabValue: string) {
  const allTabs = document.querySelectorAll<HTMLElement>('[role="tab"]');

  // Strategy 1: Match by tab text content using our patterns
  const patterns = TAB_TEXT_PATTERNS[tabValue] || [tabValue];
  for (const tab of allTabs) {
    const text = (tab.textContent || '').trim().toLowerCase();
    if (patterns.some((p) => text.includes(p.toLowerCase()))) {
      tab.click();
      tab.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
  }

  // Strategy 2: Match by index position (courses=0, students=1, calendar=2, chatbot=3)
  const indexMap: Record<string, number> = {
    courses: 0,
    students: 1,
    calendar: 2,
    chatbot: 3,
  };
  const idx = indexMap[tabValue];
  if (idx !== undefined && allTabs[idx]) {
    allTabs[idx].click();
    allTabs[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }

  return false;
}

// ─── Voice Commands Registry ─────────────────────────────────────────────────
const VOICE_COMMANDS: VoiceCommand[] = [
  // Navigation commands
  {
    keywords: {
      fr: ['accueil', 'maison', 'home', 'page principale'],
      en: ['home', 'main page', 'homepage', 'go home'],
      ar: ['الرئيسية', 'الصفحة الرئيسية', 'الاكويل'],
      es: ['inicio', 'página principal', 'casa'],
    },
    action: 'navigate',
    route: '/',
    feedbackKey: 'voice.goingHome',
  },
  {
    keywords: {
      fr: ['formation', 'formations', 'cours', 'les cours', 'mes formations', 'mes cours'],
      en: ['training', 'trainings', 'courses', 'my courses', 'my training', 'formations'],
      ar: ['تكوين', 'التكوينات', 'الدورات', 'دوراتي'],
      es: ['formación', 'formaciones', 'cursos', 'mis cursos'],
    },
    action: 'custom',
    feedbackKey: 'voice.goingFormations',
    // Will be handled in executeCommand with navigate + tab click
  },
  {
    keywords: {
      fr: ['assistant', 'assistant ia', 'chatbot', 'chat bot', 'ia', 'intelligence artificielle', 'bot'],
      en: ['assistant', 'ai assistant', 'chatbot', 'chat bot', 'ai', 'artificial intelligence', 'bot'],
      ar: ['المساعد', 'مساعد ذكي', 'شات بوت', 'الذكاء الاصطناعي'],
      es: ['asistente', 'asistente ia', 'chatbot', 'inteligencia artificial', 'bot'],
    },
    action: 'custom',
    feedbackKey: 'voice.goingChatbot',
  },
  {
    keywords: {
      fr: ['tableau de bord', 'dashboard', 'mon espace', 'mon tableau'],
      en: ['dashboard', 'my space', 'my dashboard', 'control panel'],
      ar: ['لوحة التحكم', 'لوحة القيادة', 'مساحتي'],
      es: ['panel', 'tablero', 'mi espacio', 'dashboard'],
    },
    action: 'navigate',
    route: '/dashboard/instructor',
    feedbackKey: 'voice.goingDashboard',
  },
  {
    keywords: {
      fr: ['étudiants', 'élèves', 'apprenants', 'mes étudiants', 'mes élèves'],
      en: ['students', 'my students', 'learners', 'pupils'],
      ar: ['الطلاب', 'طلابي', 'المتعلمين'],
      es: ['estudiantes', 'mis estudiantes', 'alumnos'],
    },
    action: 'custom',
    feedbackKey: 'voice.goingStudents',
  },
  {
    keywords: {
      fr: ['contact', 'nous contacter', 'contactez-nous'],
      en: ['contact', 'contact us', 'get in touch'],
      ar: ['اتصل بنا', 'تواصل', 'الاتصال'],
      es: ['contacto', 'contáctenos', 'contactar'],
    },
    action: 'navigate',
    route: '/contact',
    feedbackKey: 'voice.goingContact',
  },
  {
    keywords: {
      fr: ['à propos', 'qui sommes nous', 'a propos', 'apropos'],
      en: ['about', 'about us', 'who are we'],
      ar: ['من نحن', 'حولنا', 'عنا'],
      es: ['acerca de', 'sobre nosotros', 'quiénes somos'],
    },
    action: 'navigate',
    route: '/about',
    feedbackKey: 'voice.goingAbout',
  },
  {
    keywords: {
      fr: ['connexion', 'se connecter', 'login', 'connecter'],
      en: ['login', 'sign in', 'log in', 'connect'],
      ar: ['تسجيل الدخول', 'دخول', 'اتصال'],
      es: ['iniciar sesión', 'entrar', 'conectar', 'login'],
    },
    action: 'navigate',
    route: '/login',
    feedbackKey: 'voice.goingLogin',
  },
  {
    keywords: {
      fr: ['inscription', 's\'inscrire', 'créer un compte', 'register', 'inscrire'],
      en: ['register', 'sign up', 'create account', 'join'],
      ar: ['تسجيل', 'إنشاء حساب', 'انضمام'],
      es: ['registrarse', 'crear cuenta', 'inscribirse', 'registro'],
    },
    action: 'navigate',
    route: '/register',
    feedbackKey: 'voice.goingRegister',
  },
  {
    keywords: {
      fr: ['admin', 'administration', 'administrateur', 'panneau admin'],
      en: ['admin', 'administration', 'admin panel', 'administrator'],
      ar: ['المسؤول', 'الإدارة', 'لوحة المسؤول'],
      es: ['admin', 'administración', 'administrador', 'panel admin'],
    },
    action: 'navigate',
    route: '/dashboard/admin',
    feedbackKey: 'voice.goingAdmin',
  },
  {
    keywords: {
      fr: ['manager', 'responsable', 'gestionnaire', 'responsable formation'],
      en: ['manager', 'training manager', 'management'],
      ar: ['المدير', 'مسؤول التكوين', 'الإدارة'],
      es: ['gerente', 'responsable', 'gestor', 'gestión'],
    },
    action: 'navigate',
    route: '/dashboard/manager',
    feedbackKey: 'voice.goingManager',
  },
  // Scroll commands
  {
    keywords: {
      fr: ['descendre', 'vers le bas', 'en bas', 'défiler'],
      en: ['scroll down', 'go down', 'down'],
      ar: ['انزل', 'أسفل', 'تمرير لأسفل'],
      es: ['bajar', 'abajo', 'desplazar abajo'],
    },
    action: 'scroll',
    feedbackKey: 'voice.scrollingDown',
    handler: () => window.scrollBy({ top: 500, behavior: 'smooth' }),
  },
  {
    keywords: {
      fr: ['monter', 'vers le haut', 'en haut', 'remonter'],
      en: ['scroll up', 'go up', 'up', 'top'],
      ar: ['اصعد', 'أعلى', 'تمرير لأعلى'],
      es: ['subir', 'arriba', 'desplazar arriba'],
    },
    action: 'scroll',
    feedbackKey: 'voice.scrollingUp',
    handler: () => window.scrollBy({ top: -500, behavior: 'smooth' }),
  },
  // Theme commands
  {
    keywords: {
      fr: ['mode sombre', 'sombre', 'nuit', 'dark mode', 'mode nuit'],
      en: ['dark mode', 'dark', 'night mode', 'night'],
      ar: ['الوضع الداكن', 'داكن', 'الليل'],
      es: ['modo oscuro', 'oscuro', 'modo noche'],
    },
    action: 'theme',
    feedbackKey: 'voice.darkMode',
    handler: () => {
      document.documentElement.classList.add('dark');
      try {
        const raw = localStorage.getItem('accessibility-settings');
        const s = raw ? JSON.parse(raw) : {};
        s.theme = 'dark';
        localStorage.setItem('accessibility-settings', JSON.stringify(s));
      } catch {}
    },
  },
  {
    keywords: {
      fr: ['mode clair', 'clair', 'jour', 'light mode', 'mode jour'],
      en: ['light mode', 'light', 'day mode', 'bright'],
      ar: ['الوضع الفاتح', 'فاتح', 'النهار'],
      es: ['modo claro', 'claro', 'modo día'],
    },
    action: 'theme',
    feedbackKey: 'voice.lightMode',
    handler: () => {
      document.documentElement.classList.remove('dark');
      try {
        const raw = localStorage.getItem('accessibility-settings');
        const s = raw ? JSON.parse(raw) : {};
        s.theme = 'light';
        localStorage.setItem('accessibility-settings', JSON.stringify(s));
      } catch {}
    },
  },
];

// ─── TTS helper ──────────────────────────────────────────────────────────────
function speak(text: string, lang: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 1;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

const LANG_MAP: Record<Language, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-SA',
  es: 'es-ES',
};

// ─── Component ───────────────────────────────────────────────────────────────
export function VoiceAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [state, setState] = useState<AssistantState>('idle');
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current language
  const getLang = useCallback((): Language => {
    try {
      const raw = localStorage.getItem('accessibility-settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (['fr', 'en', 'ar', 'es'].includes(parsed.language)) return parsed.language;
      }
    } catch {}
    return 'fr';
  }, []);

  // Match transcript against commands
  const matchCommand = useCallback(
    (text: string, lang: Language): VoiceCommand | null => {
      const normalized = text.toLowerCase().trim();
      for (const cmd of VOICE_COMMANDS) {
        const keywords = cmd.keywords[lang] || cmd.keywords.fr;
        for (const kw of keywords) {
          if (normalized.includes(kw.toLowerCase())) {
            return cmd;
          }
        }
      }
      return null;
    },
    []
  );

  // Execute a matched command
  const executeCommand = useCallback(
    (cmd: VoiceCommand, lang: Language) => {
      setState('success');
      setFeedback(t(cmd.feedbackKey));
      speak(t(cmd.feedbackKey), LANG_MAP[lang]);

      // Determine which tab to click based on feedbackKey
      const tabMap: Record<string, { dashboardPath: string; tabValue: string }> = {
        'voice.goingFormations': { dashboardPath: '/dashboard/instructor', tabValue: 'courses' },
        'voice.goingStudents': { dashboardPath: '/dashboard/instructor', tabValue: 'students' },
        'voice.goingChatbot': { dashboardPath: '/dashboard/instructor', tabValue: 'chatbot' },
      };

      const tabInfo = tabMap[cmd.feedbackKey];

      if (tabInfo) {
        // Custom tab navigation: navigate to dashboard + click tab
        const isDashboardPage = location.pathname.startsWith('/dashboard');
        setTimeout(() => {
          if (isDashboardPage) {
            // Already on a dashboard — just click the tab
            // Try immediately, retry after short delay if tab not found
            if (!clickDashboardTab(tabInfo.tabValue)) {
              setTimeout(() => clickDashboardTab(tabInfo.tabValue), 300);
            }
          } else {
            // Navigate to the dashboard first, then click the tab
            navigate(tabInfo.dashboardPath);
            // Wait for page render, then click tab (with retry)
            setTimeout(() => {
              if (!clickDashboardTab(tabInfo.tabValue)) {
                setTimeout(() => clickDashboardTab(tabInfo.tabValue), 500);
              }
            }, 600);
          }
          setTimeout(() => {
            setShowOverlay(false);
            setState('idle');
          }, 1200);
        }, 800);
      } else if (cmd.action === 'navigate' && cmd.route) {
        // Small delay so user sees/hears the confirmation
        setTimeout(() => {
          navigate(cmd.route!);
          // Close overlay after navigation
          setTimeout(() => {
            setShowOverlay(false);
            setState('idle');
          }, 1200);
        }, 800);
      } else if (cmd.handler) {
        cmd.handler();
        setTimeout(() => {
          setShowOverlay(false);
          setState('idle');
        }, 1500);
      }
    },
    [navigate, t, location.pathname]
  );

  // Start listening
  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFeedback(t('voice.notSupported'));
      setState('error');
      setTimeout(() => setState('idle'), 3000);
      return;
    }

    const lang = getLang();
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_MAP[lang];
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setState('listening');
      setTranscript('');
      setFeedback(t('voice.listening'));
      setShowOverlay(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        setState('processing');
        const cmd = matchCommand(finalTranscript, lang);
        if (cmd) {
          executeCommand(cmd, lang);
        } else {
          // Try with interim too
          const cmdRetry = matchCommand(interimTranscript, lang);
          if (cmdRetry) {
            executeCommand(cmdRetry, lang);
          } else {
            setState('error');
            setFeedback(t('voice.notUnderstood'));
            speak(t('voice.notUnderstood'), LANG_MAP[lang]);
            setTimeout(() => {
              setShowOverlay(false);
              setState('idle');
            }, 2500);
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setFeedback(t('voice.noSpeech'));
      } else if (event.error === 'not-allowed') {
        setFeedback(t('voice.micDenied'));
      } else {
        setFeedback(t('voice.error'));
      }
      setState('error');
      setTimeout(() => {
        setShowOverlay(false);
        setState('idle');
      }, 2500);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // If still listening (no final result received), close
      if (state === 'listening') {
        setState('idle');
        setShowOverlay(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Auto-stop after 8 seconds
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 8000);
  }, [getLang, matchCommand, executeCommand, t, state]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState('idle');
    setShowOverlay(false);
  }, []);

  // Toggle
  const toggle = useCallback(() => {
    if (state === 'listening') {
      stopListening();
    } else if (state === 'idle') {
      startListening();
    }
  }, [state, startListening, stopListening]);

  // Keyboard shortcut: Alt+V to activate voice
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [toggle]);

  // Listen for custom event from AccessibilityPanel mic button
  useEffect(() => {
    const handler = () => toggle();
    document.addEventListener('voice-assistant-toggle', handler);
    return () => document.removeEventListener('voice-assistant-toggle', handler);
  }, [toggle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  const stateColors: Record<AssistantState, string> = {
    idle: 'from-primary to-primary/80',
    listening: 'from-blue-500 to-cyan-400',
    processing: 'from-amber-500 to-orange-400',
    success: 'from-green-500 to-emerald-400',
    error: 'from-red-500 to-rose-400',
  };

  return (
    <>
      {/* ── Siri-like Overlay ──────────────────────────────────────── */}
      {showOverlay && (
        <div className="voice-overlay" role="dialog" aria-modal="true" aria-label={t('voice.assistantTitle')}>
          {/* Backdrop */}
          <div className="voice-overlay-backdrop" onClick={stopListening} />

          {/* Content */}
          <div className="voice-overlay-content">
            {/* Close button */}
            <button
              onClick={stopListening}
              className="voice-overlay-close"
              aria-label={t('voice.close')}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Animated orb */}
            <div className={`voice-orb ${state}`}>
              <div className="voice-orb-inner">
                <div className="voice-orb-gradient" />
                {state === 'listening' && (
                  <>
                    <div className="voice-orb-wave voice-orb-wave-1" />
                    <div className="voice-orb-wave voice-orb-wave-2" />
                    <div className="voice-orb-wave voice-orb-wave-3" />
                  </>
                )}
                {state === 'processing' && (
                  <div className="voice-orb-spinner" />
                )}
                {state === 'success' && (
                  <div className="voice-orb-check">✓</div>
                )}
                {state === 'error' && (
                  <div className="voice-orb-x">✕</div>
                )}
                <div className="voice-orb-icon">
                  {state === 'listening' ? (
                    <Mic className="h-8 w-8 text-white" />
                  ) : state === 'success' ? null : state === 'error' ? null : (
                    <Mic className="h-8 w-8 text-white/60" />
                  )}
                </div>
              </div>
            </div>

            {/* Status text */}
            <div className="voice-status">
              <p className="voice-status-label">
                {state === 'listening' && t('voice.listening')}
                {state === 'processing' && t('voice.processing')}
                {state === 'success' && t('voice.commandRecognized')}
                {state === 'error' && t('voice.error')}
              </p>
              {transcript && (
                <p className="voice-transcript">
                  "{transcript}"
                </p>
              )}
              {feedback && (
                <p className={`voice-feedback ${state === 'success' ? 'text-green-400' : state === 'error' ? 'text-red-400' : 'text-white/70'}`}>
                  {feedback}
                </p>
              )}
            </div>

            {/* Suggested commands */}
            {state === 'listening' && (
              <div className="voice-suggestions">
                <p className="voice-suggestions-title">{t('voice.trySaying')}</p>
                <div className="voice-suggestions-list">
                  <span className="voice-suggestion-chip">"{t('voice.exFormation')}"</span>
                  <span className="voice-suggestion-chip">"{t('voice.exContact')}"</span>
                  <span className="voice-suggestion-chip">"{t('voice.exDarkMode')}"</span>
                  <span className="voice-suggestion-chip">"{t('voice.exScrollDown')}"</span>
                </div>
              </div>
            )}

            {/* Hint */}
            <p className="voice-hint">
              Alt+V · {t('voice.hint')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
