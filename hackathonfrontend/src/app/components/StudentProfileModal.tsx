import { X, Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export interface StudentProfile {
  _id?: string;
  nom: string;
  prenom: string;
  avatar?: string;
  date_naissance?: string | Date;
  telephone?: string;
  email: string;
  adresse?: string;
  date_inscription?: string | Date;
  statut?: string;
  progress?: number;
  grade?: string;
}

interface StudentProfileModalProps {
  isOpen: boolean;
  student: StudentProfile | null;
  onClose: () => void;
}

export function StudentProfileModal({
  isOpen,
  student,
  onClose,
}: StudentProfileModalProps) {
  if (!isOpen || !student) return null;

  console.log('StudentProfileModal opened with student:', student);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch {
      return 'N/A';
    }
  };

  const getStatutColor = (statut?: string) => {
    const status = statut?.toLowerCase();
    switch (status) {
      case 'actif':
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'inactif':
      case 'inactive':
        return 'bg-muted text-muted-foreground border border-border';
      case 'suspendu':
      case 'suspended':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      default:
        return 'bg-primary/10 text-primary border border-primary/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/80 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/70 sticky top-0 bg-background/90 backdrop-blur-md z-10">
          <h2 className="text-2xl font-bold">Profil de l'étudiant</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 flex-shrink-0">
              <AvatarImage src={student.avatar} alt={`${student.prenom} ${student.nom}`} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {`${student.prenom?.[0] || ''}${student.nom?.[0] || ''}`.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-2xl font-bold">
                  {student.prenom} {student.nom}
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{student.email}</span>
                </div>

                {student.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{student.telephone}</span>
                  </div>
                )}

                {student.adresse && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{student.adresse}</span>
                  </div>
                )}

                {student.date_naissance && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">Né(e) le {formatDate(student.date_naissance)}</span>
                  </div>
                )}
              </div>

              {student.statut && (
                <div className="flex items-center gap-2">
                  <Badge className={getStatutColor(student.statut)}>
                    {student.statut}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {student.date_naissance && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Date de naissance
                  </h4>
                </div>
                <p className="text-base font-medium">
                  {formatDate(student.date_naissance)}
                </p>
              </div>
            )}

            {student.date_inscription && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Date d'inscription
                  </h4>
                </div>
                <p className="text-base font-medium">
                  {formatDate(student.date_inscription)}
                </p>
              </div>
            )}

       
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
