import React, { useState } from 'react';
import { useEyeTracking } from './EyeTrackingContext';

/**
 * Composant de contrôle global Eye Tracking
 * Affiche le bouton de démarrage/arrêt sur toutes les pages
 */
export const EyeTrackingControl = ({ position = 'top-left' }) => {
  const { isEnabled, setIsEnabled, isLoading, error, eyeStatus, cursorPos } =
    useEyeTracking();
  const [isMinimized, setIsMinimized] = useState(true);

  const positionStyles = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 99997,
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      <style>{`
        .eye-tracking-control-panel {
          background: rgba(255, 255, 255, 0.98);
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          max-width: 350px;
          animation: slideIn 0.3s ease-out;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          overflow: hidden;
          position: relative;
        }

        .eye-tracking-control-panel.minimized {
          padding: 10px;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .eye-tracking-control-panel.minimized:hover {
          transform: scale(1.1);
        }

        .minimized-eye {
        margin-top: -3px;
          font-size: 22px;
          animation: breathe 2s infinite ease-in-out;
        }

        @keyframes breathe {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .control-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 16px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 15px;
        }

        .header-main {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .close-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .close-btn:hover {
          background: #f0f0f0;
          color: #666;
        }

        .control-btn {
          width: 100%;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .control-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .control-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 12px;
        }

        .status-item {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 6px;
          font-size: 12px;
          text-align: center;
        }

        .status-label {
          color: #666;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .status-value {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-weight: bold;
          color: #333;
        }

        .eye-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ccc;
        }

        .eye-dot.open {
          background: #4CAF50;
          box-shadow: 0 0 6px #4CAF50;
        }

        .eye-dot.closed {
          background: #ff9800;
          box-shadow: 0 0 6px #ff9800;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 6px;
          font-size: 12px;
          margin-top: 10px;
          border-left: 3px solid #c62828;
        }

        .coords-display {
          background: #f5f5f5;
          padding: 8px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #666;
          text-align: center;
          margin-top: 10px;
          line-height: 1.4;
        }

        @media (max-width: 480px) {
          .eye-tracking-control-panel {
            padding: 15px;
            max-width: 100vw;
            margin: 0 10px;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        className={`eye-tracking-control-panel ${isMinimized ? 'minimized' : ''}`}
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        {isMinimized ? (
          <span className="minimized-eye">👁️</span>
        ) : (
          <>
            <div className="control-header">
              <div className="header-main">
                <span>👁️</span>
                <span>Eye Tracking</span>
              </div>
              <button
                className="close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                title="Minimiser"
              >
                ❌
              </button>
            </div>

            <button
              className="control-btn"
              onClick={() => setIsEnabled(!isEnabled)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span>⏳</span>
                  <span>Chargement...</span>
                </>
              ) : isEnabled ? (
                <>
                  <span>🛑</span>
                  <span>Arrêter</span>
                </>
              ) : (
                <>
                  <span>▶️</span>
                  <span>Démarrer</span>
                </>
              )}
            </button>

            {isEnabled && (
              <>


                <div className="coords-display">
                  <div>X: {Math.round(cursorPos.x)}</div>
                  <div>Y: {Math.round(cursorPos.y)}</div>
                </div>
              </>
            )}

            {error && (
              <div className="error-message">
                ⚠️ {error}
                <br />
                Vérifiez les permissions de la webcam
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EyeTrackingControl;
