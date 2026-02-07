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
  name: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  user?: {
    _id: string;
    email: string;
    name: string;
    role?: string;
  };
}

export interface UserProfile {
  _id: string;
  email: string;
  name: string;
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
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
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
}

export const authService = new AuthService();
