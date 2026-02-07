import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Camera,
  CameraOff,
  Scan,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

interface StudentRecord {
  inscriptionId: string;
  eleveId: string;
  nom: string;
  prenom: string;
  email: string;
  avatar?: string;
  present: boolean;
}

interface FaceIDCameraProps {
  students: StudentRecord[];
  onPresenceUpdate: (updatedStudents: StudentRecord[]) => void;
  onClose: () => void;
}

type ScanStatus = 'idle' | 'loading-models' | 'loading-descriptors' | 'scanning' | 'done';

interface MatchedStudent {
  student: StudentRecord;
  confidence: number;
  timestamp: number;
}

export function FaceIDCamera({ students, onPresenceUpdate, onClose }: FaceIDCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const descriptorsRef = useRef<Map<string, Float32Array>>(new Map());

  const [status, setStatus] = useState<ScanStatus>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const [matchedStudents, setMatchedStudents] = useState<Map<string, MatchedStudent>>(new Map());
  const [currentDetection, setCurrentDetection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [descriptorsReady, setDescriptorsReady] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [skippedStudents, setSkippedStudents] = useState<string[]>([]);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      setStatus('loading-models');
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log('✅ Modèles face-api.js chargés');
      } catch (err) {
        console.error('❌ Erreur chargement modèles:', err);
        setError('Impossible de charger les modèles de reconnaissance faciale');
      }
    };
    loadModels();
  }, []);

  // Load reference face descriptors from student avatars
  useEffect(() => {
    if (!modelsLoaded) return;

    const loadDescriptors = async () => {
      setStatus('loading-descriptors');
      const skipped: string[] = [];

      for (const student of students) {
        if (!student.avatar) {
          skipped.push(`${student.prenom} ${student.nom}`);
          continue;
        }

        try {
          // Load avatar image and compute face descriptor
          const img = await faceapi.fetchImage(student.avatar);
          const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            descriptorsRef.current.set(student.inscriptionId, detection.descriptor);
            console.log(`✅ Descripteur chargé: ${student.prenom} ${student.nom}`);
          } else {
            skipped.push(`${student.prenom} ${student.nom}`);
            console.warn(`⚠️ Pas de visage détecté dans l'avatar: ${student.prenom} ${student.nom}`);
          }
        } catch (err) {
          skipped.push(`${student.prenom} ${student.nom}`);
          console.warn(`⚠️ Erreur avatar ${student.prenom} ${student.nom}:`, err);
        }
      }

      setSkippedStudents(skipped);
      setDescriptorsReady(true);
      setStatus('idle');
      console.log(`📊 Descripteurs: ${descriptorsRef.current.size}/${students.length} chargés`);
    };

    loadDescriptors();
  }, [modelsLoaded, students]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setError(null);
    } catch (err) {
      console.error('❌ Erreur caméra:', err);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setStatus('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Scan faces continuously
  const startScanning = useCallback(async () => {
    if (!videoRef.current || !cameraActive || descriptorsRef.current.size === 0) return;

    setStatus('scanning');
    setScanCount(0);

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      try {
        // Detect all faces in the video frame
        const detections = await faceapi
          .detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();

        setScanCount((prev) => prev + 1);

        // Draw detection overlay
        if (canvasRef.current && videoRef.current) {
          const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const resized = faceapi.resizeResults(detections, dims);

          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }

          // Draw boxes with labels
          resized.forEach((detection) => {
            const box = detection.detection.box;
            let bestMatch = { name: 'Inconnu', distance: 1, inscriptionId: '' };

            // Compare with each student descriptor
            descriptorsRef.current.forEach((refDescriptor, inscriptionId) => {
              const distance = faceapi.euclideanDistance(detection.descriptor, refDescriptor);
              if (distance < bestMatch.distance) {
                const student = students.find((s) => s.inscriptionId === inscriptionId);
                bestMatch = {
                  name: student ? `${student.prenom} ${student.nom}` : 'Inconnu',
                  distance,
                  inscriptionId,
                };
              }
            });

            // Threshold: distance < 0.6 = match
            const isMatch = bestMatch.distance < 0.6;

            if (ctx) {
              // Draw bounding box
              ctx.strokeStyle = isMatch ? '#22c55e' : '#ef4444';
              ctx.lineWidth = 3;
              ctx.strokeRect(box.x, box.y, box.width, box.height);

              // Draw label background
              const label = isMatch
                ? `${bestMatch.name} (${((1 - bestMatch.distance) * 100).toFixed(0)}%)`
                : 'Inconnu';
              ctx.font = 'bold 14px sans-serif';
              const textWidth = ctx.measureText(label).width;
              ctx.fillStyle = isMatch ? '#22c55e' : '#ef4444';
              ctx.fillRect(box.x, box.y - 28, textWidth + 12, 28);
              ctx.fillStyle = '#ffffff';
              ctx.fillText(label, box.x + 6, box.y - 8);
            }

            // Mark student as matched
            if (isMatch) {
              setCurrentDetection(bestMatch.name);
              setMatchedStudents((prev) => {
                const updated = new Map(prev);
                if (!updated.has(bestMatch.inscriptionId)) {
                  updated.set(bestMatch.inscriptionId, {
                    student: students.find((s) => s.inscriptionId === bestMatch.inscriptionId)!,
                    confidence: (1 - bestMatch.distance) * 100,
                    timestamp: Date.now(),
                  });
                }
                return updated;
              });

              // Short timeout to clear detection label
              setTimeout(() => setCurrentDetection(null), 2000);
            }
          });
        }
      } catch (err) {
        console.warn('Scan error:', err);
      }
    }, 1000); // Scan every second
  }, [cameraActive, students]);

  // Finalize: mark matched as present, rest as absent
  const finalizeFaceID = () => {
    stopCamera();

    const updatedStudents = students.map((student) => ({
      ...student,
      present: matchedStudents.has(student.inscriptionId),
    }));

    onPresenceUpdate(updatedStudents);
    setStatus('done');
  };

  const presentCount = matchedStudents.size;
  const totalWithDescriptors = descriptorsRef.current.size;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Scan className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Présence FaceID</h2>
              <p className="text-xs text-muted-foreground">
                Reconnaissance faciale automatique
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status === 'scanning' && (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-300 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Scan actif — {scanCount} frames
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => { stopCamera(); onClose(); }}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Camera View */}
          <div className="flex-1 p-5 flex flex-col gap-4">
            {/* Status Messages */}
            {status === 'loading-models' && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">Chargement des modèles IA...</span>
              </div>
            )}
            {status === 'loading-descriptors' && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                <span className="text-sm text-amber-800">Analyse des photos des étudiants...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}
            {skippedStudents.length > 0 && status === 'idle' && descriptorsReady && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>{skippedStudents.length} étudiant(s) sans photo détectable :</strong>
                  <span className="ml-1">{skippedStudents.join(', ')}</span>
                </div>
              </div>
            )}

            {/* Video Container */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ transform: 'scaleX(-1)' }}
              />

              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                  <div className="text-center space-y-3">
                    <CameraOff className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Caméra inactive</p>
                  </div>
                </div>
              )}

              {/* Live Detection Label */}
              {currentDetection && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
                  <UserCheck className="h-4 w-4 inline mr-2" />
                  {currentDetection} détecté(e) !
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!cameraActive ? (
                <Button
                  onClick={startCamera}
                  disabled={!descriptorsReady || status === 'loading-models' || status === 'loading-descriptors'}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <Camera className="h-5 w-5" />
                  Démarrer la caméra
                </Button>
              ) : status !== 'scanning' ? (
                <Button
                  onClick={startScanning}
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Scan className="h-5 w-5" />
                  Lancer le scan
                </Button>
              ) : (
                <Button
                  onClick={finalizeFaceID}
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Terminer — {presentCount} présent(s) détecté(s)
                </Button>
              )}
              {cameraActive && (
                <Button variant="outline" onClick={stopCamera} size="lg">
                  <CameraOff className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar: detected students */}
          <div className="w-72 border-l border-border p-4 overflow-y-auto bg-muted/20">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              Détectés ({presentCount}/{students.length})
            </h3>
            <div className="space-y-2">
              {students.map((student) => {
                const matched = matchedStudents.get(student.inscriptionId);
                return (
                  <div
                    key={student.inscriptionId}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                      matched
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-background border border-border opacity-50'
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {`${student.prenom?.[0] || ''}${student.nom?.[0] || ''}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {student.prenom} {student.nom}
                      </p>
                      {matched && (
                        <p className="text-[10px] text-green-600">
                          {matched.confidence.toFixed(0)}% confiance
                        </p>
                      )}
                    </div>
                    {matched ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
