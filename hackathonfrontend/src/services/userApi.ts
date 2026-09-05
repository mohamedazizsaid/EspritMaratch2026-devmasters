import { getBaseURL } from '@/services/api/config';

const API_BASE_URL = getBaseURL();

export interface User {
  id: string;
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif?: boolean;
  date_creation?: string;
  createdAt?: string;
}

function getToken(): string | null {
  return localStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('authToken');
}

function mapUser(u: any): User {
  return {
    ...u,
    id: u._id || u.id,
  };
}

export const userApi = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map(mapUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async createUser(payload: { nom: string; prenom: string; email: string; mot_de_passe: string }): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          nom: payload.nom,
          prenom: payload.prenom,
          email: payload.email,
          password: payload.mot_de_passe,
          role: 'Formateurs',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create user: ${response.statusText}`);
      }

      const data = await response.json();
      return mapUser(data.user || data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(id: string, payload: { nom?: string; prenom?: string; email?: string; mot_de_passe?: string }): Promise<User> {
    try {
      const body: any = {};
      if (payload.nom) body.nom = payload.nom;
      if (payload.prenom) body.prenom = payload.prenom;
      if (payload.email) body.email = payload.email;
      if (payload.mot_de_passe) body.password = payload.mot_de_passe;

      const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update user: ${response.statusText}`);
      }

      const data = await response.json();
      return mapUser(data);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update role: ${response.statusText}`);
      }

      const data = await response.json();
      return mapUser(data);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete user: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};
