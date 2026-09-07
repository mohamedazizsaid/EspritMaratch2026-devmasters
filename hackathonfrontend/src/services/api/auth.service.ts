/**
 * Auth Service
 * Handles authentication-related API calls
 */

import { API_CONFIG, getHeaders, setAuthToken, clearAuthToken, getApiUrl } from './config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom?: string;
  prenom?: string;
  name?: string;
  role?: string;
}

export interface AuthResponse {
  access_token?: string;
  user?: {
    _id: string;
    email: string;
    name?: string;
    role?: string;
    nom?: string;
    prenom?: string;
    onBoarding?: boolean;
    twoFactorEnabled?: boolean;
  };
  requiresTwoFactor?: boolean;
  tempUserId?: string;
}

export interface UserProfile {
  _id: string;
  email: string;
  name?: string;
  nom?: string;
  prenom?: string;
  role?: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const url = getApiUrl(API_CONFIG.AUTH.REGISTER);
      console.log('[AuthService] Register attempt to:', url);

      // Assurer la conformité avec le backend (nom, prenom requis)
      let nom = data.nom || '';
      let prenom = data.prenom || '';

      if ((!nom || !prenom) && data.name) {
        const parts = data.name.trim().split(' ');
        prenom = parts[0] || 'Prénom';
        nom = parts.slice(1).join(' ') || 'Nom';
      }

      const payload = {
        nom: nom || 'Nom',
        prenom: prenom || 'Prénom',
        email: data.email,
        password: data.password,
        role: data.role || 'Formateurs',
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Registration failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('[AuthService] Error response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          console.error('[AuthService] Error text:', text);
        }
        throw new Error(errorMessage);
      }

      const result: AuthResponse = await response.json();
      if (result.access_token) {
        setAuthToken(result.access_token);
      }
      return result;
    } catch (error) {
      console.error('[AuthService] Register error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const url = getApiUrl(API_CONFIG.AUTH.LOGIN);
      console.log('[AuthService] Login attempt to:', url);
      console.log('[AuthService] Payload:', data);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `Login failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('[AuthService] Error response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          console.error('[AuthService] Error text:', text);
        }
        throw new Error(errorMessage);
      }

      const result: AuthResponse = await response.json();
      if (result.access_token) {
        setAuthToken(result.access_token);
      }
      return result;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch(getApiUrl(API_CONFIG.AUTH.LOGOUT), {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      clearAuthToken();
    }
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<UserProfile> {
    const response = await fetch(getApiUrl(API_CONFIG.AUTH.ME), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken') || !!sessionStorage.getItem('authToken');
  }

  /**
   * Request password reset (send code to email)
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const url = getApiUrl(API_CONFIG.AUTH.FORGOT_PASSWORD);
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let errorMessage = `Password reset request failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('[AuthService] Error parsing response:', e);
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error('[AuthService] Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Validate reset code and change password
   */
  async validateResetCode(email: string, resetCode: string, newPassword: string): Promise<{ message: string }> {
    try {
      const url = getApiUrl(API_CONFIG.AUTH.VALIDATE_RESET_CODE);
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, resetCode, newPassword }),
      });

      if (!response.ok) {
        let errorMessage = `Reset code validation failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('[AuthService] Error parsing response:', e);
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error('[AuthService] Reset code validation error:', error);
      throw error;
    }
  }

  // ==================== 2FA Methods ====================

  /**
   * Generate 2FA secret and QR code
   */
  async generateTwoFactor(): Promise<{ secret: string; qrCodeDataUrl: string; otpauthUrl: string }> {
    const url = getApiUrl(API_CONFIG.AUTH.TWO_FACTOR_GENERATE);
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Échec de la génération du code 2FA');
    }

    return response.json();
  }

  /**
   * Enable 2FA after verifying the code
   */
  async enableTwoFactor(code: string): Promise<{ message: string }> {
    const url = getApiUrl(API_CONFIG.AUTH.TWO_FACTOR_ENABLE);
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Code 2FA invalide');
    }

    return response.json();
  }

  /**
   * Verify 2FA code during login
   */
  async verifyTwoFactor(userId: string, code: string): Promise<AuthResponse> {
    const url = getApiUrl(API_CONFIG.AUTH.TWO_FACTOR_VERIFY);
    console.log('[AuthService] 2FA Verify request:', { userId, code, url });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, code }),
    });

    console.log('[AuthService] 2FA Verify response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[AuthService] 2FA Verify error response:', errorData);
      throw new Error(errorData.message || 'Code 2FA invalide ou expiré');
    }

    const result: AuthResponse = await response.json();
    console.log('[AuthService] 2FA Verify success:', { 
      hasToken: !!result.access_token,
      userEmail: result.user?.email
    });
    
    if (result.access_token) {
      setAuthToken(result.access_token);
    }
    return result;
  }

  /**
   * Disable 2FA
   */
  async disableTwoFactor(code: string): Promise<{ message: string }> {
    const url = getApiUrl(API_CONFIG.AUTH.TWO_FACTOR_DISABLE);
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Code 2FA invalide');
    }

    return response.json();
  }

  /**
   * Get 2FA status
   */
  async getTwoFactorStatus(): Promise<{ enabled: boolean }> {
    const url = getApiUrl(API_CONFIG.AUTH.TWO_FACTOR_STATUS);
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Échec de la récupération du statut 2FA');
    }

    return response.json();
  }
}

export const authService = new AuthService();
