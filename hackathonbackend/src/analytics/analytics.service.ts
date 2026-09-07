import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Formation } from '../formation/entities/formation.entity';
import { Niveau } from '../formation/entities/niveau.entity';
import { Seance } from '../formation/entities/seance.entity';
import { Inscription } from '../inscription/entities/inscription.entity';
import { User } from '../auth/entities/user.entity';
import { Eleve } from '../eleve/entities/eleve.entity';
import { Presence } from '../presence/entities/presence.entity';
import { Certification } from '../certification/entities/certification.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Formation.name) private formationModel: Model<Formation>,
    @InjectModel(Niveau.name) private niveauModel: Model<Niveau>,
    @InjectModel(Seance.name) private seanceModel: Model<Seance>,
    @InjectModel(Inscription.name) private inscriptionModel: Model<Inscription>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Eleve.name) private eleveModel: Model<Eleve>,
    @InjectModel(Presence.name) private presenceModel: Model<Presence>,
    @InjectModel(Certification.name)
    private certificationModel: Model<Certification>,
  ) {}

  async getDashboardStats() {
    // Counts
    const [
      totalFormations,
      totalEleves,
      totalInscriptions,
      totalCertifications,
      totalPresences,
      totalSeances,
      totalNiveaux,
      users,
      formations,
      inscriptions,
      presences,
      eleves,
    ] = await Promise.all([
      this.formationModel.countDocuments().exec(),
      this.eleveModel.countDocuments().exec(),
      this.inscriptionModel.countDocuments().exec(),
      this.certificationModel.countDocuments().exec(),
      this.presenceModel.countDocuments().exec(),
      this.seanceModel.countDocuments().exec(),
      this.niveauModel.countDocuments().exec(),
      this.userModel.find().select('role').exec(),
      this.formationModel.find().exec(),
      this.inscriptionModel.find().populate('id_formation').exec(),
      this.presenceModel.find().exec(),
      this.eleveModel.find().exec(),
    ]);

    // Users by role
    const totalFormateurs = users.filter((u) => u.role === 'Formateurs').length;
    const totalResponsables = users.filter(
      (u) => u.role === 'responsableformation',
    ).length;
    const totalAdmins = users.filter((u) => u.role === 'Admin').length;

    // Formation statuses
    const formationsActives = formations.filter(
      (f) => f.statut === 'active',
    ).length;
    const formationsInactives = formations.filter(
      (f) => f.statut === 'inactive',
    ).length;

    // Eleve statuses
    const elevesActifs = eleves.filter((e: any) => e.statut === 'actif').length;
    const elevesInactifs = eleves.filter(
      (e: any) => e.statut === 'inactif',
    ).length;
    const elevesArchives = eleves.filter(
      (e: any) => e.statut === 'archive',
    ).length;

    // Inscription statuses
    const inscriptionsByStatus = {
      en_cours: inscriptions.filter((i) => i.statut_formation === 'en_cours')
        .length,
      completee: inscriptions.filter((i) => i.statut_formation === 'completee')
        .length,
      abandonnee: inscriptions.filter(
        (i) => i.statut_formation === 'abandonnee',
      ).length,
    };

    // Presence stats
    const presencePresent = presences.filter(
      (p: any) => p.statut === 'present' || p.present === true,
    ).length;
    const presenceAbsent = presences.filter(
      (p: any) => p.statut === 'absent' || p.present === false,
    ).length;

    // Rates
    const tauxPresence =
      totalPresences > 0
        ? Math.round((presencePresent / totalPresences) * 100)
        : 0;
    const tauxCompletion =
      totalInscriptions > 0
        ? Math.round((inscriptionsByStatus.completee / totalInscriptions) * 100)
        : 0;
    const tauxAbandon =
      totalInscriptions > 0
        ? Math.round(
            (inscriptionsByStatus.abandonnee / totalInscriptions) * 100,
          )
        : 0;

    // Users by role chart data
    const usersByRole = [
      {
        name: 'Formateurs',
        value: totalFormateurs,
        color: 'hsl(var(--primary))',
      },
      {
        name: 'Responsables',
        value: totalResponsables,
        color: 'hsl(var(--warning))',
      },
      { name: 'Admins', value: totalAdmins, color: 'hsl(var(--destructive))' },
    ];

    // Eleves par formation
    const elevesParFormation = formations.map((f) => {
      const formationInscriptions = inscriptions.filter(
        (i) =>
          i.id_formation &&
          (i.id_formation as any)._id?.toString() === f._id.toString(),
      );
      return {
        name: f.nom_formation || 'Sans nom',
        eleves: formationInscriptions.length,
        enCours: formationInscriptions.filter(
          (i) => i.statut_formation === 'en_cours',
        ).length,
        completee: formationInscriptions.filter(
          (i) => i.statut_formation === 'completee',
        ).length,
        abandonnee: formationInscriptions.filter(
          (i) => i.statut_formation === 'abandonnee',
        ).length,
      };
    });

    // Monthly inscriptions (last 6 months)
    const now = new Date();
    const monthlyInscriptions = [];
    const monthlyEleves = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = date.toLocaleString('fr-FR', { month: 'short' });

      const count = inscriptions.filter((ins) => {
        const d = new Date(ins.date_inscription);
        return d >= date && d <= endDate;
      }).length;
      monthlyInscriptions.push({ month: monthName, inscriptions: count });

      const eleveCount = eleves.filter((e: any) => {
        const d = new Date(e.createdAt || e.date_creation);
        return d >= date && d <= endDate;
      }).length;
      monthlyEleves.push({ month: monthName, eleves: eleveCount });
    }

    return {
      totalFormations,
      totalEleves,
      totalInscriptions,
      totalCertifications,
      totalPresences,
      totalSeances,
      totalNiveaux,
      totalFormateurs,
      totalResponsables,
      totalAdmins,
      formationsActives,
      formationsInactives,
      elevesActifs,
      elevesInactifs,
      elevesArchives,
      inscriptionsByStatus,
      presencePresent,
      presenceAbsent,
      tauxPresence,
      tauxCompletion,
      tauxAbandon,
      usersByRole,
      elevesParFormation,
      monthlyInscriptions,
      monthlyEleves,
    };
  }
}
