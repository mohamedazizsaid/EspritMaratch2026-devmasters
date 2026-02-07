import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import type { DriveStep, Config } from 'driver.js';

export interface OnboardingTourConfig {
  steps: DriveStep[];
  onComplete?: () => void;
  localStorageKey: string;
}

// --- blur backdrop helpers ---
function addBlurBackdrop() {
  removeBlurBackdrop();
  const el = document.createElement('div');
  el.id = 'driver-blur-backdrop';
  document.body.appendChild(el);
}

function removeBlurBackdrop() {
  document.getElementById('driver-blur-backdrop')?.remove();
}

export function useOnboardingTour({
  steps,
  onComplete,
  localStorageKey,
}: OnboardingTourConfig) {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const hasShownRef = useRef(false);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(localStorageKey) === 'completed';

    if (!hasCompletedTour && !hasShownRef.current && steps.length > 0) {
      hasShownRef.current = true;

      const timer = setTimeout(() => {
        const driverConfig: Config = {
          showProgress: true,
          showButtons: ['next', 'previous', 'close'],
          steps: steps,
          nextBtnText: 'Suivant',
          prevBtnText: 'Précédent',
          doneBtnText: 'Terminer',
          progressText: '{{current}} sur {{total}}',
          popoverClass: 'driverjs-theme',
          stagePadding: 10,
          stageRadius: 8,
          allowClose: true,
          overlayOpacity: 0.55,
          onDestroyed: () => {
            removeBlurBackdrop();
            localStorage.setItem(localStorageKey, 'completed');
            onComplete?.();
          },
        };

        addBlurBackdrop();
        driverRef.current = driver(driverConfig);
        driverRef.current.drive();
      }, 1200);

      return () => {
        clearTimeout(timer);
        removeBlurBackdrop();
      };
    }
  }, [steps, onComplete, localStorageKey]);

  const startTour = () => {
    if (steps.length > 0) {
      const driverConfig: Config = {
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        steps: steps,
        nextBtnText: 'Suivant',
        prevBtnText: 'Précédent',
        doneBtnText: 'Terminer',
        progressText: '{{current}} sur {{total}}',
        popoverClass: 'driverjs-theme',
        stagePadding: 10,
        stageRadius: 8,
        allowClose: true,
        overlayOpacity: 0.55,
        onDestroyed: () => {
          removeBlurBackdrop();
          localStorage.setItem(localStorageKey, 'completed');
          onComplete?.();
        },
      };

      addBlurBackdrop();
      const driverInstance = driver(driverConfig);
      driverInstance.drive();
    }
  };

  const resetTour = () => {
    localStorage.removeItem(localStorageKey);
  };

  return { startTour, resetTour };
}
