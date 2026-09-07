import { getBaseURL } from '@/services/api/config';

const API_BASE_URL = getBaseURL();

function getToken(): string | null {
  return localStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('authToken');
}

export type LogType = 'info' | 'warning' | 'error' | 'success';
export type LogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'OTHER';

export interface Log {
  _id: string;
  id?: string;
  type: LogType;
  action: LogAction;
  message: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  userId?: string;
  userName?: string;
  userEmail?: string;
  ipAddress?: string;
  requestBody?: Record<string, any>;
  responseData?: Record<string, any>;
  duration?: number;
  userAgent?: string;
  timestamp: string;
  createdAt?: string;
}

export interface LogsResponse {
  logs: Log[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LogFilters {
  type?: LogType;
  action?: LogAction;
  startDate?: string;
  endDate?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
}

export interface LogStats {
  totalLogs: number;
  byType: Record<string, number>;
  byAction: Record<string, number>;
  recentErrors: Log[];
}

export const logsApi = {
  async getAllLogs(page = 1, limit = 50, filters?: LogFilters): Promise<LogsResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters) {
        if (filters.type) params.append('type', filters.type);
        if (filters.action) params.append('action', filters.action);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.userId) params.append('userId', filters.userId);
        if (filters.endpoint) params.append('endpoint', filters.endpoint);
        if (filters.method) params.append('method', filters.method);
      }

      const response = await fetch(`${API_BASE_URL}/logs?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        console.warn(`Logs endpoint returned ${response.status}: ${response.statusText}`);
        return { logs: [], total: 0, page: 1, totalPages: 0 };
      }

      const data = await response.json();
      
      // Map _id to id for consistency
      if (data.logs && Array.isArray(data.logs)) {
        data.logs = data.logs.map((log: Log) => ({
          ...log,
          id: log._id || log.id,
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      return { logs: [], total: 0, page: 1, totalPages: 0 };
    }
  },

  async getLogStats(): Promise<LogStats | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/logs/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        console.warn(`Logs stats endpoint returned ${response.status}: ${response.statusText}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching log stats:', error);
      return null;
    }
  },

  async getLogById(id: string): Promise<Log | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/logs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        console.warn(`Log endpoint returned ${response.status}: ${response.statusText}`);
        return null;
      }

      const log = await response.json();
      return { ...log, id: log._id || log.id };
    } catch (error) {
      console.error('Error fetching log:', error);
      return null;
    }
  },

  async cleanupOldLogs(days = 30): Promise<{ deletedCount: number } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/logs/cleanup?days=${days}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        console.warn(`Logs cleanup endpoint returned ${response.status}: ${response.statusText}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      return null;
    }
  },

  async purgeAllLogs(): Promise<{ deletedCount: number } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/logs/purge-all`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        console.warn(`Logs purge-all endpoint returned ${response.status}: ${response.statusText}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error purging all logs:', error);
      return null;
    }
  },
};

