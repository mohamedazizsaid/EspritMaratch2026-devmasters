/**
 * Formation Service
 * Handles formation-related API calls
 */

import { API_CONFIG, getHeaders, getApiUrl } from './config';

export interface CreateFormationRequest {
  nom_formation: string;
  description?: string;
  id_formateur?: string;
  statut?: string;
}

export interface UpdateFormationRequest {
  nom_formation?: string;
  description?: string;
  statut?: string;
  id_formateur?: string;
}

export interface UpdateNiveauRequest {
  nom_niveau?: string;
  statut?: boolean;
}

export interface UpdateSeanceRequest {
  titre?: string;
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

export interface Formation {
  _id: string;
  nom_formation: string;
  id_formateur?: string;
  description?: string;
  date_creation?: string;
  statut: string;
  niveaux?: Niveau[];
  createdAt?: string;
  updatedAt?: string;
}

class FormationService {
  /**
   * Create a new formation
   */
  async create(data: CreateFormationRequest): Promise<Formation> {
    const response = await fetch(getApiUrl(API_CONFIG.FORMATION.CREATE), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create formation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update a formation
   */
  async update(id: string, data: UpdateFormationRequest): Promise<Formation> {
    const response = await fetch(getApiUrl(API_CONFIG.FORMATION.UPDATE(id)), {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update formation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all formations
   */
  async findAll(): Promise<Formation[]> {
    const response = await fetch(getApiUrl(API_CONFIG.FORMATION.LIST), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch formations: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get formation by ID with full hierarchy
   */
  async findOne(id: string): Promise<Formation> {
    const response = await fetch(getApiUrl(API_CONFIG.FORMATION.GET(id)), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch formation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete formation and associated levels/sessions
   */
  async remove(id: string): Promise<void> {
    const response = await fetch(getApiUrl(API_CONFIG.FORMATION.DELETE(id)), {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete formation: ${response.statusText}`);
    }
  }

  /**
   * Get formations by formateur ID
   */
  async findByFormateur(id_formateur: string): Promise<Formation[]> {
    const response = await fetch(getApiUrl(API_CONFIG.FORMATION.BY_FORMATEUR(id_formateur)), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch formations: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update a niveau
   */
  async updateNiveau(niveauId: string, data: UpdateNiveauRequest): Promise<Niveau> {
    const response = await fetch(getApiUrl(API_CONFIG.FORMATION.UPDATE_NIVEAU(niveauId)), {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update niveau: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update a seance
   */
  async updateSeance(seanceId: string, data: UpdateSeanceRequest): Promise<Seance> {
    const response = await fetch(getApiUrl(API_CONFIG.FORMATION.UPDATE_SEANCE(seanceId)), {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update seance: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check auto-advancement of niveaux for a formation
   */
  async checkAdvancement(formationId: string): Promise<{ advanced: boolean; currentNiveau: number }> {
    const response = await fetch(getApiUrl(API_CONFIG.FORMATION.CHECK_ADVANCEMENT(formationId)), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to check advancement: ${response.statusText}`);
    }

    return response.json();
  }
}

export const formationService = new FormationService();
