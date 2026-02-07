/**
 * Certification Service
 * Handles certificate-related API calls
 */

import { API_CONFIG, getHeaders, getApiUrl } from './config';

export interface CreateCertificationRequest {
  id_inscription: string;
  delivre_par: string;
}

export interface Certification {
  _id: string;
  id_inscription: string | any;
  numero_certificat: string;
  date_delivrance: string;
  fichier_pdf?: string;
  delivre_par: string;
  createdAt?: string;
  updatedAt?: string;
}

class CertificationService {
  /**
   * Issue a certificate
   */
  async create(data: CreateCertificationRequest): Promise<Certification> {
    const response = await fetch(getApiUrl(API_CONFIG.CERTIFICATION.CREATE), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create certificate: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all certificates
   */
  async findAll(): Promise<Certification[]> {
    const response = await fetch(getApiUrl(API_CONFIG.CERTIFICATION.LIST), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch certificates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get certificate by ID
   */
  async findOne(id: string): Promise<Certification> {
    const response = await fetch(getApiUrl(API_CONFIG.CERTIFICATION.GET(id)), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch certificate: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Download certificate PDF
   */
  async downloadPdf(id: string): Promise<Blob> {
    const response = await fetch(getApiUrl(API_CONFIG.CERTIFICATION.DOWNLOAD(id)), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to download certificate: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Helper method to trigger PDF download in browser
   */
  async downloadPdfFile(id: string, filename?: string): Promise<void> {
    try {
      const blob = await this.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `certificate-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download certificate:', error);
      throw error;
    }
  }
}

export const certificationService = new CertificationService();
