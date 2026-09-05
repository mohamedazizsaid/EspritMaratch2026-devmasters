/**
 * API Configuration
 * Centralized configuration for all API calls
 */

// Get base URL from environment variable (VITE_API_URL)
// En dev : http://localhost:3000/api (défini dans .env.development)
// En prod : URL définie dans les variables Vercel
export const getBaseURL = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  // Fallback pour le développement local uniquement
  return 'http://localhost:3000/api';
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VALIDATE_RESET_CODE: '/auth/validate-reset-code',
    TWO_FACTOR_GENERATE: '/auth/2fa/generate',
    TWO_FACTOR_ENABLE: '/auth/2fa/enable',
    TWO_FACTOR_VERIFY: '/auth/2fa/verify',
    TWO_FACTOR_DISABLE: '/auth/2fa/disable',
    TWO_FACTOR_STATUS: '/auth/2fa/status',
  },
  // Eleves endpoints
  ELEVES: {
    LIST: '/eleves',
    CREATE: '/eleves',
    GET: (id: string) => `/eleves/${id}`,
    UPDATE: (id: string) => `/eleves/${id}`,
    DELETE: (id: string) => `/eleves/${id}`,
  },
  // Formation endpoints
  FORMATION: {
    LIST: '/formation',
    CREATE: '/formation',
    GET: (id: string) => `/formation/${id}`,
    UPDATE: (id: string) => `/formation/${id}`,
    DELETE: (id: string) => `/formation/${id}`,
    BY_FORMATEUR: (id_formateur: string) => `/formation/formateur/${id_formateur}`,
    UPDATE_NIVEAU: (niveauId: string) => `/formation/niveau/${niveauId}`,
    UPDATE_SEANCE: (seanceId: string) => `/formation/seance/${seanceId}`,
    VALIDATE_SEANCE: (seanceId: string) => `/formation/seance/${seanceId}/validate`,
    CHECK_ADVANCEMENT: (formationId: string) => `/formation/${formationId}/check-advancement`,
    STUDENTS_BY_SEANCE: (seanceId: string) => `/formation/seance/${seanceId}/students`,
    SEANCES_BY_FORMATEUR: (id_formateur: string) => `/formation/formateur/${id_formateur}/seances`,
  },
  // Inscription endpoints
  INSCRIPTION: {
    LIST: '/inscription',
    CREATE: '/inscription',
    GET: (id: string) => `/inscription/${id}`,
    UPDATE: (id: string) => `/inscription/${id}`,
    DELETE: (id: string) => `/inscription/${id}`,
  },
  // Presence endpoints
  PRESENCE: {
    CREATE: '/presence',
    BY_SEANCE: (seanceId: string) => `/presence/seance/${seanceId}`,
    UPDATE: (id: string) => `/presence/${id}`,
    DELETE: (id: string) => `/presence/${id}`,
  },
  // Certification endpoints
  CERTIFICATION: {
    LIST: '/certification',
    CREATE: '/certification',
    GET: (id: string) => `/certification/${id}`,
    DOWNLOAD: (id: string) => `/certification/download/${id}`,
  },
  // Chatbot endpoints
  CHATBOT: {
    ASK: '/chatbot/ask',
    ANALYZE_IMAGE: '/chatbot/analyze-image',
    UPLOAD_ANALYZE: '/chatbot/upload-and-analyze',
    HISTORY: '/chatbot/history',
    FORMATION_HISTORY: (formationId: string) => `/chatbot/history/${formationId}`,
    DELETE_RECORD: (recordId: string) => `/chatbot/history/${recordId}`,
  },
};

/**
 * Helper function to get full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Helper function to get JWT token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

/**
 * Helper function to set JWT token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

/**
 * Helper function to clear JWT token
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
};

/**
 * Default headers configuration
 */
export const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Default headers for file upload
 */
export const getFileUploadHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
