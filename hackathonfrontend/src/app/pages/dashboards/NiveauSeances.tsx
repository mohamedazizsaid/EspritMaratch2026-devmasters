import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  X,
  Users,
  Check,
  XCircle,
  Scan,
} from 'lucide-react';
import { toast } from 'sonner';
import { FaceIDCamera } from '../../components/FaceIDCamera';

interface Seance {
  _id: string;
  numero_seance: number;
  titre: string;
  date_prevue?: string;
  heure_debut?: string;
  heure_fin?: string;
  statut: boolean;
}

interface NiveauDetail {
  _id: string;
  numero_niveau: number;
  nom_niveau: string;
  statut: boolean;
  seances: Seance[];
}

interface FormationInfo {
  _id: string;
  nom_formation: string;
  description: string;
}

interface InscriptionStudent {
  _id: string;
  id_eleve: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    avatar?: string;
  };
  id_formation: string;
}

interface PresenceRecord {
  inscriptionId: string;
  eleveId: string;
  nom: string;
  prenom: string;
  email: string;
  avatar?: string;
  present: boolean;
}

export function NiveauSeances() {
  const { formationId, niveauId } = useParams<{
    formationId: string;
    niveauId: string;
  }>();
  const navigate = useNavigate();
  const [niveau, setNiveau] = useState<NiveauDetail | null>(null);
  const [formation, setFormation] = useState<FormationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null);
  const [presenceList, setPresenceList] = useState<PresenceRecord[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showFaceID, setShowFaceID] = useState(false);

  useEffect(() => {
    if (!formationId) return;

    const fetchFormation = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/api/formation/${formationId}`
        );
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();
        console.log('Formation data:', data);

        setFormation({
          _id: data._id,
          nom_formation: data.nom_formation,
          description: data.description,
        });

        // Find the specific niveau
        const foundNiveau = data.niveaux?.find(
          (n: any) => n._id === niveauId
        );
        if (foundNiveau) {
          setNiveau(foundNiveau);
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [formationId, niveauId]);

  const formatDate = (date: string | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isSeanceEnabled = (seance: Seance, index: number, seances: Seance[]) => {
    if (index === 0) return true;
    const previousSeance = seances[index - 1];
    return previousSeance?.statut === true;
  };

  const handleSeanceClick = async (seance: Seance) => {
    if (seance.statut) return; // Already completed
    try {
      setLoadingStudents(true);
      setSelectedSeance(seance);

      // Fetch students for this formation via seance
      const response = await fetch(
        `http://localhost:3000/api/formation/seance/${seance._id}/students`
      );
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      const inscriptions: InscriptionStudent[] = await response.json();
      console.log('Inscriptions:', inscriptions);

      // Also fetch existing presences for this seance
      const presResponse = await fetch(
        `http://localhost:3000/api/presence/seance/${seance._id}`
      );
      const existingPresences = presResponse.ok ? await presResponse.json() : [];

      // Build presence list
      const list: PresenceRecord[] = inscriptions
        .filter((ins) => ins.id_eleve)
        .map((ins) => {
          const existing = existingPresences.find(
            (p: any) => p.id_inscription?._id === ins._id || p.id_inscription === ins._id
          );
          return {
            inscriptionId: ins._id,
            eleveId: ins.id_eleve._id,
            nom: ins.id_eleve.nom,
            prenom: ins.id_eleve.prenom,
            email: ins.id_eleve.email,
            avatar: ins.id_eleve.avatar,
            present: existing ? existing.present : false,
          };
        });

      setPresenceList(list);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les étudiants');
      setSelectedSeance(null);
    } finally {
      setLoadingStudents(false);
    }
  };

  const togglePresence = (inscriptionId: string) => {
    setPresenceList((prev) =>
      prev.map((p) =>
        p.inscriptionId === inscriptionId ? { ...p, present: !p.present } : p
      )
    );
  };

  const handleValidateSeance = async () => {
    if (!selectedSeance) return;

    try {
      setSubmitting(true);

      // 1. Save all presences
      for (const record of presenceList) {
        try {
          await fetch('http://localhost:3000/api/presence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_inscription: record.inscriptionId,
              id_seance: selectedSeance._id,
              present: record.present,
            }),
          });
        } catch {
          // Presence already exists - ignore conflict
        }
      }

      // 2. Validate seance (statut = true)
      const response = await fetch(
        `http://localhost:3000/api/formation/seance/${selectedSeance._id}/validate`,
        { method: 'PATCH' }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la validation');
      }

      // 3. Update local state
      if (niveau) {
        const updatedSeances = niveau.seances.map((s) =>
          s._id === selectedSeance._id ? { ...s, statut: true } : s
        );
        setNiveau({ ...niveau, seances: updatedSeances });
      }

      toast.success('Séance validée avec succès !');
      setSelectedSeance(null);
      setPresenceList([]);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la validation de la séance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground">Chargement des séances...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!niveau || !formation) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Niveau introuvable</p>
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/instructor/formation/${formationId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux niveaux
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sort seances by numero_seance
  const sortedSeances = [...(niveau.seances || [])].sort(
    (a, b) => a.numero_seance - b.numero_seance
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 gap-2 hover:bg-primary/10 transition-colors"
            onClick={() =>
              navigate(`/dashboard/instructor/formation/${formationId}`)
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux niveaux
          </Button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span
              className="hover:text-primary cursor-pointer transition-colors"
              onClick={() => navigate('/dashboard/instructor')}
            >
              Tableau de bord
            </span>
            <span>/</span>
            <span
              className="hover:text-primary cursor-pointer transition-colors"
              onClick={() =>
                navigate(`/dashboard/instructor/formation/${formationId}`)
              }
            >
              {formation.nom_formation}
            </span>
            <span>/</span>
            <span className="text-foreground font-medium">{niveau.nom_niveau}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold animate-fade-in">
                {niveau.nom_niveau}
              </h1>
              <p className="text-muted-foreground">
                {formation.nom_formation} — Niveau {niveau.numero_niveau}
              </p>
            </div>
            {niveau.statut ? (
              <Badge className="bg-green-100 text-green-800 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Complété
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                En cours
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Séances List */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Séances ({sortedSeances.length})
          </h2>
        </div>

        {/* Timeline-style seances */}
        <div className="space-y-1">
          {sortedSeances.map((seance, index) => {
            const enabled = isSeanceEnabled(seance, index, sortedSeances);

            return (
              <div key={seance._id} className="relative">
                {/* Connector line */}
                {index < sortedSeances.length - 1 && (
                  <div
                    className={`absolute left-6 top-16 w-0.5 h-8 transition-colors ${
                      seance.statut ? 'bg-green-300' : 'bg-border'
                    }`}
                  />
                )}

                <Card
                  className={`transition-all duration-300 animate-slide-up ${
                    !enabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg cursor-pointer'
                  } ${
                    seance.statut
                      ? 'border-green-200 bg-green-50/30'
                      : enabled
                      ? 'border-border hover:border-primary/40'
                      : 'border-border'
                  }`}
                  style={{ animationDelay: `${index * 80}ms` }}
                  onClick={() => {
                    if (enabled && !seance.statut) handleSeanceClick(seance);
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-5">
                      {/* Status icon */}
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          seance.statut
                            ? 'bg-green-100 text-green-700'
                            : enabled
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {seance.statut ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : enabled ? (
                          <Play className="h-5 w-5 ml-0.5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-semibold ${
                              !enabled ? 'text-muted-foreground' : ''
                            }`}
                          >
                            Séance {seance.numero_seance}: {seance.titre}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {seance.date_prevue && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span>{formatDate(seance.date_prevue)}</span>
                            </div>
                          )}
                          {seance.heure_debut && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span>
                                {seance.heure_debut}
                                {seance.heure_fin ? ` - ${seance.heure_fin}` : ''}
                              </span>
                            </div>
                          )}
                          {!seance.date_prevue && !seance.heure_debut && (
                            <span className="text-muted-foreground text-xs italic">
                              Date non programmée
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="flex-shrink-0">
                        {seance.statut ? (
                          <Badge className="bg-green-100 text-green-800">
                            Terminée
                          </Badge>
                        ) : enabled ? (
                          <Badge className="bg-primary/10 text-primary">
                            Disponible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground gap-1">
                            <Lock className="h-3 w-3" />
                            Verrouillée
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {sortedSeances.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Aucune séance trouvée pour ce niveau
            </p>
          </div>
        )}
      </div>

      {/* Presence Modal */}
      {selectedSeance && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold">
                  Présence — {selectedSeance.titre}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Séance {selectedSeance.numero_seance} • {formation?.nom_formation}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setSelectedSeance(null);
                  setPresenceList([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingStudents ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-muted-foreground">Chargement des étudiants...</p>
                  </div>
                </div>
              ) : presenceList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Users className="h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun étudiant inscrit à cette formation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      {presenceList.length} étudiant{presenceList.length > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                        onClick={() => setShowFaceID(true)}
                      >
                        <Scan className="h-4 w-4" />
                        Présence FaceID
                      </Button>
                      <span className="text-sm font-medium text-primary">
                        {presenceList.filter((p) => p.present).length} présent{presenceList.filter((p) => p.present).length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {presenceList.map((record, idx) => (
                    <div
                      key={record.inscriptionId}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 animate-slide-up ${
                        record.present
                          ? 'border-green-200 bg-green-50/40'
                          : 'border-border hover:border-primary/30'
                      }`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={record.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {`${record.prenom?.[0] || ''}${record.nom?.[0] || ''}`.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {record.prenom} {record.nom}
                          </p>
                          <p className="text-xs text-muted-foreground">{record.email}</p>
                        </div>
                      </div>

                      <Button
                        variant={record.present ? 'default' : 'outline'}
                        size="sm"
                        className={`gap-2 transition-all duration-300 ${
                          record.present
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'hover:border-red-300 hover:text-red-600'
                        }`}
                        onClick={() => togglePresence(record.inscriptionId)}
                      >
                        {record.present ? (
                          <>
                            <Check className="h-4 w-4" />
                            Présent
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Absent
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {presenceList.length > 0 && (
              <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-green-600">
                    {presenceList.filter((p) => p.present).length}
                  </span>
                  /{presenceList.length} présents
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSeance(null);
                      setPresenceList([]);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleValidateSeance}
                    disabled={submitting}
                    className="gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Validation...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Valider la séance
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FaceID Camera Modal */}
      {showFaceID && (
        <FaceIDCamera
          students={presenceList}
          onPresenceUpdate={(updatedStudents) => {
            setPresenceList(updatedStudents);
            setShowFaceID(false);
            const presentCount = updatedStudents.filter((s) => s.present).length;
            toast.success(
              `FaceID terminé : ${presentCount}/${updatedStudents.length} présent(s) détecté(s)`
            );
          }}
          onClose={() => setShowFaceID(false)}
        />
      )}
    </div>
  );
}
