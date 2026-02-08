import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import {
  Accessibility,
  Sun,
  Moon,
  MonitorCog,
  Languages,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  RotateCcw,
  Eye,
  Type,
  Contrast,
  Mic,
  Crosshair,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { useEyeTracking } from '../../components/EyeTrackingContext';

// ─── Types ───────────────────────────────────────────────────────────────────
type Theme = 'light' | 'dark' | 'system';
type Language = 'fr' | 'en' | 'ar' | 'es';

interface AccessibilitySettings {
  theme: Theme;
  language: Language;
  fontSize: number;
  voiceEnabled: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  theme: 'light',
  language: 'fr',
  fontSize: 100,
  voiceEnabled: false,
  highContrast: false,
  reducedMotion: false,
};

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
];

const LS_KEY = 'accessibility-settings';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadSettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

function persistSettings(s: AccessibilitySettings) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

// ─── Text-to-Speech (TTS) ───────────────────────────────────────────────────
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

// ─── Component ───────────────────────────────────────────────────────────────
interface AccessibilityPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'left' | 'right';
}

export function AccessibilityPanel({
  open,
  onOpenChange,
  side = 'right',
}: AccessibilityPanelProps) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);
  const voiceListenerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const focusListenerRef = useRef<((e: FocusEvent) => void) | null>(null);
  const keyListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null);

  // ── Apply theme ──
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [settings.theme]);

  // ── Apply font size ──
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}%`);
  }, [settings.fontSize]);

  // ── Apply high contrast ──
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  }, [settings.highContrast]);

  // ── Apply reduced motion ──
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
  }, [settings.reducedMotion]);

  // ── Apply language ──
  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings.language]);

  // ── Voice reader: click-to-speak + Tab-to-speak ──
  useEffect(() => {
    // Cleanup previous listeners
    if (voiceListenerRef.current) {
      document.removeEventListener('click', voiceListenerRef.current);
      voiceListenerRef.current = null;
    }
    if (focusListenerRef.current) {
      document.removeEventListener('focusin', focusListenerRef.current);
      focusListenerRef.current = null;
    }
    if (keyListenerRef.current) {
      document.removeEventListener('keydown', keyListenerRef.current);
      keyListenerRef.current = null;
    }

    if (settings.voiceEnabled) {
      const langMap: Record<Language, string> = {
        fr: 'fr-FR', en: 'en-US', ar: 'ar-SA', es: 'es-ES',
      };
      const lang = langMap[settings.language] || 'fr-FR';

      // Helper to extract readable text from an element
      const getReadableText = (el: HTMLElement): string => {
        // Priority: aria-label > alt > title > placeholder > visible text
        return (
          el.getAttribute('aria-label') ||
          el.getAttribute('alt') ||
          el.getAttribute('title') ||
          el.getAttribute('placeholder') ||
          el.innerText?.trim() ||
          ''
        );
      };

      // Click handler
      const clickHandler = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-accessibility-panel]')) return;
        const text = getReadableText(target);
        if (text) speak(text, lang);
      };

      // Focus handler (fires on Tab navigation)
      const focusHandler = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (!target || target.closest('[data-accessibility-panel]')) return;

        // Only speak for keyboard-driven focus (not mouse clicks)
        // We detect this by checking if the element has :focus-visible
        requestAnimationFrame(() => {
          try {
            if (!target.matches(':focus-visible')) return;
          } catch {
            // :focus-visible not supported, always speak
          }

          let text = getReadableText(target);

          // Add role context for screen reader clarity
          const tagName = target.tagName.toLowerCase();
          const role = target.getAttribute('role') || '';

          if (tagName === 'button' || role === 'button') {
            text = text; // button context is implicit
          } else if (tagName === 'a' || role === 'link') {
            text += `, ${settings.language === 'fr' ? 'lien' : settings.language === 'ar' ? 'رابط' : settings.language === 'es' ? 'enlace' : 'link'}`;
          } else if (tagName === 'input' || tagName === 'textarea') {
            const type = (target as HTMLInputElement).type || 'text';
            const label = getReadableText(target) || type;
            text = label;
          } else if (role === 'tab') {
            text += `, ${settings.language === 'fr' ? 'onglet' : settings.language === 'ar' ? 'علامة تبويب' : settings.language === 'es' ? 'pestaña' : 'tab'}`;
          }

          if (text) speak(text, lang);
        });
      };

      // Skip-navigation shortcut: Alt+S to skip to main content
      const keyHandler = (e: KeyboardEvent) => {
        if (e.altKey && e.key === 's') {
          e.preventDefault();
          const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('.flex-1');
          if (main) {
            const firstFocusable = main.querySelector<HTMLElement>(
              'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
            );
            if (firstFocusable) {
              firstFocusable.focus();
              const text = getReadableText(firstFocusable);
              if (text) speak(text, lang);
            }
          }
        }
      };

      voiceListenerRef.current = clickHandler;
      focusListenerRef.current = focusHandler;
      keyListenerRef.current = keyHandler;

      document.addEventListener('click', clickHandler);
      document.addEventListener('focusin', focusHandler);
      document.addEventListener('keydown', keyHandler);
    } else {
      stopSpeaking();
    }

    // Toggle voice-active class for enhanced focus styles
    document.documentElement.classList.toggle('voice-active', settings.voiceEnabled);

    return () => {
      if (voiceListenerRef.current) {
        document.removeEventListener('click', voiceListenerRef.current);
        voiceListenerRef.current = null;
      }
      if (focusListenerRef.current) {
        document.removeEventListener('focusin', focusListenerRef.current);
        focusListenerRef.current = null;
      }
      if (keyListenerRef.current) {
        document.removeEventListener('keydown', keyListenerRef.current);
        keyListenerRef.current = null;
      }
      document.documentElement.classList.remove('voice-active');
    };
  }, [settings.voiceEnabled, settings.language]);

  // ── Persist on change ──
  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  const update = useCallback(
    (patch: Partial<AccessibilitySettings>) =>
      setSettings((prev) => ({ ...prev, ...patch })),
    [],
  );

  const reset = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    stopSpeaking();
  }, []);

  const getLangCode = (lang: Language) => {
    const langMap: Record<Language, string> = {
      fr: 'fr-FR', en: 'en-US', ar: 'ar-SA', es: 'es-ES',
    };
    return langMap[lang] || 'fr-FR';
  };

  const announce = (msg: string) => {
    if (settings.voiceEnabled) {
      speak(msg, getLangCode(settings.language));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className="w-[340px] sm:w-[380px] overflow-y-auto"
        data-accessibility-panel
        aria-label={t('a11y.openPanel')}
      >
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Accessibility className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg">{t('a11y.title')}</SheetTitle>
              <SheetDescription className="text-xs">
                {t('a11y.subtitle')}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* ───── Theme ───── */}
          <Section icon={<Sun className="h-4 w-4" />} title={t('a11y.appearance')}>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: 'light', icon: <Sun className="h-4 w-4" />, labelKey: 'a11y.light' },
                  { key: 'dark', icon: <Moon className="h-4 w-4" />, labelKey: 'a11y.dark' },
                  { key: 'system', icon: <MonitorCog className="h-4 w-4" />, labelKey: 'a11y.system' },
                ] as const
              ).map(({ key, icon, labelKey }) => (
                <button
                  key={key}
                  onClick={() => {
                    update({ theme: key });
                    announce(t('a11y.modeActivated').replace('{mode}', t(labelKey)));
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-xs font-medium transition-all
                    ${
                      settings.theme === key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted'
                    }`}
                  aria-pressed={settings.theme === key}
                  aria-label={t(labelKey)}
                >
                  {icon}
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </Section>

          {/* ───── Language ───── */}
          <Section icon={<Languages className="h-4 w-4" />} title={t('a11y.language')}>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(({ value, label, flag }) => (
                <button
                  key={value}
                  onClick={() => {
                    update({ language: value });
                    announce(label);
                  }}
                  className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all
                    ${
                      settings.language === value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted'
                    }`}
                  aria-pressed={settings.language === value}
                >
                  <span className="text-base">{flag}</span>
                  {label}
                </button>
              ))}
            </div>
          </Section>

          {/* ───── Font size ───── */}
          <Section icon={<Type className="h-4 w-4" />} title={t('a11y.fontSize')}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ZoomOut className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">75%</span>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {settings.fontSize}%
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">150%</span>
                  <ZoomIn className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <Slider
                min={75}
                max={150}
                step={5}
                value={[settings.fontSize]}
                onValueChange={([v]) => update({ fontSize: v })}
                aria-label={t('a11y.fontSizeLabel')}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs"
                  onClick={() => update({ fontSize: Math.max(75, settings.fontSize - 10) })}>
                  <ZoomOut className="h-3 w-3 mr-1" /> {t('a11y.reduce')}
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs"
                  onClick={() => update({ fontSize: 100 })}>
                  100%
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs"
                  onClick={() => update({ fontSize: Math.min(150, settings.fontSize + 10) })}>
                  <ZoomIn className="h-3 w-3 mr-1" /> {t('a11y.enlarge')}
                </Button>
              </div>
            </div>
          </Section>

          {/* ───── Voice reader ───── */}
          <Section icon={<Volume2 className="h-4 w-4" />} title={t('a11y.voiceReader')}>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  {settings.voiceEnabled ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <Volume2 className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <VolumeX className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {settings.voiceEnabled ? t('a11y.voiceEnabled') : t('a11y.voiceDisabled')}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('a11y.voiceHint')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => {
                    update({ voiceEnabled: checked });
                    if (checked) {
                      speak(t('a11y.voiceActivated'), getLangCode(settings.language));
                    } else {
                      stopSpeaking();
                    }
                  }}
                  aria-label={t('a11y.voiceReader')}
                />
              </div>
              {settings.voiceEnabled && (
                <p className="text-xs text-muted-foreground bg-primary/5 p-2 rounded-md">
                  💡 {t('a11y.voiceTip')}
                </p>
              )}
            </div>
          </Section>

          {/* ───── Voice Assistant (Siri-like) ───── */}
          <Section icon={<Mic className="h-4 w-4" />} title={t('voice.activate')}>
            <div className="space-y-3">
              <button
                onClick={() => {
                  onOpenChange(false); // close panel first
                  setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('voice-assistant-toggle'));
                  }, 300);
                }}
                className="w-full flex items-center gap-4 rounded-lg border-2 border-primary/30 bg-primary/5 p-4 text-left transition-all hover:border-primary hover:bg-primary/10 group"
                aria-label={t('voice.activate')}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md group-hover:scale-110 transition-transform">
                  <Mic className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t('voice.activate')}</p>
                  <p className="text-xs text-muted-foreground">{t('voice.hint')}</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Alt+V
                </Badge>
              </button>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">"{t('voice.exFormation')}"</span>
                <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">"{t('voice.exContact')}"</span>
                <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">"{t('voice.exDarkMode')}"</span>
                <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">"{t('voice.exScrollDown')}"</span>
              </div>
            </div>
          </Section>

          {/* ───── Vision extras ───── */}
          <Section icon={<Eye className="h-4 w-4" />} title={t('a11y.vision')}>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Contrast className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('a11y.highContrast')}</p>
                    <p className="text-xs text-muted-foreground">{t('a11y.highContrastDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(v) => {
                    update({ highContrast: v });
                    announce(v ? t('a11y.highContrastEnabled') : t('a11y.highContrastDisabled'));
                  }}
                  aria-label={t('a11y.highContrast')}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <MonitorCog className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('a11y.reducedMotion')}</p>
                    <p className="text-xs text-muted-foreground">{t('a11y.reducedMotionDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(v) => {
                    update({ reducedMotion: v });
                    announce(v ? t('a11y.motionReduced') : t('a11y.motionNormal'));
                  }}
                  aria-label={t('a11y.reducedMotion')}
                />
              </div>
            </div>
          </Section>

          {/* ───── Eye Tracking (Head Tracking) ───── */}
          <EyeTrackingSection announce={announce} t={t} />

          {/* ───── Reset ───── */}
          <div className="pt-2">
            <Button variant="outline" className="w-full gap-2"
              onClick={() => { reset(); announce(t('a11y.settingsReset')); }}>
              <RotateCcw className="h-4 w-4" />
              {t('a11y.reset')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Floating trigger button ─────────────────────────────────────────────────
export function AccessibilityTrigger({
  onClick,
  voiceActive,
}: {
  onClick: () => void;
  voiceActive?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-17 w-17 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20 transition-all hover:scale-110 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring active:scale-95"
      aria-label={t('a11y.openPanel')}
      title={t('a11y.title')}
    >
      <Accessibility className="h-8 w-8" />
      {voiceActive && (
        <span className="absolute -top-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 border-2 border-background">
          <Volume2 className="h-2.5 w-2.5 text-white" />
        </span>
      )}
    </button>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Eye Tracking Section (uses context) ─────────────────────────────────────
function EyeTrackingSection({ announce, t }: { announce: (msg: string) => void; t: (key: string) => string }) {
  const eyeTracking = useEyeTracking() as {
    isEnabled: boolean;
    setIsEnabled: (v: boolean) => void;
    isLoading: boolean;
    error: string | null;
  };

  const { isEnabled, setIsEnabled, isLoading, error } = eyeTracking;

  return (
    <Section icon={<Crosshair className="h-4 w-4" />} title={t('a11y.eyeTracking')}>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : isEnabled ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <Crosshair className="h-4 w-4" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Crosshair className="h-4 w-4" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">
                {isLoading ? t('a11y.eyeTrackingLoading') : isEnabled ? t('a11y.eyeTrackingEnabled') : t('a11y.eyeTrackingDisabled')}
              </p>
              <p className="text-xs text-muted-foreground">{t('a11y.eyeTrackingDesc')}</p>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => {
              setIsEnabled(checked);
              announce(checked ? t('a11y.eyeTrackingActivated') : t('a11y.eyeTrackingDeactivated'));
            }}
            disabled={isLoading}
            aria-label={t('a11y.eyeTracking')}
          />
        </div>
        {isEnabled && (
          <p className="text-xs text-muted-foreground bg-primary/5 p-2 rounded-md">
            💡 {t('a11y.eyeTrackingTip')}
          </p>
        )}
        {error && (
          <p className="text-xs text-destructive bg-destructive/5 p-2 rounded-md">
            ⚠️ {error}
          </p>
        )}
      </div>
    </Section>
  );
}
