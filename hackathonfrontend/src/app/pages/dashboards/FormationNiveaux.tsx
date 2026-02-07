import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useTranslation } from '../../lib/i18n';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Lock,
  ChevronRight,
  Play,
} from 'lucide-react';

interface Niveau {
  _id: string;
  numero_niveau: number;
  nom_niveau: string;
  statut: boolean;
  seances?: any[];
}

interface FormationDetail {
  _id: string;
  nom_formation: string;
  description: string;
  statut: string;
  date_creation: string;
  createdAt?: string;
  updatedAt?: string;
  niveaux: Niveau[];
}

export function FormationNiveaux() {
  const { formationId } = useParams<{ formationId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formation, setFormation] = useState<FormationDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
        console.log('Formation détaillée:', data);
        setFormation(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la formation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [formationId]);

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground">{t('formationNiveaux.loadingFormation')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">{t('formationNiveaux.notFound')}</p>
              <Button variant="outline" onClick={() => navigate('/dashboard/instructor')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('formationNiveaux.backToDashboard')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sort niveaux by numero_niveau
  const sortedNiveaux = [...(formation.niveaux || [])].sort(
    (a, b) => a.numero_niveau - b.numero_niveau
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
            onClick={() => navigate('/dashboard/instructor')}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('formationNiveaux.backToDashboard')}
          </Button>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold animate-fade-in">{formation.nom_formation}</h1>
              <p className="text-muted-foreground max-w-2xl">{formation.description}</p>
            </div>
            <Badge
              className={`text-sm ${
                formation.statut === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {formation.statut}
            </Badge>
          </div>
        </div>
      </div>

      {/* Formation Info */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {t('formationNiveaux.formationInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('common.name')}</p>
                <p className="font-medium">{formation.nom_formation}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('common.description')}</p>
                <p className="font-medium">{formation.description || t('common.noDescription')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('common.status')}</p>
                <Badge
                  className={`${
                    formation.statut === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {formation.statut}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">{t('formationNiveaux.creationDate')}</p>
                </div>
                <p className="font-medium">{formatDate(formation.date_creation)}</p>
              </div>
              {formation.createdAt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('common.createdAt')}</p>
                  <p className="font-medium">{formatDate(formation.createdAt)}</p>
                </div>
              )}
              {formation.updatedAt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('common.updatedAt')}</p>
                  <p className="font-medium">{formatDate(formation.updatedAt)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Niveaux List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t('formationNiveaux.formationLevels')}</h2>
          <p className="text-muted-foreground">
            {t('formationNiveaux.clickLevelToSee')}
          </p>

          <div className="grid grid-cols-1 gap-4">
            {sortedNiveaux.map((niveau, index) => {
              // First niveau is always enabled, others depend on previous niveau statut = true
              const isEnabled = index === 0 || sortedNiveaux[index - 1]?.statut === true;

              return (
                <div key={niveau._id} className="relative">
                  {/* Connector line */}
                  {index < sortedNiveaux.length - 1 && (
                    <div
                      className={`absolute left-6 top-[4.5rem] w-0.5 h-6 transition-colors ${
                        niveau.statut ? 'bg-green-300' : 'bg-border'
                      }`}
                    />
                  )}

                  <Card
                    className={`transition-all duration-300 animate-slide-up ${
                      !isEnabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:shadow-lg cursor-pointer'
                    } ${
                      niveau.statut
                        ? 'border-green-200 bg-green-50/30'
                        : isEnabled
                        ? 'border-border hover:border-primary/30'
                        : 'border-border'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => {
                      if (!isEnabled) return;
                      navigate(
                        `/dashboard/instructor/formation/${formationId}/niveau/${niveau._id}`
                      );
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
                              niveau.statut
                                ? 'bg-green-100 text-green-700'
                                : isEnabled
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {niveau.statut ? (
                              <CheckCircle2 className="h-6 w-6" />
                            ) : isEnabled ? (
                              <Play className="h-5 w-5 ml-0.5" />
                            ) : (
                              <Lock className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold ${!isEnabled ? 'text-muted-foreground' : ''}`}>
                              {niveau.nom_niveau}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {t('common.level')} {niveau.numero_niveau}
                              {niveau.seances && ` • ${niveau.seances.length} ${t('common.sessions')}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {niveau.statut ? (
                            <Badge className="bg-green-100 text-green-800 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('common.completed')}
                            </Badge>
                          ) : isEnabled ? (
                            <Badge className="bg-primary/10 text-primary gap-1">
                              {t('common.available')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground gap-1">
                              <Lock className="h-3 w-3" />
                              {t('common.locked')}
                            </Badge>
                          )}
                          {isEnabled && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {sortedNiveaux.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t('formationNiveaux.noLevelFound')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
