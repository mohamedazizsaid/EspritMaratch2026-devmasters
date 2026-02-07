import type { Language, TranslationDict } from '../lib/i18n';
import { fr } from './fr';
import { en } from './en';
import { ar } from './ar';
import { es } from './es';

export const translations: Record<Language, TranslationDict> = { fr, en, ar, es };
