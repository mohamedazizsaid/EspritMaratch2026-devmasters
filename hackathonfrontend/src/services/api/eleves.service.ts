/**
 * Eleves Service
 * Handles student-related API calls
 */

import { API_CONFIG, getHeaders, getFileUploadHeaders, getApiUrl } from './config';

export interface CreateEleveRequest {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  date_naissance?: string;
  avatar?: string;
  statut?: string;
}

export interface UpdateEleveRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  date_naissance?: string;
  avatar?: string;
  statut?: string;
}

export interface Eleve {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  date_naissance?: string;
  avatar?: string;
  date_inscription?: string;
  statut: string;
  createdAt?: string;
  updatedAt?: string;
}

class ElevesService {
  /**
   * Create a new student
   */
  async create(data: CreateEleveRequest, avatar?: File): Promise<Eleve> {
    const formData = new FormData();
    
    // Add all fields to formData
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Add avatar if provided
    if (avatar) {
      formData.append('avatar', avatar);
    }

    const response = await fetch(getApiUrl(API_CONFIG.ELEVES.CREATE), {
      method: 'POST',
      headers: getFileUploadHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create student: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all students
   */
  async findAll(): Promise<Eleve[]> {
    const response = await fetch(getApiUrl(API_CONFIG.ELEVES.LIST), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get student by ID
   */
  async findOne(id: string): Promise<Eleve> {
    const response = await fetch(getApiUrl(API_CONFIG.ELEVES.GET(id)), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch student: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update student
   */
  async update(id: string, data: UpdateEleveRequest, avatar?: File): Promise<Eleve> {
    const formData = new FormData();
    
    // Add all fields to formData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    // Add avatar if provided
    if (avatar) {
      formData.append('avatar', avatar);
    }

    const response = await fetch(getApiUrl(API_CONFIG.ELEVES.UPDATE(id)), {
      method: 'PATCH',
      headers: getFileUploadHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to update student: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete student
   */
  async remove(id: string): Promise<void> {
    const response = await fetch(getApiUrl(API_CONFIG.ELEVES.DELETE(id)), {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete student: ${response.statusText}`);
    }
  }
}

export const elevesService = new ElevesService();
