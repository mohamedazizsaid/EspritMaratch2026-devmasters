/**
 * Presence Service
 * Handles attendance-related API calls
 */

import { API_CONFIG, getHeaders, getApiUrl } from './config';

export interface MarkPresenceRequest {
  id_inscription: string;
  id_seance: string;
  present: boolean;
  remarques?: string;
}

export interface UpdatePresenceRequest {
  present?: boolean;
  remarques?: string;
}

export interface Presence {
  _id: string;
  id_inscription: string | any;
  id_seance: string;
  present: boolean;
  date_pointage?: string;
  remarques?: string;
  createdAt?: string;
  updatedAt?: string;
}

class PresenceService {
  /**
   * Mark student attendance
   */
  async markPresence(data: MarkPresenceRequest): Promise<Presence> {
    const response = await fetch(getApiUrl(API_CONFIG.PRESENCE.CREATE), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark attendance: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get attendance for a session
   */
  async findBySeance(seanceId: string): Promise<Presence[]> {
    const response = await fetch(getApiUrl(API_CONFIG.PRESENCE.BY_SEANCE(seanceId)), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attendance: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update attendance record
   */
  async update(id: string, data: UpdatePresenceRequest): Promise<Presence> {
    const response = await fetch(getApiUrl(API_CONFIG.PRESENCE.UPDATE(id)), {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update attendance: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete attendance record
   */
  async remove(id: string): Promise<void> {
    const response = await fetch(getApiUrl(API_CONFIG.PRESENCE.DELETE(id)), {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete attendance: ${response.statusText}`);
    }
  }
}

export const presenceService = new PresenceService();
