/**
 * Chatbot Service
 * Handles AI chatbot and Gemini integration API calls
 */

import { API_CONFIG, getHeaders, getFileUploadHeaders, getApiUrl } from './config';

export interface ChatbotQueryRequest {
  message: string;
  context?: string;
  formationId?: string;
}

export interface ChatbotQueryResponse {
  _id: string;
  message: string;
  response: string;
  context?: string;
  timestamp: string;
}

export interface ChatbotImageAnalysisRequest {
  imageUrl?: string;
  base64?: string;
  message: string;
  formationId?: string;
}

export interface ChatbotImageAnalysisResponse {
  _id: string;
  imageUrl: string;
  message: string;
  analysis: string;
  recommendations: string[];
  timestamp: string;
}

export interface ChatHistoryRecord {
  _id: string;
  type: 'text' | 'image';
  message: string;
  response: string;
  formationId?: string;
  timestamp: string;
}

class ChatbotService {
  /**
   * Ask Gemini AI assistant
   */
  async ask(data: ChatbotQueryRequest): Promise<ChatbotQueryResponse> {
    const response = await fetch(getApiUrl(API_CONFIG.CHATBOT.ASK), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to get AI response: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Analyze image with Gemini
   */
  async analyzeImage(data: ChatbotImageAnalysisRequest): Promise<ChatbotImageAnalysisResponse> {
    const response = await fetch(getApiUrl(API_CONFIG.CHATBOT.ANALYZE_IMAGE), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze image: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload and analyze image
   */
  async uploadAndAnalyze(
    file: File,
    message: string,
    formationId?: string
  ): Promise<ChatbotImageAnalysisResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    const params = new URLSearchParams();
    params.append('message', message);
    if (formationId) {
      params.append('formationId', formationId);
    }

    const response = await fetch(
      `${getApiUrl(API_CONFIG.CHATBOT.UPLOAD_ANALYZE)}?${params.toString()}`,
      {
        method: 'POST',
        headers: getFileUploadHeaders(),
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to upload and analyze image: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get chat history
   */
  async getHistory(limit: number = 20): Promise<ChatHistoryRecord[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(
      `${getApiUrl(API_CONFIG.CHATBOT.HISTORY)}?${params.toString()}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chat history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get formation-specific chat history
   */
  async getFormationHistory(formationId: string, limit: number = 20): Promise<ChatHistoryRecord[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(
      `${getApiUrl(API_CONFIG.CHATBOT.FORMATION_HISTORY(formationId))}?${params.toString()}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch formation chat history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete chat record
   */
  async deleteChatRecord(recordId: string): Promise<void> {
    const response = await fetch(
      getApiUrl(API_CONFIG.CHATBOT.DELETE_RECORD(recordId)),
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete chat record: ${response.statusText}`);
    }
  }
}

export const chatbotService = new ChatbotService();
