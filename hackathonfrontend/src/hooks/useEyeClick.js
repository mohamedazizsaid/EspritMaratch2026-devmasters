import { useEffect, useRef } from 'react';
import { useEyeTracking } from './EyeTrackingContext';

/**
 * Hook pour détecter les clics oculaires sur un élément spécifique
 * 
 * Usage:
 * const ref = useEyeClick(handleClick, handleRightClick);
 * <button ref={ref}>Click me with your eyes</button>
 */
export const useEyeClick = (onLeftClick, onRightClick, options = {}) => {
  const elementRef = useRef(null);
  const { isEnabled, cursorPos, eyeStatus } = useEyeTracking();
  const lastClickTimeRef = useRef({});
  const hoverStateRef = useRef(false);

  const {
    clickDelay = 300, // ms entre deux clics possibles
    hoverFeedback = true,
    onHoverChange = null,
  } = options;

  useEffect(() => {
    if (!isEnabled || !elementRef.current) return;

    const checkAndClick = setInterval(() => {
      const rect = elementRef.current.getBoundingClientRect();

      // Vérifier si le curseur oculaire est sur l'élément
      const isHovered =
        cursorPos.x >= rect.left &&
        cursorPos.x <= rect.right &&
        cursorPos.y >= rect.top &&
        cursorPos.y <= rect.bottom;

      // Notifier du changement de hover
      if (isHovered !== hoverStateRef.current) {
        hoverStateRef.current = isHovered;
        if (onHoverChange) {
          onHoverChange(isHovered);
        }
        if (hoverFeedback && elementRef.current) {
          if (isHovered) {
            elementRef.current.style.filter = 'brightness(0.95)';
          } else {
            elementRef.current.style.filter = 'brightness(1)';
          }
        }
      }

      if (isHovered) {
        const now = Date.now();

        // Clic oeil droit fermé = Clic normal
        if (eyeStatus.right === 'closed') {
          const lastRightClick = lastClickTimeRef.current.right || 0;
          if (now - lastRightClick > clickDelay) {
            lastClickTimeRef.current.right = now;
            if (onLeftClick) {
              onLeftClick();
            }
            // Feedback visuel
            if (elementRef.current) {
              elementRef.current.style.transform = 'scale(0.98)';
              setTimeout(() => {
                if (elementRef.current) {
                  elementRef.current.style.transform = 'scale(1)';
                }
              }, 100);
            }
          }
        }

        // Clic oeil gauche fermé = Clic droit
        if (eyeStatus.left === 'closed') {
          const lastLeftClick = lastClickTimeRef.current.left || 0;
          if (now - lastLeftClick > clickDelay) {
            lastClickTimeRef.current.left = now;
            if (onRightClick) {
              onRightClick();
            }
            // Feedback visuel
            if (elementRef.current) {
              elementRef.current.style.transform = 'scale(0.95)';
              setTimeout(() => {
                if (elementRef.current) {
                  elementRef.current.style.transform = 'scale(1)';
                }
              }, 100);
            }
          }
        }
      }
    }, 100);

    return () => {
      clearInterval(checkAndClick);
      // Cleanup
      if (elementRef.current) {
        elementRef.current.style.filter = 'brightness(1)';
        elementRef.current.style.transform = 'scale(1)';
      }
    };
  }, [isEnabled, cursorPos, eyeStatus, onLeftClick, onRightClick, clickDelay, hoverFeedback, onHoverChange]);

  return elementRef;
};

/**
 * Composant wrapper pour ajouter l'eye click facilement
 */
export const EyeClickable = ({
  children,
  onClick,
  onRightClick,
  className = '',
  style = {},
  clickDelay = 300,
  ...props
}) => {
  const ref = useEyeClick(onClick, onRightClick, { clickDelay });
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      ref={ref}
      className={`eye-clickable ${isHovered ? 'eye-hovered' : ''} ${className}`}
      style={{
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        ...style,
      }}
      {...props}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export default useEyeClick;
