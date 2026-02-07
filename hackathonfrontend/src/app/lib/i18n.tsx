import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// ─── Supported languages ─────────────────────────────────────────────────────
export type Language = 'fr' | 'en' | 'ar' | 'es';

// ─── Translation dictionary type (nested keys) ──────────────────────────────
export type TranslationDict = Record<string, string | Record<string, string>>;

// ─── Context ─────────────────────────────────────────────────────────────────
interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => key,
});

// ─── Flatten nested dict ─────────────────────────────────────────────────────
function flatten(dict: TranslationDict, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(dict)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      result[fullKey] = v;
    } else {
      Object.assign(result, flatten(v, fullKey));
    }
  }
  return result;
}

// ─── Provider ────────────────────────────────────────────────────────────────
interface I18nProviderProps {
  children: ReactNode;
  translations: Record<Language, TranslationDict>;
}

export function I18nProvider({ children, translations }: I18nProviderProps) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const raw = localStorage.getItem('accessibility-settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.language) return parsed.language as Language;
      }
    } catch { /* ignore */ }
    return 'fr';
  });

  // Flatten all dicts once
  const [flatDicts] = useState(() => {
    const d: Record<Language, Record<string, string>> = {} as any;
    for (const l of Object.keys(translations) as Language[]) {
      d[l] = flatten(translations[l]);
    }
    return d;
  });

  // Keep in sync with accessibility-settings localStorage
  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem('accessibility-settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.language && parsed.language !== lang) {
            setLangState(parsed.language as Language);
          }
        }
      } catch { /* ignore */ }
    };

    // Poll every 300ms for changes made by AccessibilityPanel (same tab)
    const interval = setInterval(onStorage, 300);
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, [lang]);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    // Also update accessibility-settings
    try {
      const raw = localStorage.getItem('accessibility-settings');
      const settings = raw ? JSON.parse(raw) : {};
      settings.language = l;
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return flatDicts[lang]?.[key] ?? flatDicts['fr']?.[key] ?? key;
    },
    [lang, flatDicts],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useTranslation() {
  return useContext(I18nContext);
}
