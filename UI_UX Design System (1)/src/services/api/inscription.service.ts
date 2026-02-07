/**
 * Inscription Service
 * Handles enrollment-related API calls
 */

import { API_CONFIG, getHeaders, getApiUrl } from './config';

export interface CreateInscriptionRequest {
  id_eleve: string;
  id_formation: string;
}

export interface UpdateInscriptionRequest {
  statut_formation?: string;
  niveau_actuel?: number;
}

export interface Inscription {
  _id: string;
  id_eleve: string | any;
  id_formation: string | any;
  date_inscription: string;
  niveau_actuel: number;
  statut_formation: string;
  date_completion?: string;
  createdAt?: string;
  updatedAt?: string;
}

class InscriptionService {
  /**
   * Enroll student to formation
   */
  async create(data: CreateInscriptionRequest): Promise<Inscription> {
    const response = await fetch(getApiUrl(API_CONFIG.INSCRIPTION.CREATE), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to enroll student: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all enrollments
   */
  async findAll(): Promise<Inscription[]> {
    const response = await fetch(getApiUrl(API_CONFIG.INSCRIPTION.LIST), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch enrollments: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get enrollment by ID
   */
  async findOne(id: string): Promise<Inscription> {
    const response = await fetch(getApiUrl(API_CONFIG.INSCRIPTION.GET(id)), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch enrollment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update enrollment status
   */
  async updateStatus(id: string, data: UpdateInscriptionRequest): Promise<Inscription> {
    const response = await fetch(getApiUrl(API_CONFIG.INSCRIPTION.UPDATE(id)), {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update enrollment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete enrollment
   */
  async remove(id: string): Promise<void> {
    const response = await fetch(getApiUrl(API_CONFIG.INSCRIPTION.DELETE(id)), {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete enrollment: ${response.statusText}`);
    }
  }
}

export const inscriptionService = new InscriptionService();
