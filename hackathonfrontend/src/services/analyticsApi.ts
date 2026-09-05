import { getBaseURL } from '@/services/api/config';

const API_BASE_URL = getBaseURL();

function getToken(): string | null {
  return localStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('authToken');
}

export interface AnalyticsData {
  // Counters
  totalFormations: number;
  totalEleves: number;
  totalInscriptions: number;
  totalCertifications: number;
  totalPresences: number;
  totalSeances: number;
  totalNiveaux: number;
  totalFormateurs: number;
  totalResponsables: number;
  totalAdmins: number;

  // Status breakdown
  formationsActives: number;
  formationsInactives: number;
  elevesActifs: number;
  elevesInactifs: number;
  elevesArchives: number;

  // Inscription status
  inscriptionsByStatus: {
    en_cours: number;
    completee: number;
    abandonnee: number;
  };

  // Rates
  tauxPresence: number;
  tauxCompletion: number;
  tauxAbandon: number;

  // Presence stats
  presencePresent: number;
  presenceAbsent: number;

  // Charts data
  usersByRole: { name: string; value: number; color: string }[];
  elevesParFormation: {
    name: string;
    eleves: number;
    enCours: number;
    completee: number;
    abandonnee: number;
  }[];
  monthlyInscriptions: { month: string; inscriptions: number }[];
  monthlyEleves: { month: string; eleves: number }[];
}

export const analyticsApi = {
  async getDashboardStats(): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },
};
