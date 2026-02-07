// ============================================================
// TypeScript types matching the NestJS backend models
// ============================================================

// ==================== AUTH ====================
export enum UserRole {
  FORMATEUR = 'Formateurs',
  ADMIN = 'Admin',
  RESPONSABLE_FORMATION = 'responsableformation',
}

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  actif: boolean;
  date_creation: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface LoginPayload {
  email: string;
  mot_de_passe: string;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  role?: UserRole;
}

// ==================== ELEVE ====================
export enum StatutEleve {
  ACTIF = 'actif',
  INACTIF = 'inactif',
  ARCHIVE = 'archive',
}

export interface Eleve {
  _id: string;
  nom: string;
  prenom: string;
  avatar?: string;
  date_naissance?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  date_inscription?: string;
  statut: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateElevePayload {
  nom: string;
  prenom: string;
  avatar?: string;
  date_naissance?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  date_inscription?: string;
  statut?: StatutEleve;
}

export type UpdateElevePayload = Partial<CreateElevePayload>;

// ==================== FORMATION ====================
export enum StatutFormation {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface Seance {
  _id: string;
  id_niveau: string;
  numero_seance: number;
  titre: string;
  date_prevue?: string;
  heure_debut?: string;
  heure_fin?: string;
  statut?: boolean;
}

export interface Niveau {
  _id: string;
  id_formation: string;
  numero_niveau: number;
  nom_niveau: string;
  statut: boolean;
  seances?: Seance[];
}

export interface Formation {
  _id: string;
  nom_formation: string;
  description?: string;
  id_formateur?: string;
  date_creation?: string;
  statut: string;
  niveaux?: Niveau[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FormationDetail extends Formation {
  niveaux: Niveau[];
}

export interface CreateFormationPayload {
  nom_formation: string;
  description?: string;
  statut?: StatutFormation;
}

// ==================== INSCRIPTION ====================
export enum StatutInscription {
  EN_COURS = 'en_cours',
  COMPLETEE = 'completee',
  ABANDONNEE = 'abandonnee',
}

export interface Inscription {
  _id: string;
  id_eleve: string | Eleve;
  id_formation: string | Formation;
  date_inscription?: string;
  niveau_actuel?: number;
  statut_formation: string;
  date_completion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInscriptionPayload {
  id_eleve: string;
  id_formation: string;
}

export interface UpdateInscriptionStatusPayload {
  statut_formation?: StatutInscription;
  niveau_actuel?: number;
}

// ==================== PRESENCE ====================
export interface Presence {
  _id: string;
  id_inscription: string | Inscription;
  id_seance: string;
  present: boolean;
  date_pointage?: string;
  remarques?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarkPresencePayload {
  id_inscription: string;
  id_seance: string;
  present: boolean;
  remarques?: string;
}

export interface UpdatePresencePayload {
  present?: boolean;
  remarques?: string;
}

// ==================== CERTIFICATION ====================
export interface Certification {
  _id: string;
  id_inscription: string | Inscription;
  numero_certificat?: string;
  date_delivrance?: string;
  fichier_pdf?: string;
  delivre_par?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCertificationPayload {
  id_inscription: string;
  delivre_par: string;
}

// ==================== CHATBOT ====================
export interface ChatbotQueryPayload {
  message: string;
  formationId?: string;
  context?: string;
}

export interface ChatbotResponse {
  reponse: string;
  metadata: {
    formateur: string;
    formation?: string;
    timestamp: string;
    modelUsed: string;
  };
}

export interface ChatbotImageAnalysisPayload {
  message: string;
  imageData: string;
  formationId?: string;
}

export interface ChatbotImageAnalysisResponse {
  analyse: string;
  recommandations: string[];
  metadata: {
    formateur: string;
    formation?: string;
    timestamp: string;
    modelUsed: string;
    imageUrl?: string;
  };
}

// ==================== CHAT HISTORY ====================
export interface ChatHistory {
  _id: string;
  userId: string;
  formationId?: string;
  userMessage: string;
  assistantResponse: string;
  type: string;
  imageUrl?: string;
  modelUsed: string;
  createdAt: string;
}
// ==================== FRONTEND ROLE MAPPING ====================
// Maps backend UserRole to frontend-friendly role strings
export type FrontendRole = 'instructor' | 'manager' | 'admin';

export function mapBackendRole(role: UserRole): FrontendRole {
  switch (role) {
    case UserRole.FORMATEUR:
      return 'instructor';
    case UserRole.RESPONSABLE_FORMATION:
      return 'manager';
    case UserRole.ADMIN:
      return 'admin';
    default:
      return 'instructor';
  }
}

export function mapFrontendRole(role: FrontendRole): UserRole {
  switch (role) {
    case 'instructor':
      return UserRole.FORMATEUR;
    case 'manager':
      return UserRole.RESPONSABLE_FORMATION;
    case 'admin':
      return UserRole.ADMIN;
    default:
      return UserRole.FORMATEUR;
  }
}
