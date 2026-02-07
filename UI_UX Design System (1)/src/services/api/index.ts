/**
 * API Services Index
 * Central export point for all API services
 */

export { authService, type AuthResponse, type UserProfile, type LoginRequest, type RegisterRequest } from './auth.service';
export { elevesService, type Eleve, type CreateEleveRequest, type UpdateEleveRequest } from './eleves.service';
export { formationService, type Formation, type Niveau, type Seance, type CreateFormationRequest, type UpdateFormationRequest, type UpdateNiveauRequest, type UpdateSeanceRequest } from './formation.service';
export { inscriptionService, type Inscription, type CreateInscriptionRequest, type UpdateInscriptionRequest } from './inscription.service';
export { presenceService, type Presence, type MarkPresenceRequest, type UpdatePresenceRequest } from './presence.service';
export { certificationService, type Certification, type CreateCertificationRequest } from './certification.service';
export { chatbotService } from '../chatbot.service';
export { API_CONFIG, getApiUrl, getAuthToken, setAuthToken, clearAuthToken, getHeaders, getFileUploadHeaders } from './config';
