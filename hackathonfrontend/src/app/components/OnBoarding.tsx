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
} from 'lucide-react';

// ─── TTS helpers (mêmes que AccessibilityPanel) ─────────────────────────────
function speak(text: string, lang: string = 'fr-FR') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
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
      speak(text, 'fr-FR');
    }
  }, [voiceEnabled]);

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
      if (voiceEnabled) speak('La reconnaissance vocale n\'est pas supportée par votre navigateur.', 'fr-FR');
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
    recognition.lang = 'fr-FR';
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
        speak('Je n\'ai pas compris. Dites Oui ou Non pour répondre.', 'fr-FR');
      }
      setMicListening(false);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech' && voiceEnabled) {
        speak('Aucune parole détectée. Appuyez sur le micro pour réessayer.', 'fr-FR');
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
  }, [voiceEnabled]);

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
        if (voiceEnabled) speak('Démarrage du questionnaire.', 'fr-FR');
      } else if (phase === 'questionnaire') {
        if (cmd === 'precedent' && currentQuestion > 0) {
          setCurrentQuestion(prev => prev - 1);
          if (voiceEnabled) speak('Question précédente.', 'fr-FR');
        } else if (cmd === 'passer') {
          // Skip question (answer null, move to next)
          if (currentQuestion < totalSteps - 1) {
            setCurrentQuestion(prev => prev + 1);
            if (voiceEnabled) speak('Question suivante.', 'fr-FR');
          } else {
            setPhase('tour');
            if (voiceEnabled) speak('Passons à la visite guidée.', 'fr-FR');
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
          if (voiceEnabled) speak('Étape précédente.', 'fr-FR');
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
      question: 'Avez-vous des difficultés de vision ou utilisez-vous un agrandisseur d\'écran ?',
      answer: null,
      icon: <Eye className="h-6 w-6" />,
      category: 'vision',
      recommendation: 'fontSize',
    },
    {
      id: 'high_contrast',
      question: 'Avez-vous besoin de contrastes élevés pour lire le texte à l\'écran ?',
      answer: null,
      icon: <Monitor className="h-6 w-6" />,
      category: 'vision',
      recommendation: 'highContrast',
    },
    {
      id: 'dark_mode',
      question: 'Préférez-vous un mode sombre pour réduire la fatigue oculaire ?',
      answer: null,
      icon: <Moon className="h-6 w-6" />,
      category: 'vision',
      recommendation: 'darkMode',
    },
    {
      id: 'motor_difficulty',
      question: 'Avez-vous des difficultés motrices pour utiliser une souris classique ?',
      answer: null,
      icon: <Hand className="h-6 w-6" />,
      category: 'motor',
      recommendation: 'keyboard',
    },
    {
      id: 'keyboard_nav',
      question: 'Préférez-vous naviguer exclusivement avec le clavier ?',
      answer: null,
      icon: <Keyboard className="h-6 w-6" />,
      category: 'motor',
      recommendation: 'keyboardNav',
    },
    {
      id: 'large_click',
      question: 'Avez-vous besoin de zones cliquables plus grandes ?',
      answer: null,
      icon: <MousePointer2 className="h-6 w-6" />,
      category: 'motor',
      recommendation: 'largeTargets',
    },
    {
      id: 'screen_reader',
      question: 'Utilisez-vous un lecteur d\'écran ou la lecture vocale ?',
      answer: null,
      icon: <Volume2 className="h-6 w-6" />,
      category: 'hearing',
      recommendation: 'voiceReader',
    },
    {
      id: 'reduce_motion',
      question: 'Les animations à l\'écran vous gênent-elles ou provoquent-elles un malaise ?',
      answer: null,
      icon: <Brain className="h-6 w-6" />,
      category: 'cognitive',
      recommendation: 'reducedMotion',
    },
  ]);

  // ─── Auto-read: Welcome Phase ──────────────────────────────
  useEffect(() => {
    if (phase === 'welcome' && voiceEnabled) {
      announce(`Bienvenue ${userName}! Avant de commencer, nous allons personnaliser votre expérience. Cliquez sur Commencer pour débuter le questionnaire d'accessibilité.`);
    }
  }, [phase, voiceEnabled, userName, announce]);

  // ─── Auto-read: Questionnaire questions ────────────────────
  useEffect(() => {
    if (phase === 'questionnaire' && voiceEnabled) {
      const q = answers[currentQuestion];
      announce(`Question ${currentQuestion + 1} sur ${answers.length}. Catégorie ${getCategoryLabel(q.category)}. ${q.question}. Répondez Oui ou Non.`);
    }
  }, [phase, currentQuestion, voiceEnabled, answers, announce]);

  // ─── Auto-read: Tour steps ─────────────────────────────────
  useEffect(() => {
    if (phase === 'tour' && voiceEnabled) {
      const step = tourSteps[currentTourStep];
      if (step) {
        const text = `${step.title}. ${step.description}${step.tip ? `. Astuce : ${step.tip}` : ''}`;
        announce(text);
      }
    }
  }, [phase, currentTourStep, voiceEnabled]);

  // ─── Auto-read: Complete ───────────────────────────────────
  useEffect(() => {
    if (phase === 'complete' && voiceEnabled) {
      announce('Configuration terminée ! Vos préférences ont été sauvegardées. La plateforme est maintenant adaptée à vos besoins. Redirection automatique.');
    }
  }, [phase, voiceEnabled, announce]);

  // ─── Tour Steps by role ────────────────────────────────────
  const getGuidedTourSteps = (): GuidedTourStep[] => {
    const commonSteps: GuidedTourStep[] = [
      {
        title: '🎯 Votre tableau de bord',
        description: 'C\'est votre espace principal. Vous y trouverez un résumé de vos activités, statistiques et accès rapide aux fonctionnalités.',
        icon: <BarChart3 className="h-8 w-8" />,
        tip: 'Vous pouvez personnaliser l\'affichage avec le panneau d\'accessibilité en haut à droite.',
      },
      {
        title: '♿ Paramètres d\'accessibilité',
        description: 'Cliquez sur l\'icône d\'accessibilité en bas à droite pour ajuster : taille du texte, mode sombre/clair, contraste élevé, lecture vocale et langue.',
        icon: <Accessibility className="h-8 w-8" />,
        tip: 'Vos préférences sont sauvegardées automatiquement et appliquées à chaque connexion.',
      },
      {
        title: '🔊 Lecture vocale',
        description: 'Activez la lecture vocale dans le panneau d\'accessibilité pour que chaque élément cliqué ou navigué au clavier soit lu à haute voix. Idéal pour les utilisateurs malvoyants ou en situation de handicap visuel.',
        icon: <Volume2 className="h-8 w-8" />,
        tip: 'La lecture vocale fonctionne aussi avec la navigation au clavier (touche Tab). Appuyez sur Alt+S pour accéder directement au contenu principal.',
      },
      {
        title: '🎙️ Assistant vocal',
        description: 'Utilisez l\'assistant vocal pour naviguer à la voix ! Appuyez sur Alt+V ou cliquez sur le bouton micro. Dites "formations", "contact", "mode sombre" ou "descendre" pour contrôler la plateforme sans souris ni clavier.',
        icon: <Mic className="h-8 w-8" />,
        tip: 'L\'assistant vocal supporte le français, l\'anglais, l\'arabe et l\'espagnol. Vous pouvez l\'activer depuis le panneau d\'accessibilité.',
      },
    ];

    if (userRole === 'formateurs' || userRole === 'Formateurs') {
      return [
        ...commonSteps,
        {
          title: '📚 Vos formations',
          description: 'L\'onglet "Mes formations" affiche toutes les formations qui vous sont assignées avec le nombre d\'étudiants et la progression.',
          icon: <BookOpen className="h-8 w-8" />,
          tip: 'Cliquez sur "Voir détails" pour accéder aux niveaux et séances d\'une formation.',
        },
        {
          title: '👨‍🎓 Vos étudiants',
          description: 'L\'onglet "Mes étudiants" liste tous les élèves inscrits à vos formations. Cliquez sur "Voir profil" pour consulter leur fiche détaillée.',
          icon: <Users className="h-8 w-8" />,
          tip: 'Utilisez la barre de recherche pour trouver rapidement un étudiant.',
        },
        {
          title: '📅 Calendrier des séances',
          description: 'Le calendrier vous montre toutes vos séances planifiées. Les dates avec des séances sont marquées en couleur.',
          icon: <Calendar className="h-8 w-8" />,
          tip: 'Naviguez entre les mois pour voir vos prochaines séances.',
        },
        {
          title: '🤖 Assistant IA',
          description: 'L\'assistant pédagogique IA, propulsé par Gemini, peut vous aider à préparer vos cours, générer des exercices et répondre à vos questions pédagogiques.',
          icon: <MessageSquare className="h-8 w-8" />,
          tip: 'Sélectionnez une formation comme contexte pour des réponses plus précises.',
        },
      ];
    }

    if (userRole === 'responsableformation') {
      return [
        ...commonSteps,
        {
          title: '👥 Gestion des élèves',
          description: 'Créez des fiches élèves, suivez leurs inscriptions et leur parcours de formation. Vous pouvez ajouter des photos via la caméra ou manuellement.',
          icon: <GraduationCap className="h-8 w-8" />,
          tip: 'Les élèves peuvent être inscrits à plusieurs formations simultanément.',
        },
        {
          title: '📚 Gestion des formations',
          description: 'Créez des formations, qui génèrent automatiquement des niveaux et séances. Activez ou désactivez les niveaux selon la progression.',
          icon: <BookOpen className="h-8 w-8" />,
          tip: 'Les niveaux sont déverrouillés automatiquement quand le précédent est complété.',
        },
        {
          title: '📋 Inscriptions & Présences',
          description: 'Gérez les inscriptions des élèves et marquez leur présence aux séances. Le taux de présence est calculé automatiquement.',
          icon: <Calendar className="h-8 w-8" />,
          tip: 'Un taux de présence de 75% minimum est requis pour la certification.',
        },
        {
          title: '🎓 Certifications',
          description: 'Générez des certificats PDF pour les élèves éligibles. Le système vérifie automatiquement le taux de présence requis.',
          icon: <CheckCircle2 className="h-8 w-8" />,
          tip: 'Les certificats sont générés en PDF téléchargeable.',
        },
      ];
    }

    if (userRole === 'admin' || userRole === 'Admin') {
      return [
        ...commonSteps,
        {
          title: '👤 Gestion des utilisateurs',
          description: 'Créez, modifiez et supprimez des utilisateurs. Changez leur rôle entre Formateur et Responsable de formation.',
          icon: <Users className="h-8 w-8" />,
          tip: 'Seul l\'administrateur peut créer des comptes et changer les rôles.',
        },
        {
          title: '📊 Analytics & Statistiques',
          description: 'Consultez des statistiques détaillées : taux de présence, inscriptions par mois, répartition des rôles et progression des formations.',
          icon: <BarChart3 className="h-8 w-8" />,
          tip: 'Actualisez les données en cliquant sur le bouton Actualiser.',
        },
        {
          title: '📝 Journal d\'activité',
          description: 'Suivez toutes les actions effectuées sur la plateforme : créations, modifications, suppressions. Filtrez par type, action ou méthode HTTP.',
          icon: <BookOpen className="h-8 w-8" />,
          tip: 'Les logs sont paginés, utilisez les boutons de navigation pour voir l\'historique.',
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
        speak(value ? 'Oui, noté.' : 'Non, noté.', 'fr-FR');
      } else {
        speak(value ? 'Oui, noté. Questionnaire terminé ! Passons à la visite guidée.' : 'Non, noté. Questionnaire terminé ! Passons à la visite guidée.', 'fr-FR');
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

      await fetch(`http://localhost:3000/api/auth/onboarding/${userId}`, {
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
      case 'vision': return 'Vision';
      case 'motor': return 'Motricité';
      case 'hearing': return 'Audition';
      case 'cognitive': return 'Cognitif';
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
            <span>Bienvenue</span>
            <span>Accessibilité</span>
            <span>Visite guidée</span>
            <span>Terminé</span>
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
              {voiceEnabled ? 'Lecture vocale activée' : 'Lecture vocale'}
            </span>
            <Switch
              checked={voiceEnabled}
              onCheckedChange={(checked) => {
                setVoiceEnabled(checked);
                if (checked) {
                  speak('Lecture vocale activée. Je vais vous guider tout au long de la configuration.', 'fr-FR');
                } else {
                  stopSpeaking();
                }
              }}
              aria-label="Activer ou désactiver la lecture vocale"
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
              <Card className="border-2 border-primary/20 shadow-xl">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                    <Sparkles className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">
                    Bienvenue, {userName} ! 🎉
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Avant de commencer, nous allons personnaliser votre expérience en quelques étapes rapides.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <Accessibility className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Questionnaire d'accessibilité</p>
                        <p className="text-xs text-muted-foreground">8 questions pour adapter la plateforme</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <Rocket className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Visite guidée</p>
                        <p className="text-xs text-muted-foreground">Découvrez les fonctionnalités clés</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <Volume2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Lecture vocale</p>
                        <p className="text-xs text-muted-foreground">Chaque étape lue à haute voix</p>
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
                            {voiceEnabled ? '🔊 Lecture vocale activée' : '🔇 Activer la lecture vocale ?'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {voiceEnabled ? 'Chaque question et étape sera lue automatiquement' : 'Recommandé pour les utilisateurs malvoyants'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={voiceEnabled}
                        onCheckedChange={(checked) => {
                          setVoiceEnabled(checked);
                          if (checked) {
                            speak('Lecture vocale activée. Je vais vous accompagner tout au long de la configuration. Cliquez sur Commencer pour débuter.', 'fr-FR');
                          } else {
                            stopSpeaking();
                          }
                        }}
                        aria-label="Activer la lecture vocale pour l'onboarding"
                      />
                    </div>
                    {voiceEnabled && (
                      <p className="text-xs text-primary/70 flex items-center gap-1.5">
                        <Mic className="h-3 w-3" />
                        Vous pouvez répondre aux questions par la voix en disant "Oui" ou "Non", ou naviguer en disant "Suivant", "Précédent", "Commencer" ou "Terminer".
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button size="lg" onClick={() => setPhase('questionnaire')} className="gap-2 px-8">
                      Commencer
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    Durée estimée : 2 minutes • Vos réponses sont sauvegardées
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
              <Card className="border-2 border-primary/20 shadow-xl">
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
                    {answers[currentQuestion].question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleAnswer(true)}
                      className="h-24 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all text-lg"
                      aria-label="Répondre Oui"
                    >
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      Oui
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleAnswer(false)}
                      className="h-24 flex flex-col gap-2 hover:bg-muted transition-all text-lg"
                      aria-label="Répondre Non"
                    >
                      <span className="h-8 w-8 rounded-full border-2 border-muted-foreground flex items-center justify-center text-muted-foreground text-xl">✕</span>
                      Non
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
                      aria-label={micListening ? 'Arrêter l\'écoute vocale' : 'Répondre par la voix'}
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
                          <p className="text-sm font-medium text-primary animate-pulse">🎙️ J'écoute... dites Oui ou Non</p>
                          {micTranscript && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Entendu : <span className="font-medium text-foreground">"{micTranscript}"</span>
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          <Mic className="h-3 w-3 inline mr-1" />
                          Appuyez pour répondre à la voix
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
                          speak('Question précédente.', 'fr-FR');
                        }
                      }}
                      className="gap-2"
                      aria-label="Retourner à la question précédente"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Question précédente
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
              <Card className="border-2 border-primary/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Visite guidée
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
                        <span><strong>Astuce :</strong> {tourSteps[currentTourStep].tip}</span>
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
                        if (voiceEnabled) speak('Étape précédente.', 'fr-FR');
                      }}
                      className="gap-2"
                      aria-label="Étape précédente"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>

                    {currentTourStep < tourSteps.length - 1 ? (
                      <Button
                        onClick={() => {
                          setCurrentTourStep(currentTourStep + 1);
                        }}
                        className="gap-2"
                        aria-label="Étape suivante"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleComplete}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        aria-label="Terminer la configuration"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Terminer
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
              <Card className="border-2 border-green-500/30 shadow-xl">
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
                  <h2 className="text-2xl font-bold">Vous êtes prêt ! 🚀</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Vos préférences ont été sauvegardées. La plateforme est maintenant adaptée à vos besoins.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirection automatique...
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
