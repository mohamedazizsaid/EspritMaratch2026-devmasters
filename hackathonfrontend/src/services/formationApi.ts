import { getBaseURL } from '@/services/api/config';

const API_BASE_URL = getBaseURL();

function getToken(): string | null {
  return localStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('authToken');
}

export interface Formation {
  id: string;
  title: string;
  description?: string;
}

export interface SeanceDetail {
  _id: string;
  id_niveau: string;
  numero_seance: number;
  titre: string;
  date_prevue?: string;
  heure_debut?: string;
  heure_fin?: string;
  statut?: boolean;
}

export interface NiveauDetail {
  _id: string;
  id_formation: string;
  numero_niveau: number;
  nom_niveau: string;
  statut: boolean;
  seances: SeanceDetail[];
}

export interface EleveDetail {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  avatar?: string;
  statut?: string;
}

export interface InscriptionDetail {
  _id: string;
  id_eleve: EleveDetail;
  id_formation: string;
  date_inscription: string;
  niveau_actuel: number;
  statut_formation: string;
  date_completion?: string;
}

export interface FormationDetailed {
  _id: string;
  nom_formation: string;
  description?: string;
  statut: string;
  date_creation: string;
  id_formateur?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  niveaux: NiveauDetail[];
  inscriptions: InscriptionDetail[];
  totalEleves: number;
  totalNiveaux: number;
  totalSeances: number;
  niveauxCompletes: number;
  seancesValidees: number;
}

export interface FormationStats {
  totalFormations: number;
  totalInstructors: number;
  totalManagers: number;
}

export const formationApi = {
  async getAllFormations(): Promise<Formation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/formation`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch formations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching formations:', error);
      throw error;
    }
  },

  async getFormationStats(): Promise<FormationStats> {
    try {
      // Récupérer les formations
      const formations = await this.getAllFormations();
      const totalFormations = formations.length;

      // Récupérer les utilisateurs pour compter les formateurs et responsables
      const usersResponse = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
      }

      const users = await usersResponse.json();
      
      // Compter les formateurs (instructors) et responsables (managers)
      const totalInstructors = users.filter((u: any) => u.role === 'Formateurs' || u.role === 'instructor').length;
      const totalManagers = users.filter((u: any) => u.role === 'responsableformation' || u.role === 'manager').length;
      
      return {
        totalFormations,
        totalInstructors,
        totalManagers,
      };
    } catch (error) {
      console.error('Error fetching formation stats:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalFormations: 0,
        totalInstructors: 0,
        totalManagers: 0,
      };
    }
  },

  async getFormationById(id: string): Promise<Formation> {
    try {
      const response = await fetch(`${API_BASE_URL}/formation/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch formation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching formation:', error);
      throw error;
    }
  },

  async getAllFormationsDetailed(): Promise<FormationDetailed[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/formation/detailed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch detailed formations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching detailed formations:', error);
      throw error;
    }
  },
};
