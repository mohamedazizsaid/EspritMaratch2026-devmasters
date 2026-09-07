import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import {
  Accessibility,
  Eye,
  Hand,
  Ear,
  Brain,
  Monitor,
  MousePointer2,
  Keyboard,
  Volume2,
  VolumeX,
  ZoomIn,
  Moon,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  BookOpen,
  MessageSquare,
  Users,
  BarChart3,
  Calendar,
  GraduationCap,
  Rocket,
  Mic,
  MicOff,
  Globe,
} from 'lucide-react';
import { useTranslation, type Language } from '../lib/i18n';
import { API_CONFIG } from '../../services/api/config';

// ─── Language → TTS locale mapping ──────────────────────────────────────────
const TTS_LOCALES: Record<Language, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-SA',
  es: 'es-ES',
};

const LANG_LABELS: Record<Language, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
  es: 'Español',
};

const LANG_FLAGS: Record<Language, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  ar: '🇸🇦',
  es: '🇪🇸',
};

// ─── TTS helpers ─────────────────────────────────────────────────────────────
function speak(text: string, lang: string = 'fr-FR') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

// ─── Simple template helper: replace {key} with values ──────────────────────
function tpl(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ─── Types ──────────────────────────────────────────────────────
interface AccessibilityAnswer {
  id: string;
  question: string;
  answer: boolean | null;
  icon: React.ReactNode;
  category: 'vision' | 'motor' | 'hearing' | 'cognitive';
  recommendation: string;
}

interface GuidedTourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  tip?: string;
}

interface OnBoardingProps {
  userId: string;
  userName: string;
  userRole: string;
  onComplete: () => void;
}

// ─── Composant principal ────────────────────────────────────────
export function OnBoarding({ userId, userName, userRole, onComplete }: OnBoardingProps) {
  const { t, lang, setLang } = useTranslation();
  const ttsLocale = TTS_LOCALES[lang];
  const [phase, setPhase] = useState<'welcome' | 'questionnaire' | 'tour' | 'complete'>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [micListening, setMicListening] = useState(false);
  const [micTranscript, setMicTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const micTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAnswerRef = useRef<((value: boolean) => void) | null>(null);
  const pendingNavRef = useRef<((cmd: string) => void) | null>(null);

  // ─── Auto-read helper ─────────────────────────────────────
  const announce = useCallback((text: string) => {
    if (voiceEnabled) {
      speak(text, ttsLocale);
    }
  }, [voiceEnabled, ttsLocale]);

  // ─── Speech Recognition (Mic for Oui/Non + navigation) ────
  const stopMicListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (micTimeoutRef.current) {
      clearTimeout(micTimeoutRef.current);
      micTimeoutRef.current = null;
    }
    setMicListening(false);
  }, []);

  const startMicListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (voiceEnabled) speak(t('onboarding.ttsSpeechNotSupported'), ttsLocale);
      return;
    }

    // Stop any current session first
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    // Stop TTS so mic doesn't pick it up
    stopSpeaking();

    const recognition = new SpeechRecognition();
    recognition.lang = ttsLocale;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onstart = () => {
      setMicListening(true);
      setMicTranscript('');
    };

    recognition.onresult = (event: any) => {
      // Collect all alternatives for better matching
      const alternatives: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        for (let j = 0; j < event.results[i].length; j++) {
          alternatives.push(event.results[i][j].transcript.toLowerCase().trim());
        }
      }

      const allText = alternatives.join(' ');
      setMicTranscript(alternatives[0] || '');

      // ── Match Yes / No ──
      const yesWords = ['oui', 'yes', 'ouais', 'absolument', 'tout à fait', 'exactement', 'bien sûr', 'affirmatif', 'ok', 'si', 'نعم', 'sí'];
      const noWords = ['non', 'no', 'pas', 'jamais', 'négatif', 'nan', 'nope', 'لا'];

      const isYes = yesWords.some(w => allText.includes(w));
      const isNo = noWords.some(w => allText.includes(w));

      if (isYes && !isNo && pendingAnswerRef.current) {
        pendingAnswerRef.current(true);
        pendingAnswerRef.current = null;
        setMicListening(false);
        return;
      }
      if (isNo && !isYes && pendingAnswerRef.current) {
        pendingAnswerRef.current(false);
        pendingAnswerRef.current = null;
        setMicListening(false);
        return;
      }

      // ── Match Navigation commands ──
      const navCommands: Record<string, string[]> = {
        suivant: ['suivant', 'next', 'prochain', 'continue', 'continuer', 'avancer'],
        precedent: ['précédent', 'precedent', 'previous', 'retour', 'revenir', 'reculer', 'arrière'],
        commencer: ['commencer', 'start', 'début', 'débuter', 'c\'est parti', 'allons-y', 'go'],
        terminer: ['terminer', 'finish', 'finir', 'fin', 'compléter', 'valider'],
        passer: ['passer', 'skip', 'sauter'],
      };

      for (const [cmd, keywords] of Object.entries(navCommands)) {
        if (keywords.some(kw => allText.includes(kw))) {
          if (pendingNavRef.current) {
            pendingNavRef.current(cmd);
            pendingNavRef.current = null;
          }
          setMicListening(false);
          return;
        }
      }

      // Not understood
      if (voiceEnabled) {
        speak(t('onboarding.ttsNotUnderstood'), ttsLocale);
      }
      setMicListening(false);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech' && voiceEnabled) {
        speak(t('onboarding.ttsNoSpeech'), ttsLocale);
      }
      setMicListening(false);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setMicListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Auto-stop after 6 seconds
    if (micTimeoutRef.current) clearTimeout(micTimeoutRef.current);
    micTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 6000);
  }, [voiceEnabled, ttsLocale, t]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (micTimeoutRef.current) clearTimeout(micTimeoutRef.current);
    };
  }, []);

  // ── Set up answer callback when in questionnaire phase ──
  useEffect(() => {
    if (phase === 'questionnaire') {
      pendingAnswerRef.current = (value: boolean) => {
        handleAnswerFromVoice(value);
      };
    } else {
      pendingAnswerRef.current = null;
    }
  }, [phase, currentQuestion]);

  // ── Set up navigation callback for all phases ──
  useEffect(() => {
    pendingNavRef.current = (cmd: string) => {
      if (phase === 'welcome' && (cmd === 'commencer' || cmd === 'suivant')) {
        setPhase('questionnaire');
        if (voiceEnabled) speak(t('onboarding.ttsStartQuestionnaire'), ttsLocale);
      } else if (phase === 'questionnaire') {
        if (cmd === 'precedent' && currentQuestion > 0) {
          setCurrentQuestion(prev => prev - 1);
          if (voiceEnabled) speak(t('onboarding.ttsPrevQuestion'), ttsLocale);
        } else if (cmd === 'passer') {
          // Skip question (answer null, move to next)
          if (currentQuestion < totalSteps - 1) {
            setCurrentQuestion(prev => prev + 1);
            if (voiceEnabled) speak(t('onboarding.ttsNextQuestion'), ttsLocale);
          } else {
            setPhase('tour');
            if (voiceEnabled) speak(t('onboarding.ttsToTour'), ttsLocale);
          }
        }
      } else if (phase === 'tour') {
        if (cmd === 'suivant' && currentTourStep < tourSteps.length - 1) {
          setCurrentTourStep(prev => prev + 1);
        } else if (cmd === 'precedent') {
          if (currentTourStep > 0) {
            setCurrentTourStep(prev => prev - 1);
          } else {
            setPhase('questionnaire');
            setCurrentQuestion(totalSteps - 1);
          }
          if (voiceEnabled) speak(t('onboarding.ttsPrevStep'), ttsLocale);
        } else if ((cmd === 'terminer' || cmd === 'suivant') && currentTourStep === tourSteps.length - 1) {
          handleComplete();
        }
      }
    };
  }, [phase, currentQuestion, currentTourStep, voiceEnabled]);

  // ── Auto-start mic after TTS finishes reading a question ──
  useEffect(() => {
    if (phase === 'questionnaire' && voiceEnabled && !micListening) {
      // Wait for TTS to finish before auto-starting mic
      const delay = setTimeout(() => {
        if (phase === 'questionnaire') {
          startMicListening();
        }
      }, 4000); // Give TTS ~4s to read the question
      return () => clearTimeout(delay);
    }
  }, [phase, currentQuestion, voiceEnabled]);
  const [answers, setAnswers] = useState<AccessibilityAnswer[]>([
    {
      id: 'low_vision',
      question: 'qLowVision',
      answer: null,
      icon: <Eye className="h-6 w-6" />,
      category: 'vision',
      recommendation: 'fontSize',
    },
    {
      id: 'high_contrast',
      question: 'qHighContrast',
      answer: null,
      icon: <Monitor className="h-6 w-6" />,
      category: 'vision',
      recommendation: 'highContrast',
    },
    {
      id: 'dark_mode',
      question: 'qDarkMode',
      answer: null,
      icon: <Moon className="h-6 w-6" />,
      category: 'vision',
      recommendation: 'darkMode',
    },
    {
      id: 'motor_difficulty',
      question: 'qMotorDifficulty',
      answer: null,
      icon: <Hand className="h-6 w-6" />,
      category: 'motor',
      recommendation: 'keyboard',
    },
    {
      id: 'keyboard_nav',
      question: 'qKeyboardNav',
      answer: null,
      icon: <Keyboard className="h-6 w-6" />,
      category: 'motor',
      recommendation: 'keyboardNav',
    },
    {
      id: 'large_click',
      question: 'qLargeClick',
      answer: null,
      icon: <MousePointer2 className="h-6 w-6" />,
      category: 'motor',
      recommendation: 'largeTargets',
    },
    {
      id: 'screen_reader',
      question: 'qScreenReader',
      answer: null,
      icon: <Volume2 className="h-6 w-6" />,
      category: 'hearing',
      recommendation: 'voiceReader',
    },
    {
      id: 'reduce_motion',
      question: 'qReduceMotion',
      answer: null,
      icon: <Brain className="h-6 w-6" />,
      category: 'cognitive',
      recommendation: 'reducedMotion',
    },
  ]);

  // Helper to get translated question text
  const getQuestionText = (q: AccessibilityAnswer) => t(`onboarding.${q.question}`);

  // ─── Auto-read: Welcome Phase ──────────────────────────────
  useEffect(() => {
    if (phase === 'welcome' && voiceEnabled) {
      announce(tpl(t('onboarding.ttsWelcome'), { name: userName }));
    }
  }, [phase, voiceEnabled, userName, announce, t]);

  // ─── Auto-read: Questionnaire questions ────────────────────
  useEffect(() => {
    if (phase === 'questionnaire' && voiceEnabled) {
      const q = answers[currentQuestion];
      announce(tpl(t('onboarding.ttsQuestionAnnounce'), {
        current: currentQuestion + 1,
        total: answers.length,
        category: getCategoryLabel(q.category),
        question: getQuestionText(q),
      }));
    }
  }, [phase, currentQuestion, voiceEnabled, answers, announce, t]);

  // ─── Auto-read: Tour steps ─────────────────────────────────
  useEffect(() => {
    if (phase === 'tour' && voiceEnabled) {
      const step = tourSteps[currentTourStep];
      if (step) {
        const text = `${step.title}. ${step.description}${step.tip ? `. ${t('onboarding.tourTip')} ${step.tip}` : ''}`;
        announce(text);
      }
    }
  }, [phase, currentTourStep, voiceEnabled, t]);

  // ─── Auto-read: Complete ───────────────────────────────────
  useEffect(() => {
    if (phase === 'complete' && voiceEnabled) {
      announce(t('onboarding.ttsCompleteDone'));
    }
  }, [phase, voiceEnabled, announce, t]);

  // ─── Tour Steps by role ────────────────────────────────────
  const getGuidedTourSteps = (): GuidedTourStep[] => {
    const commonSteps: GuidedTourStep[] = [
      {
        title: t('onboarding.tourDashboardTitle'),
        description: t('onboarding.tourDashboardDesc'),
        icon: <BarChart3 className="h-8 w-8" />,
        tip: t('onboarding.tourDashboardTip'),
      },
      {
        title: t('onboarding.tourA11yTitle'),
        description: t('onboarding.tourA11yDesc'),
        icon: <Accessibility className="h-8 w-8" />,
        tip: t('onboarding.tourA11yTip'),
      },
      {
        title: t('onboarding.tourVoiceTitle'),
        description: t('onboarding.tourVoiceDesc'),
        icon: <Volume2 className="h-8 w-8" />,
        tip: t('onboarding.tourVoiceTip'),
      },
      {
        title: t('onboarding.tourAssistantTitle'),
        description: t('onboarding.tourAssistantDesc'),
        icon: <Mic className="h-8 w-8" />,
        tip: t('onboarding.tourAssistantTip'),
      },
    ];

    if (userRole === 'formateurs' || userRole === 'Formateurs') {
      return [
        ...commonSteps,
        {
          title: t('onboarding.tourFormationsTitle'),
          description: t('onboarding.tourFormationsDesc'),
          icon: <BookOpen className="h-8 w-8" />,
          tip: t('onboarding.tourFormationsTip'),
        },
        {
          title: t('onboarding.tourStudentsTitle'),
          description: t('onboarding.tourStudentsDesc'),
          icon: <Users className="h-8 w-8" />,
          tip: t('onboarding.tourStudentsTip'),
        },
        {
          title: t('onboarding.tourCalendarTitle'),
          description: t('onboarding.tourCalendarDesc'),
          icon: <Calendar className="h-8 w-8" />,
          tip: t('onboarding.tourCalendarTip'),
        },
        {
          title: t('onboarding.tourAITitle'),
          description: t('onboarding.tourAIDesc'),
          icon: <MessageSquare className="h-8 w-8" />,
          tip: t('onboarding.tourAITip'),
        },
      ];
    }

    if (userRole === 'responsableformation') {
      return [
        ...commonSteps,
        {
          title: t('onboarding.tourManageStudentsTitle'),
          description: t('onboarding.tourManageStudentsDesc'),
          icon: <GraduationCap className="h-8 w-8" />,
          tip: t('onboarding.tourManageStudentsTip'),
        },
        {
          title: t('onboarding.tourManageFormationsTitle'),
          description: t('onboarding.tourManageFormationsDesc'),
          icon: <BookOpen className="h-8 w-8" />,
          tip: t('onboarding.tourManageFormationsTip'),
        },
        {
          title: t('onboarding.tourInscriptionsTitle'),
          description: t('onboarding.tourInscriptionsDesc'),
          icon: <Calendar className="h-8 w-8" />,
          tip: t('onboarding.tourInscriptionsTip'),
        },
        {
          title: t('onboarding.tourCertificationsTitle'),
          description: t('onboarding.tourCertificationsDesc'),
          icon: <CheckCircle2 className="h-8 w-8" />,
          tip: t('onboarding.tourCertificationsTip'),
        },
      ];
    }

    if (userRole === 'admin' || userRole === 'Admin') {
      return [
        ...commonSteps,
        {
          title: t('onboarding.tourUsersTitle'),
          description: t('onboarding.tourUsersDesc'),
          icon: <Users className="h-8 w-8" />,
          tip: t('onboarding.tourUsersTip'),
        },
        {
          title: t('onboarding.tourAnalyticsTitle'),
          description: t('onboarding.tourAnalyticsDesc'),
          icon: <BarChart3 className="h-8 w-8" />,
          tip: t('onboarding.tourAnalyticsTip'),
        },
        {
          title: t('onboarding.tourLogsTitle'),
          description: t('onboarding.tourLogsDesc'),
          icon: <BookOpen className="h-8 w-8" />,
          tip: t('onboarding.tourLogsTip'),
        },
      ];
    }

    return commonSteps;
  };

  const tourSteps = getGuidedTourSteps();
  const totalSteps = answers.length;
  const progress = phase === 'questionnaire'
    ? ((currentQuestion + 1) / totalSteps) * 50
    : phase === 'tour'
      ? 50 + ((currentTourStep + 1) / tourSteps.length) * 50
      : phase === 'complete' ? 100 : 0;

  // ─── Handle answer (click or voice) ────────────────────────
  const handleAnswer = (value: boolean) => {
    stopMicListening(); // Stop mic if running
    const updated = [...answers];
    updated[currentQuestion].answer = value;
    setAnswers(updated);

    // Voice feedback
    if (voiceEnabled) {
      if (currentQuestion < totalSteps - 1) {
        speak(value ? t('onboarding.ttsYesNoted') : t('onboarding.ttsNoNoted'), ttsLocale);
      } else {
        speak((value ? t('onboarding.ttsYesNoted') : t('onboarding.ttsNoNoted')) + ' ' + t('onboarding.ttsQuestionnaireDone'), ttsLocale);
      }
    }

    if (currentQuestion < totalSteps - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setPhase('tour');
    }
  };

  // Same logic but callable from voice ref callback
  const handleAnswerFromVoice = (value: boolean) => {
    handleAnswer(value);
  };

  // ─── Build accessibility profile and save ──────────────────
  const buildAccessibilityProfile = () => {
    const profile: Record<string, boolean> = {};
    answers.forEach((a) => {
      profile[a.id] = a.answer === true;
    });
    return JSON.stringify(profile);
  };

  const applyAccessibilitySettings = () => {
    // Charger les paramètres existants du AccessibilityPanel
    const defaults: {
      theme: 'light' | 'dark' | 'system';
      language: 'fr' | 'en' | 'ar' | 'es';
      fontSize: number;
      voiceEnabled: boolean;
      highContrast: boolean;
      reducedMotion: boolean;
    } = {
      theme: 'light',
      language: 'fr',
      fontSize: 100,
      voiceEnabled: false,
      highContrast: false,
      reducedMotion: false,
    };

    let current = { ...defaults };
    try {
      const raw = localStorage.getItem('accessibility-settings');
      if (raw) current = { ...defaults, ...JSON.parse(raw) };
    } catch { /* ignore */ }

    // Appliquer les réponses du questionnaire au format AccessibilityPanel
    answers.forEach((a) => {
      if (a.answer === true) {
        switch (a.recommendation) {
          case 'fontSize':
            current.fontSize = 120; // 120% (compatible avec le slider 75-150)
            break;
          case 'highContrast':
            current.highContrast = true;
            break;
          case 'darkMode':
            current.theme = 'dark';
            break;
          case 'reducedMotion':
            current.reducedMotion = true;
            break;
          case 'voiceReader':
            current.voiceEnabled = true;
            break;
          case 'largeTargets':
            current.fontSize = Math.max(current.fontSize, 115);
            break;
        }
      }
    });

    // Persister dans le même format que AccessibilityPanel (LS_KEY = 'accessibility-settings')
    localStorage.setItem('accessibility-settings', JSON.stringify(current));

    // Appliquer au DOM exactement comme AccessibilityPanel le fait
    // Thème
    if (current.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (current.theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
    // Font size via CSS custom property
    document.documentElement.style.setProperty('--font-size', `${current.fontSize}%`);
    // High contrast (même classe que AccessibilityPanel)
    document.documentElement.classList.toggle('high-contrast', current.highContrast);
    // Reduced motion (même classe 'reduce-motion' que AccessibilityPanel)
    document.documentElement.classList.toggle('reduce-motion', current.reducedMotion);
  };

  // ─── Complete onboarding ───────────────────────────────────
  const handleComplete = async () => {
    try {
      // Apply accessibility settings locally
      applyAccessibilitySettings();

      // Save to backend
      const accessibilityData = buildAccessibilityProfile();
      const token = localStorage.getItem('access_token');

      await fetch(`${API_CONFIG.BASE_URL}/auth/onboarding/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accessibility: accessibilityData }),
      });

      setPhase('complete');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Erreur onboarding:', error);
      onComplete();
    }
  };

  // ─── Category colors ──────────────────────────────────────
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'vision': return 'text-blue-500 bg-blue-500/10';
      case 'motor': return 'text-orange-500 bg-orange-500/10';
      case 'hearing': return 'text-green-500 bg-green-500/10';
      case 'cognitive': return 'text-purple-500 bg-purple-500/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'vision': return t('onboarding.catVision');
      case 'motor': return t('onboarding.catMotor');
      case 'hearing': return t('onboarding.catHearing');
      case 'cognitive': return t('onboarding.catCognitive');
      default: return '';
    }
  };

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{t('onboarding.progressWelcome')}</span>
            <span>{t('onboarding.progressAccessibility')}</span>
            <span>{t('onboarding.progressTour')}</span>
            <span>{t('onboarding.progressDone')}</span>
          </div>
        </div>

        {/* Floating voice toggle — always visible */}
        <div className="fixed top-6 right-6 z-[110] flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border-2 border-primary/20 bg-background/95 backdrop-blur-sm px-4 py-2 shadow-lg">
            {voiceEnabled ? (
              <Volume2 className="h-4 w-4 text-green-500" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {voiceEnabled ? t('onboarding.voiceToggleOn') : t('onboarding.voiceToggleLabel')}
            </span>
            <Switch
              checked={voiceEnabled}
              onCheckedChange={(checked) => {
                setVoiceEnabled(checked);
                if (checked) {
                  speak(t('onboarding.ttsVoiceOn'), ttsLocale);
                } else {
                  stopSpeaking();
                }
              }}
              aria-label={t('onboarding.voiceToggleAria')}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ──── WELCOME ──── */}
          {phase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Ambient glow in card */}
                <div className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 bg-primary/15 rounded-full blur-2xl" />
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                    <Sparkles className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">
                    {tpl(t('onboarding.welcomeTitle'), { name: userName })}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {t('onboarding.welcomeDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ── Language selector ── */}
                  <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-primary" />
                      <p className="font-medium text-sm">{t('onboarding.chooseLang')}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{t('onboarding.chooseLangDesc')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['fr', 'en', 'ar', 'es'] as Language[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLang(l)}
                          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            lang === l
                              ? 'border-primary bg-primary/10 text-primary shadow-sm'
                              : 'border-muted hover:border-primary/40 hover:bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          <span className="text-lg">{LANG_FLAGS[l]}</span>
                          <span>{LANG_LABELS[l]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <Accessibility className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{t('onboarding.stepAccessibility')}</p>
                        <p className="text-xs text-muted-foreground">{t('onboarding.stepAccessibilityDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <Rocket className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{t('onboarding.stepTour')}</p>
                        <p className="text-xs text-muted-foreground">{t('onboarding.stepTourDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <Volume2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{t('onboarding.stepVoice')}</p>
                        <p className="text-xs text-muted-foreground">{t('onboarding.stepVoiceDesc')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Voice activation prompt */}
                  <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${voiceEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-primary/10 text-primary'}`}>
                          {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {voiceEnabled ? t('onboarding.voiceEnabled') : t('onboarding.voiceDisabled')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {voiceEnabled ? t('onboarding.voiceEnabledDesc') : t('onboarding.voiceDisabledDesc')}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={voiceEnabled}
                        onCheckedChange={(checked) => {
                          setVoiceEnabled(checked);
                          if (checked) {
                            speak(t('onboarding.ttsVoiceOnWelcome'), ttsLocale);
                          } else {
                            stopSpeaking();
                          }
                        }}
                        aria-label={t('onboarding.voiceToggleAria')}
                      />
                    </div>
                    {voiceEnabled && (
                      <p className="text-xs text-primary/70 flex items-center gap-1.5">
                        <Mic className="h-3 w-3" />
                        {t('onboarding.voiceInstructions')}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button size="lg" onClick={() => setPhase('questionnaire')} className="gap-2 px-8">
                      {t('onboarding.startButton')}
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    {t('onboarding.estimatedDuration')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ──── QUESTIONNAIRE ──── */}
          {phase === 'questionnaire' && (
            <motion.div
              key={`q-${currentQuestion}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(answers[currentQuestion].category)}`}>
                      {answers[currentQuestion].icon}
                      {getCategoryLabel(answers[currentQuestion].category)}
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {currentQuestion + 1} / {totalSteps}
                    </span>
                  </div>
                  <CardTitle className="text-xl mt-4">
                    {getQuestionText(answers[currentQuestion])}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleAnswer(true)}
                      className="h-24 flex flex-col gap-2 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg font-bold shadow-sm"
                      aria-label={t('onboarding.answerYesAria')}
                    >
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      {t('onboarding.answerYes')}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleAnswer(false)}
                      className="h-24 flex flex-col gap-2 rounded-2xl border-2 border-border/80 bg-muted/30 hover:bg-muted/70 hover:border-border hover:scale-[1.02] active:scale-[0.98] transition-all text-lg font-bold shadow-sm"
                      aria-label={t('onboarding.answerNoAria')}
                    >
                      <span className="h-8 w-8 rounded-full border-2 border-muted-foreground flex items-center justify-center text-muted-foreground text-xl">✕</span>
                      {t('onboarding.answerNo')}
                    </Button>
                  </div>

                  {/* ── Mic answer button ── */}
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => {
                        if (micListening) {
                          stopMicListening();
                        } else {
                          stopSpeaking();
                          startMicListening();
                        }
                      }}
                      className={`group relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
                        micListening
                          ? 'bg-red-500 text-white scale-110 ring-4 ring-red-500/30 animate-pulse'
                          : 'bg-primary text-primary-foreground hover:scale-110 hover:shadow-xl ring-2 ring-primary/20'
                      }`}
                      aria-label={micListening ? t('onboarding.micStopAria') : t('onboarding.micStartAria')}
                    >
                      {micListening ? (
                        <MicOff className="h-7 w-7" />
                      ) : (
                        <Mic className="h-7 w-7" />
                      )}
                    </button>
                    <div className="text-center">
                      {micListening ? (
                        <>
                          <p className="text-sm font-medium text-primary animate-pulse">{t('onboarding.micListening')}</p>
                          {micTranscript && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {t('onboarding.micHeard')} <span className="font-medium text-foreground">"{micTranscript}"</span>
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          <Mic className="h-3 w-3 inline mr-1" />
                          {t('onboarding.micPrompt')}
                        </p>
                      )}
                    </div>
                  </div>

                  {currentQuestion > 0 && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        stopMicListening();
                        setCurrentQuestion(currentQuestion - 1);
                        if (voiceEnabled) {
                          speak(t('onboarding.ttsPrevQuestion'), ttsLocale);
                        }
                      }}
                      className="gap-2"
                      aria-label={t('onboarding.prevQuestionAria')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t('onboarding.prevQuestion')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ──── GUIDED TOUR ──── */}
          {phase === 'tour' && (
            <motion.div
              key={`tour-${currentTourStep}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('onboarding.tourLabel')}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {currentTourStep + 1} / {tourSteps.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {tourSteps[currentTourStep].icon}
                    </div>
                    <h3 className="text-xl font-semibold">
                      {tourSteps[currentTourStep].title}
                    </h3>
                    <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
                      {tourSteps[currentTourStep].description}
                    </p>
                    {tourSteps[currentTourStep].tip && (
                      <div className="inline-flex items-start gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-lg text-sm text-left max-w-lg">
                        <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span><strong>{t('onboarding.tourTip')}</strong> {tourSteps[currentTourStep].tip}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (currentTourStep > 0) {
                          setCurrentTourStep(currentTourStep - 1);
                        } else {
                          setPhase('questionnaire');
                          setCurrentQuestion(totalSteps - 1);
                        }
                        if (voiceEnabled) speak(t('onboarding.ttsPrevStep'), ttsLocale);
                      }}
                      className="gap-2"
                      aria-label={t('onboarding.tourPrevAria')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t('onboarding.tourPrev')}
                    </Button>

                    {currentTourStep < tourSteps.length - 1 ? (
                      <Button
                        onClick={() => {
                          setCurrentTourStep(currentTourStep + 1);
                        }}
                        className="gap-2"
                        aria-label={t('onboarding.tourNextAria')}
                      >
                        {t('onboarding.tourNext')}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleComplete}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        aria-label={t('onboarding.tourFinishAria')}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {t('onboarding.tourFinish')}
                      </Button>
                    )}
                  </div>

                  {/* Step dots */}
                  <div className="flex justify-center gap-2">
                    {tourSteps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === currentTourStep
                            ? 'w-6 bg-primary'
                            : idx < currentTourStep
                              ? 'w-2 bg-primary/50'
                              : 'w-2 bg-muted-foreground/20'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ──── COMPLETE ──── */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-3xl border-2 border-emerald-500/30 bg-card/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <CardContent className="py-12 text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <div className="mx-auto h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-bold">{t('onboarding.completeTitle')}</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    {t('onboarding.completeDesc')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('onboarding.completeRedirect')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
