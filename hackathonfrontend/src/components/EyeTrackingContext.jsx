import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

// TensorFlow is loaded DYNAMICALLY only when eye tracking is enabled
// This saves ~1.5MB from the initial bundle

/**
 * Contexte global pour le suivi de la tête
 * Le curseur suit le mouvement de la tête (haut/bas/gauche/droite)
 * Les clics se font avec la fermeture des yeux (gauche ou droit)
 */
const EyeTrackingContext = createContext(null);

export const EyeTrackingProvider = ({ children, trackedEye = 'right' }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [cursorPos, setCursorPos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });
  const [eyeStatus, setEyeStatus] = useState({ left: 'open', right: 'open' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEye, setSelectedEye] = useState(trackedEye);

  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const detectionLoopRef = useRef(null);
  const cursorRef = useRef(null);
  const previousCursorPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const scrollTimerRef = useRef(null);
  const previousEyeStatusRef = useRef({ left: 'open', right: 'open' });

  // Refs pour détection de clic par immobilité
  const cursorStabilityRef = useRef({
    lastPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    stableStartTime: null,
    isStable: false,
    threshold: 30, // pixels - zone de stabilité
    stableDuration: 3000, // millisecondes (3 secondes)
    clickType: 'left' // type de clic par défaut
  });

  // Facteur de lissage du curseur (plus élevé = plus réactif, mais moins stable)
  const SMOOTHING_FACTOR = 0.05;

  // Variables de calibration de la tête
  const headCalibrationRef = useRef({
    isCalibrating: false,
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    dataPoints: []
  });

  // Simuler un clic souris
  const simulateClick = (x, y, button = 'left') => {
    // Vérifier que les coordonnées sont valides
    if (!isFinite(x) || !isFinite(y)) {
      console.warn(`[Head Tracking] ⚠️ Coordonnées invalides: x=${x}, y=${y}`);
      return;
    }

    const element = document.elementFromPoint(x, y);
    if (!element) return;

    if (button === 'right') {
      // CLIC DROIT: Afficher le menu contextuel
      const contextmenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 2, // 2 = bouton droit
      });
      element.dispatchEvent(contextmenuEvent);
      console.log(`[Head Tracking] ✅ Clic DROIT simulé à (${Math.round(x)}, ${Math.round(y)}) - Menu contextuel`);
    } else {
      // CLIC GAUCHE: Clic normal
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0, // 0 = bouton gauche
      });

      const mouseupEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0,
      });

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0,
      });

      element.dispatchEvent(mousedownEvent);
      element.dispatchEvent(mouseupEvent);
      element.dispatchEvent(clickEvent);
      console.log(`[Head Tracking] ✅ Clic GAUCHE simulé à (${Math.round(x)}, ${Math.round(y)})`);
    }
  };

  // Fonction de calibration pour la tête
  const calibrateHeadTracking = (landmarks) => {
    const cal = headCalibrationRef.current;

    if (!cal.dataPoints) {
      cal.dataPoints = [];
    }

    // Utiliser le nez (landmark 30 pour face-api.js 68-point model) pour le suivi de la tête
    const nose = landmarks[30] || landmarks[1] || [0, 0];

    const headX = nose[0];
    const headY = nose[1];

    // Mettre à jour les limites min/max
    cal.minX = Math.min(cal.minX, headX);
    cal.maxX = Math.max(cal.maxX, headX);
    cal.minY = Math.min(cal.minY, headY);
    cal.maxY = Math.max(cal.maxY, headY);

    cal.dataPoints.push({ x: headX, y: headY });

    // Afficher la calibration tous les 10 points
    if (cal.dataPoints.length % 10 === 0) {
      console.log(`[Head Tracking] Calibration tête:`, {
        minX: Math.round(cal.minX),
        maxX: Math.round(cal.maxX),
        minY: Math.round(cal.minY),
        maxY: Math.round(cal.maxY),
        points: cal.dataPoints.length
      });
    }
  };

  // Mapper les coordonnées de la tête à l'écran avec calibration
  const mapHeadCoordinatesToScreen = (headX, headY) => {
    // Vérifier que les coordonnées brutes sont valides
    if (!isFinite(headX) || !isFinite(headY)) {
      console.warn('[Head Tracking] Coordonnées brutes invalides:', { headX, headY });
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    const cal = headCalibrationRef.current;

    // Utiliser les limites calibrées si disponibles, sinon utiliser des valeurs par défaut
    // Zone plus petite = plus de sensibilité pour couvrir tout l'écran
    let minX = cal.minX !== Infinity ? cal.minX : 200;
    let maxX = cal.maxX !== -Infinity ? cal.maxX : 440;
    let minY = cal.minY !== Infinity ? cal.minY : 150;
    let maxY = cal.maxY !== -Infinity ? cal.maxY : 350;

    // Ajouter un padding pour augmenter la sensibilité (réduire la zone active)
    const paddingX = (maxX - minX) * 0.15; // 15% de padding
    const paddingY = (maxY - minY) * 0.15;
    minX += paddingX;
    maxX -= paddingX;
    minY += paddingY;
    maxY -= paddingY;

    // S'assurer que min < max pour éviter NaN
    if (minX >= maxX) {
      minX = 200;
      maxX = 440;
    }
    if (minY >= maxY) {
      minY = 150;
      maxY = 350;
    }

    // Normaliser les coordonnées de la tête entre 0 et 1
    // Permettre les valeurs hors limites pour couvrir les bords de l'écran
    const normalizedX = (headX - minX) / (maxX - minX);
    const normalizedY = (headY - minY) / (maxY - minY);

    // Appliquer un facteur de sensibilité pour amplifier le mouvement
    const sensitivityX = 1.5; // Multiplier le mouvement horizontal
    const sensitivityY = 1.5; // Multiplier le mouvement vertical

    // Centrer et appliquer la sensibilité
    const adjustedX = 0.5 + (normalizedX - 0.5) * sensitivityX;
    const adjustedY = 0.5 + (normalizedY - 0.5) * sensitivityY;

    // Appliquer les dimensions de l'écran
    // INVERSER X pour compenser l'effet miroir de la webcam
    const screenX = (1 - adjustedX) * window.innerWidth;
    const screenY = adjustedY * window.innerHeight;

    // S'assurer que le curseur reste dans les limites de l'écran
    return {
      x: Math.max(0, Math.min(window.innerWidth, screenX)),
      y: Math.max(0, Math.min(window.innerHeight, screenY))
    };
  };

  // Initialiser le suivi oculaire
  useEffect(() => {
    if (!isEnabled) {
      // Arrêter le suivi
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      // Cacher le curseur personnalisé
      if (cursorRef.current) {
        cursorRef.current.style.display = 'none';
      }
      return;
    }

    // Créer le curseur personnalisé si n'existe pas
    if (!cursorRef.current) {
      const cursor = document.createElement('div');
      cursor.className = 'eye-tracking-cursor';
      cursor.innerHTML = `
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          width: 12px; height: 12px;
          background: #00ff88;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        "></div>
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          width: 36px; height: 36px;
          border: 3px solid #00ff88;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulseRing 1.5s ease-out infinite;
        "></div>
      `;
      cursor.style.cssText = `
        position: fixed;
        width: 50px;
        height: 50px;
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.8));
        display: none;
      `;

      // Add animation keyframes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulseRing {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
        .eye-tracking-cursor-stable .stable-ring {
          border-color: #ffaa00 !important;
        }
        .eye-tracking-cursor-stable > div:first-child {
          background: #ffaa00 !important;
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(cursor);
      cursorRef.current = cursor;
    } else {
      cursorRef.current.style.display = 'block';
    }

    // Initialiser le curseur au centre de l'écran
    const initialCursorPos = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    setCursorPos(initialCursorPos);
    if (cursorRef.current) {
      cursorRef.current.style.left = initialCursorPos.x + 'px';
      cursorRef.current.style.top = initialCursorPos.y + 'px';
    }

    // Réinitialiser la calibration
    headCalibrationRef.current = {
      isCalibrating: true,
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
      dataPoints: []
    };

    if (!checkBrowserSupport()) {
      setIsEnabled(false);
      return;
    }

    const initHeadTracking = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[Head Tracking] Suivi de la tête activé');
        console.log('[Head Tracking] Chargement de face-api.js...');

        // Dynamically import face-api
        const faceapiModule = await import('face-api.js');
        const faceapi = faceapiModule.default || faceapiModule;

        // Load models from public/models directory
        console.log('[Head Tracking] Chargement des modèles de détection faciale...');
        
        // Access nets correctly - they should be available on the faceapi object
        if (!faceapi.nets) {
          throw new Error('face-api.js nets not available - check if models are loaded');
        }

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);

        detectorRef.current = faceapi;
        console.log('[Head Tracking] Détecteur face-api.js chargé!');

        // Accéder à la webcam
        console.log('[Eye Tracking] Demande d\'accès à la webcam...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Attendre que la vidéo soit prête
          await new Promise((resolve) => {
            const onLoadedMetadata = () => {
              console.log('[Head Tracking] ✅ Webcam activée!');
              console.log('[Head Tracking] 📏 CALIBRATION DE LA TÊTE EN COURS...');
              console.log('[Head Tracking] Bougez votre tête lentement dans tous les sens pendant 5 secondes');
              videoRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);

              // Arrêter la calibration après 10 secondes (SSD MobileNet est plus lent)
              setTimeout(() => {
                const cal = headCalibrationRef.current;
                // Si aucun point collecté, utiliser des valeurs par défaut raisonnables
                if (cal.minX === Infinity || cal.dataPoints.length < 5) {
                  console.log('[Head Tracking] ⚠️ Pas assez de données — valeurs par défaut utilisées');
                  cal.minX = 200;
                  cal.maxX = 440;
                  cal.minY = 150;
                  cal.maxY = 350;
                }
                cal.isCalibrating = false;
                console.log('[Head Tracking] ✅ Calibration terminée!', cal.dataPoints.length, 'points collectés');
                console.log('[Head Tracking] Limites de la tête:', {
                  minX: Math.round(cal.minX),
                  maxX: Math.round(cal.maxX),
                  minY: Math.round(cal.minY),
                  maxY: Math.round(cal.maxY),
                });
              }, 10000);

              resolve();
            };
            videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
            videoRef.current.play();
          });
        }

        setIsLoading(false);

        // Lancer la boucle de détection de la tête
        const detectHead = async () => {
          if (!videoRef.current || !detectorRef.current) return;

          try {
            const video = videoRef.current;

            // Vérifier que la vidéo a les bonnes dimensions
            if (video.videoWidth === 0 || video.videoHeight === 0) {
              detectionLoopRef.current = requestAnimationFrame(detectHead);
              return;
            }

            // Détecter les repères faciaux avec face-api.js
            const detections = await detectorRef.current.detectAllFaces(video).withFaceLandmarks();

            if (detections && detections.length > 0) {
              const face = detections[0];
              
              // Extraire les landmarks en format [x, y]
              let landmarks = [];
              if (face.landmarks && face.landmarks._positions) {
                landmarks = face.landmarks._positions.map(pos => [pos.x, pos.y]);
              } else if (face.landmarks && typeof face.landmarks.getPositions === 'function') {
                landmarks = face.landmarks.getPositions().map(pos => [pos.x, pos.y]);
              } else if (face.landmarks) {
                // Fallback: try to iterate through landmarks
                landmarks = Object.values(face.landmarks).map(pos => [pos.x, pos.y]);
              }

              if (landmarks && landmarks.length > 0) {
                // Points clés pour les yeux (MediaPipe landmarks)
                // Pour face-api.js avec 68 landmarks
                const leftEyePoints = landmarks.slice(36, 42);   // Points 36-41
                const rightEyePoints = landmarks.slice(42, 48);  // Points 42-47

                // CALIBRATION: Collecter les données de la tête
                if (headCalibrationRef.current.isCalibrating) {
                  calibrateHeadTracking(landmarks);
                }

                // Utiliser la position du nez pour le curseur
                const nose = landmarks[30] || landmarks[0] || [0, 0];

                const headX = nose[0];
                const headY = nose[1];

                // Mapper aux coordonnées de l'écran avec calibration
                const rawScreenCoords = mapHeadCoordinatesToScreen(headX, headY);

                // Debug logging
                if (Math.random() < 0.05) {
                  console.log('[Head Tracking] Nez:', { x: Math.round(headX), y: Math.round(headY) }, '-> Écran:', { x: Math.round(rawScreenCoords.x), y: Math.round(rawScreenCoords.y) });
                }

                // Appliquer le lissage: interpolation entre position précédente et nouvelle position
                const smoothedScreenCoords = {
                  x: isFinite(previousCursorPosRef.current.x) ? previousCursorPosRef.current.x * (1 - SMOOTHING_FACTOR) + rawScreenCoords.x * SMOOTHING_FACTOR : rawScreenCoords.x,
                  y: isFinite(previousCursorPosRef.current.y) ? previousCursorPosRef.current.y * (1 - SMOOTHING_FACTOR) + rawScreenCoords.y * SMOOTHING_FACTOR : rawScreenCoords.y,
                };

                // Vérifier que les coordonnées lissées sont valides
                if (!isFinite(smoothedScreenCoords.x) || !isFinite(smoothedScreenCoords.y)) {
                  console.warn(`[Head Tracking] ⚠️ Coordonnées invalides après lissage - raw: x=${rawScreenCoords.x}, y=${rawScreenCoords.y}`);
                  // Utiliser la position précédente si les nouvelles coords sont NaN
                  if (!isFinite(smoothedScreenCoords.x)) {
                    smoothedScreenCoords.x = previousCursorPosRef.current.x;
                  }
                  if (!isFinite(smoothedScreenCoords.y)) {
                    smoothedScreenCoords.y = previousCursorPosRef.current.y;
                  }
                }

                // Mettre à jour la position précédente
                previousCursorPosRef.current = smoothedScreenCoords;

                setCursorPos(smoothedScreenCoords);

                // Auto-scroll si le curseur reste en bas
                const scrollThreshold = window.innerHeight * 0.85; // 85% de la hauteur
                const scrollSpeed = 5; // pixels par détection

                if (smoothedScreenCoords.y > scrollThreshold) {
                  // Curseur en bas = scroll vers le bas
                  window.scrollBy(0, scrollSpeed);
                } else if (smoothedScreenCoords.y < window.innerHeight * 0.15) {
                  // Curseur en haut = scroll vers le haut
                  window.scrollBy(0, -scrollSpeed);
                }

                // Mettre à jour la position du curseur personnalisé
                if (cursorRef.current) {
                  cursorRef.current.style.left = smoothedScreenCoords.x + 'px';
                  cursorRef.current.style.top = smoothedScreenCoords.y + 'px';
                }

                // DÉTECTION DE CLIC PAR IMMOBILITÉ DU CURSEUR
                const stability = cursorStabilityRef.current;
                const distanceFromLastPos = Math.sqrt(
                  Math.pow(smoothedScreenCoords.x - stability.lastPos.x, 2) +
                  Math.pow(smoothedScreenCoords.y - stability.lastPos.y, 2)
                );

                if (distanceFromLastPos < stability.threshold) {
                  // Curseur immobile dans la zone
                  if (!stability.isStable) {
                    stability.isStable = true;
                    stability.stableStartTime = Date.now();
                    // Ajouter classe visuelle de stabilité au curseur
                    if (cursorRef.current) {
                      cursorRef.current.classList.add('eye-tracking-cursor-stable');
                    }
                    console.log('[Head Tracking] 🎯 Curseur immobile - Attente de 3 secondes...');
                  } else {
                    // Vérifier si 3 secondes sont écoulées
                    const elapsedTime = Date.now() - stability.stableStartTime;
                    if (elapsedTime >= stability.stableDuration) {
                      // Déclencher le clic
                      const clickType = stability.clickType;
                      console.log(`[Head Tracking] ✅ Clic ${clickType.toUpperCase()} déclenché (immobilité 3s)`);
                      simulateClick(smoothedScreenCoords.x, smoothedScreenCoords.y, clickType);

                      // Réinitialiser
                      stability.isStable = false;
                      stability.stableStartTime = null;
                    }
                  }
                } else {
                  // Curseur a bougé - réinitialiser
                  if (stability.isStable) {
                    console.log('[Head Tracking] ➡️ Curseur a bougé - Décompte annulé');
                    if (cursorRef.current) {
                      cursorRef.current.classList.remove('eye-tracking-cursor-stable');
                    }
                  }
                  stability.isStable = false;
                  stability.stableStartTime = null;
                  stability.lastPos = { x: smoothedScreenCoords.x, y: smoothedScreenCoords.y };
                }

                // Déterminer si les yeux sont ouverts ou fermés (AMÉLIORATION)
                const isEyeOpen = (eyePoints) => {
                  // Vérifier qu'on a assez de points
                  if (!eyePoints || eyePoints.length < 5) return true;

                  // Point du haut de l'oeil (landmark 1)
                  const topPoint = eyePoints[1];
                  // Point du bas de l'oeil (landmark 4)
                  const bottomPoint = eyePoints[4];

                  // Vérifier que les points existent et sont valides
                  if (!topPoint || !bottomPoint) return true;
                  if (!isFinite(topPoint[1]) || !isFinite(bottomPoint[1])) return true;

                  // Calculer la distance verticale entre haut et bas
                  const verticalDistance = Math.abs((topPoint[1] || 0) - (bottomPoint[1] || 0));

                  // Oeil OUVERT: distance > 6 pixels
                  // Oeil FERMÉ: distance <= 6 pixels
                  const threshold = 6;
                  const eyeIsOpen = verticalDistance > threshold;

                  return eyeIsOpen;
                };

                const leftOpen = isEyeOpen(leftEyePoints);
                const rightOpen = isEyeOpen(rightEyePoints);

                setEyeStatus({
                  left: leftOpen ? 'open' : 'closed',
                  right: rightOpen ? 'open' : 'closed',
                });

                // Déterminer le type de clic en fonction de l'oeil fermé
                const newLeftStatus = leftOpen ? 'open' : 'closed';
                const newRightStatus = rightOpen ? 'open' : 'closed';

                // Mettre à jour le type de clic selon les yeux fermés
                if (newLeftStatus === 'closed' && newRightStatus === 'open') {
                  // Oeil GAUCHE fermé = Clic GAUCHE
                  cursorStabilityRef.current.clickType = 'left';
                  console.log('[Head Tracking] 👁️ Oeil GAUCHE fermé → Prêt pour Clic GAUCHE');
                } else if (newRightStatus === 'closed' && newLeftStatus === 'open') {
                  // Oeil DROIT fermé = Clic DROIT
                  cursorStabilityRef.current.clickType = 'right';
                  console.log('[Head Tracking] 👁️ Oeil DROIT fermé → Prêt pour Clic DROIT');
                } else if (newLeftStatus === 'open' && newRightStatus === 'open') {
                  // Tous les deux ouverts = Clic GAUCHE par défaut
                  cursorStabilityRef.current.clickType = 'left';
                }

                // Mettre à jour le statut précédent
                previousEyeStatusRef.current = {
                  left: newLeftStatus,
                  right: newRightStatus,
                };
              }
            }
          } catch (err) {
            console.error('[Head Tracking] Erreur détection:', err);
          }

          detectionLoopRef.current = requestAnimationFrame(detectHead);
        };

        detectHead();
      } catch (err) {
        console.error('[Head Tracking] Erreur initialisation:', err);
        setIsLoading(false);

        if (err.name === 'NotAllowedError') {
          setError('❌ Accès webcam refusé. Vérifiez les permissions du navigateur.');
        } else if (err.name === 'NotFoundError') {
          setError('❌ Aucune webcam détectée sur cet appareil.');
        } else if (err.name === 'SecurityError') {
          setError('❌ HTTPS est requis pour accéder à la webcam.');
        } else if (err.message?.includes('Failed to load model')) {
          setError('❌ Erreur lors du chargement des modèles de détection faciale. Vérifiez le dossier /models.');
        } else {
          setError(`❌ Erreur: ${err.message}`);
        }

        setIsEnabled(false);
      }
    };

    initHeadTracking();

    return () => {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
    };
  }, [isEnabled, selectedEye]);

  // Vérifier la disponibilité de getUserMedia
  const checkBrowserSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('❌ Votre navigateur ne supporte pas l\'accès webcam');
      return false;
    }
    return true;
  };

  const value = {
    isEnabled,
    setIsEnabled,
    cursorPos,
    eyeStatus,
    isLoading,
    error,
    videoRef,
    selectedEye,
    setSelectedEye,
    isEyeClosed: (eye) => {
      if (eye === 'left') return eyeStatus.left === 'closed';
      if (eye === 'right') return eyeStatus.right === 'closed';
      return false;
    },
  };

  return (
    <EyeTrackingContext.Provider value={value}>
      {children}
      {/* Video caché */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
        muted
      />
    </EyeTrackingContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte de l'eye tracking partout dans l'app
 */
export const useEyeTracking = () => {
  const context = useContext(EyeTrackingContext);
  if (!context) {
    throw new Error(
      'useEyeTracking doit être utilisé dans un EyeTrackingProvider'
    );
  }
  return context;
};

export default EyeTrackingProvider;







