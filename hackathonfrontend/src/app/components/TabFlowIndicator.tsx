import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../lib/i18n';

// ─── Types ───────────────────────────────────────────────────────────────────
interface FlowSection {
  id: string;
  labelKey: string;
  selector: string; // CSS selector to find the section element
  icon: string;
}

// The logical Z-reading sections of the page
const PAGE_SECTIONS: FlowSection[] = [
  { id: 'header', labelKey: 'flow.header', selector: 'header, [role="banner"]', icon: '🏠' },
  { id: 'nav', labelKey: 'flow.nav', selector: 'nav, [role="navigation"]', icon: '🧭' },
  { id: 'main', labelKey: 'flow.main', selector: 'main, [role="main"], #main-content', icon: '📄' },
  { id: 'footer', labelKey: 'flow.footer', selector: 'footer, [role="contentinfo"]', icon: '📋' },
];

// ─── Component ───────────────────────────────────────────────────────────────
export function TabFlowIndicator() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [gridPosition, setGridPosition] = useState<string | null>(null);
  const isKeyboardNav = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect keyboard vs mouse navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      isKeyboardNav.current = true;
      setVisible(true);

      // Reset auto-hide timer
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 8000);
    }

    // Section jump shortcuts: Alt+1-4
    if (e.altKey && e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      const sectionIndex = parseInt(e.key) - 1;
      const section = PAGE_SECTIONS[sectionIndex];
      if (section) {
        const el = document.querySelector<HTMLElement>(section.selector);
        if (el) {
          // Find first focusable element in this section
          const focusable = el.querySelector<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable) {
            focusable.focus();
          } else {
            el.setAttribute('tabindex', '-1');
            el.focus();
          }
        }
      }
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    isKeyboardNav.current = false;
    setVisible(false);
  }, []);

  // Track which section has focus
  const handleFocusIn = useCallback((e: FocusEvent) => {
    if (!isKeyboardNav.current) return;

    const target = e.target as HTMLElement;
    if (!target) return;

    // Determine which section the focused element is in
    for (const section of PAGE_SECTIONS) {
      const sectionEl = document.querySelector(section.selector);
      if (sectionEl && sectionEl.contains(target)) {
        setActiveSection(section.id);
        break;
      }
    }

    // Determine grid position (row/col) for Z-pattern visualization
    const gridParent = target.closest('[class*="grid"]');
    if (gridParent) {
      const children = Array.from(gridParent.children).filter(
        (c) => c instanceof HTMLElement
      );
      const idx = children.indexOf(target.closest('[class*="grid"] > *') as Element);
      if (idx >= 0) {
        const style = window.getComputedStyle(gridParent);
        const cols = style.gridTemplateColumns.split(' ').length;
        const row = Math.floor(idx / cols) + 1;
        const col = (idx % cols) + 1;
        setGridPosition(`${row}×${col}`);
      } else {
        setGridPosition(null);
      }
    } else {
      setGridPosition(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focusin', handleFocusIn);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [handleKeyDown, handleMouseDown, handleFocusIn]);

  if (!visible) return null;

  return (
    <div
      className="tab-flow-indicator"
      role="status"
      aria-live="polite"
      aria-label={t('flow.ariaLabel')}
    >
      <div className="tab-flow-bar">
        <span className="tab-flow-label">Tab ⌨️</span>
        <div className="tab-flow-sections">
          {PAGE_SECTIONS.map((section, i) => (
            <span key={section.id}>
              <button
                className={`tab-flow-section ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => {
                  const el = document.querySelector<HTMLElement>(section.selector);
                  if (el) {
                    const focusable = el.querySelector<HTMLElement>(
                      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    );
                    if (focusable) focusable.focus();
                  }
                }}
                tabIndex={-1}
                aria-label={`${t(section.labelKey)} (Alt+${i + 1})`}
                title={`Alt+${i + 1}`}
              >
                <span className="tab-flow-icon">{section.icon}</span>
                <span className="tab-flow-name">{t(section.labelKey)}</span>
                {activeSection === section.id && (
                  <span className="tab-flow-active-dot" aria-hidden="true" />
                )}
              </button>
              {i < PAGE_SECTIONS.length - 1 && (
                <span className="tab-flow-arrow" aria-hidden="true">→</span>
              )}
            </span>
          ))}
        </div>
        {gridPosition && (
          <span className="tab-flow-grid-pos" aria-label={t('flow.gridPosition')}>
            📐 {gridPosition}
          </span>
        )}
        <span className="tab-flow-hint">
          Alt+1–4
        </span>
      </div>
    </div>
  );
}
