import { apiGet, apiPost, apiDelete } from '../app/lib/api-client';
import type { ChatbotQueryPayload, ChatbotResponse, ChatbotImageAnalysisPayload, ChatbotImageAnalysisResponse } from '../app/lib/types';

export const chatbotService = {
  async ask(payload: ChatbotQueryPayload): Promise<ChatbotResponse> {
    return apiPost<ChatbotResponse>('/chatbot/ask', payload);
  },

  async analyzeImage(payload: ChatbotImageAnalysisPayload): Promise<ChatbotImageAnalysisResponse> {
    return apiPost<ChatbotImageAnalysisResponse>('/chatbot/analyze-image', payload);
  },

  async uploadAndAnalyze(file: File, message: string, formationId?: string): Promise<ChatbotImageAnalysisResponse> {
    const formData = new FormData();
    formData.append('image', file);
    let url = '/chatbot/upload-and-analyze?message=' + encodeURIComponent(message);
    if (formationId) url += '&formationId=' + encodeURIComponent(formationId);
    return apiPost<ChatbotImageAnalysisResponse>(url, formData);
  },

  async getHistory(limit = 20): Promise<any[]> {
    return apiGet<any[]>('/chatbot/history?limit=' + limit);
  },

  async getFormationHistory(formationId: string, limit = 20): Promise<any[]> {
    return apiGet<any[]>('/chatbot/history/' + formationId + '?limit=' + limit);
  },

  async deleteChatRecord(recordId: string): Promise<void> {
    return apiDelete<void>('/chatbot/history/' + recordId);
  },
};
