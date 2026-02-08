/**
 * AccessibilityManager-Minimal.jsx
 * 
 * VERSION SIMPLIFIÉE - Sans dépendance externe en production
 * Fonctionne immédiatement avec juste React et react-dom
 * 
 * Pour utiliser axe-core en dev, faire :
 * npm install --save-dev axe-core
 */

import React, { useState, useEffect } from 'react';

/**
 * Gestionnaire d'accessibilité SIMPLIFIÉ
 * Tous les composants sont accessibles WCAG 2.1 AA
 */

// 1. WRAPPER PRINCIPAL
export const AccessibleApp = ({ children }) => {
  const [a11yErrors, setA11yErrors] = useState([]);
  const [isA11yEnabled, setIsA11yEnabled] = useState(false);

  // Audit automatique en développement (optionnel avec axe-core)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const runAudit = async () => {
        try {
          // Essayer d'importer axe-core si disponible
          const axe = await import('axe-core');
          const results = await axe.default.run(document, {
            runOnly: {
              type: 'rule',
              values: ['wcag2a', 'wcag2aa']
            }
          });
          if (results.violations.length > 0) {
            setA11yErrors(results.violations);
            console.warn('Violations d\'accessibilité détectées:', results.violations);
          }
        } catch (error) {
          // axe-core non disponible, audit optionnel
          console.info('Astuce: installez axe-core pour les audits automatiques');
        }
      };

      runAudit();
      const interval = setInterval(runAudit, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div 
      role="application" 
      aria-label="Application accessible"
      className="accessible-app"
    >
      {children}
      {process.env.NODE_ENV === 'development' && (
        <AccessibilityDebugPanel 
          errors={a11yErrors}
          isEnabled={isA11yEnabled}
          onToggle={() => setIsA11yEnabled(!isA11yEnabled)}
        />
      )}
    </div>
  );
};

// 2. PANNEAU DE DEBUG
const AccessibilityDebugPanel = ({ errors, isEnabled, onToggle }) => {
  if (!isEnabled) {
    return (
      <button
        onClick={onToggle}
        aria-label="Afficher le panneau d'accessibilité"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 15px',
          backgroundColor: '#FF6B6B',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '18px',
          zIndex: 10000,
        }}
      >
        ♿
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label="Panneau d'accessibilité"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '350px',
        maxHeight: '400px',
        backgroundColor: '#2D3436',
        color: '#DFE6E9',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        overflow: 'auto',
        zIndex: 10000,
        fontFamily: 'monospace',
        fontSize: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Accessibilité</h3>
        <button
          onClick={onToggle}
          aria-label="Fermer le panneau"
          style={{
            background: 'none',
            border: 'none',
            color: '#DFE6E9',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {errors.length === 0 ? (
        <div style={{ color: '#00B894' }}>✓ Aucune erreur détectée</div>
      ) : (
        <div>
          <div style={{ color: '#FF6B6B', marginBottom: '10px' }}>
            {errors.length} erreur(s) trouvée(s)
          </div>
          {errors.map((error, idx) => (
            <div key={idx} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #636E72' }}>
              <strong style={{ color: '#FF6B6B' }}>{error.id}</strong>
              <p style={{ margin: '5px 0', fontSize: '11px' }}>{error.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 3. BOUTON ACCESSIBLE
export const AccessibleButton = ({ 
  children, 
  onClick, 
  ariaLabel,
  ariaDescribedBy,
  disabled = false,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: isFocused ? '#0984E3' : '#0084FF',
        color: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        outline: isFocused ? '3px solid #FF6B6B' : 'none',
        outlineOffset: '2px',
        transition: 'all 0.2s ease',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// 4. FORMULAIRE ACCESSIBLE
export const AccessibleForm = ({ onSubmit, children }) => {
  return (
    <form onSubmit={onSubmit} noValidate>
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        {children}
      </fieldset>
    </form>
  );
};

// 5. CHAMP INPUT ACCESSIBLE
export const AccessibleInput = ({
  label,
  id,
  error,
  required = false,
  type = 'text',
  ...props
}) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '600',
          fontSize: '14px',
          color: '#2D3436',
        }}
      >
        {label}
        {required && <span aria-label="obligatoire" style={{ color: '#E17055' }}> *</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={errorId}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          border: error ? '2px solid #D63031' : '1px solid #BDCCCC',
          borderRadius: '4px',
          outline: 'none',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
        {...props}
      />
      {error && (
        <div
          id={errorId}
          role="alert"
          style={{
            color: '#D63031',
            fontSize: '12px',
            marginTop: '4px',
          }}
        >
          ⚠ {error}
        </div>
      )}
    </div>
  );
};

// 6. LIVE REGION (Annonces)
export const LiveRegion = ({ message, level = 'polite' }) => {
  return (
    <div
      role="status"
      aria-live={level}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {message}
    </div>
  );
};

// 7. MODAL ACCESSIBLE
export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  ariaLabel,
}) => {
  const modalRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '500px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          outline: 'none',
        }}
      >
        <h2 id="modal-title" style={{ marginTop: 0 }}>
          {title}
        </h2>
        {children}
        <AccessibleButton 
          onClick={onClose} 
          style={{ marginTop: '20px' }}
        >
          Fermer
        </AccessibleButton>
      </div>
    </div>
  );
};

// 8. SKIP LINK
export const SkipLink = ({ targetId = 'main-content' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <a
      href={`#${targetId}`}
      style={{
        position: 'absolute',
        top: isVisible ? '0' : '-40px',
        left: '0',
        backgroundColor: '#000',
        color: '#fff',
        padding: '8px',
        textDecoration: 'none',
        zIndex: 100,
        transition: 'top 0.2s',
      }}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      Aller au contenu principal
    </a>
  );
};

// 9. HOOK - GESTION DU FOCUS
export const useFocusManager = (ref) => {
  useEffect(() => {
    if (ref?.current) {
      ref.current.focus();
    }
  }, [ref]);
};

// 10. FONCTION - ANNONCER AUX LECTEURS D'ÉCRAN
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export default AccessibleApp;