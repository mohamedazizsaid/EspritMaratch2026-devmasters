/**
 * Custom React Hooks for API Services
 * Simplify API service usage in React components
 */

import { useState, useEffect, useCallback } from 'react';
import {
  authService,
  elevesService,
  formationService,
  inscriptionService,
  presenceService,
  certificationService,
  chatbotService,
  type Eleve,
  type Formation,
  type Inscription,
  type Presence,
  type Certification,
  type UserProfile,
} from '../api';
import type { ChatbotResponse, ChatbotImageAnalysisResponse, ChatHistory } from '../../app/lib/types';

/**
 * Hook for authentication
 */
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await authService.login({ email, password });
        await fetchUser();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUser]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      fetchUser();
    }
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    fetchUser,
    isAuthenticated: authService.isAuthenticated(),
  };
}

/**
 * Hook for managing students list
 */
export function useEleves() {
  const [students, setStudents] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await elevesService.findAll();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (data: any, avatar?: File) => {
      setLoading(true);
      setError(null);
      try {
        const newStudent = await elevesService.create(data, avatar);
        setStudents([...students, newStudent]);
        return newStudent;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create student');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [students]
  );

  const update = useCallback(
    async (id: string, data: any, avatar?: File) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await elevesService.update(id, data, avatar);
        setStudents(students.map((s) => (s._id === id ? updated : s)));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update student');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [students]
  );

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await elevesService.remove(id);
        setStudents(students.filter((s) => s._id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete student');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [students]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { students, loading, error, fetchAll, create, update, remove };
}

/**
 * Hook for managing formations
 */
export function useFormations() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formationService.findAll();
      setFormations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch formations');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (data: any) => {
      setLoading(true);
      setError(null);
      try {
        const newFormation = await formationService.create(data);
        setFormations([...formations, newFormation]);
        return newFormation;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create formation');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [formations]
  );

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await formationService.remove(id);
        setFormations(formations.filter((f) => f._id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete formation');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [formations]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { formations, loading, error, fetchAll, create, remove };
}

/**
 * Hook for managing inscriptions
 */
export function useInscriptions() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inscriptionService.findAll();
      setInscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (eleveId: string, formationId: string) => {
      setLoading(true);
      setError(null);
      try {
        const newInscription = await inscriptionService.create({
          id_eleve: eleveId,
          id_formation: formationId,
        });
        setInscriptions([...inscriptions, newInscription]);
        return newInscription;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create inscription');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [inscriptions]
  );

  const updateStatus = useCallback(
    async (id: string, status: string, niveau?: string) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await inscriptionService.updateStatus(id, {
          statut_formation: status,
          niveau_actuel: niveau ? Number(niveau) : undefined,
        });
        setInscriptions(inscriptions.map((i) => (i._id === id ? updated : i)));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update inscription');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [inscriptions]
  );

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await inscriptionService.remove(id);
        setInscriptions(inscriptions.filter((i) => i._id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete inscription');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [inscriptions]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    inscriptions,
    loading,
    error,
    fetchAll,
    create,
    updateStatus,
    remove,
  };
}

/**
 * Hook for managing presence records
 */
export function usePresence() {
  const [presences, setPresences] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBySeance = useCallback(async (seanceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await presenceService.findBySeance(seanceId);
      setPresences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch presence');
    } finally {
      setLoading(false);
    }
  }, []);

  const markPresence = useCallback(
    async (eleveId: string, seanceId: string, statut: string, remarques?: string) => {
      setLoading(true);
      setError(null);
      try {
        const newPresence = await presenceService.markPresence({
          id_inscription: eleveId,
          id_seance: seanceId,
          present: statut === 'present',
          remarques,
        });
        setPresences([...presences, newPresence]);
        return newPresence;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to mark presence');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [presences]
  );

  const update = useCallback(
    async (id: string, statut?: string, remarques?: string) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await presenceService.update(id, { present: statut === 'present', remarques });
        setPresences(presences.map((p) => (p._id === id ? updated : p)));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update presence');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [presences]
  );

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await presenceService.remove(id);
        setPresences(presences.filter((p) => p._id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete presence');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [presences]
  );

  return {
    presences,
    loading,
    error,
    fetchBySeance,
    markPresence,
    update,
    remove,
  };
}

/**
 * Hook for managing certifications
 */
export function useCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await certificationService.findAll();
      setCertifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch certifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (inscriptionId: string) => {
      setLoading(true);
      setError(null);
      try {
        const newCert = await certificationService.create({ id_inscription: inscriptionId, delivre_par: '' });
        setCertifications([...certifications, newCert]);
        return newCert;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create certification');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [certifications]
  );

  const downloadPdf = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await certificationService.downloadPdfFile(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download certificate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    certifications,
    loading,
    error,
    fetchAll,
    create,
    downloadPdf,
  };
}

/**
 * Hook for chatbot interactions
 */
export function useChatbot() {
  const [messages, setMessages] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const history = await chatbotService.getHistory(limit);
      setMessages(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, []);

  const askQuestion = useCallback(
    async (message: string, context?: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await chatbotService.ask({ message, context });
        setMessages([...messages, response as unknown as ChatHistory]);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get AI response');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  const analyzeImage = useCallback(
    async (imageData: string, message: string, formationId?: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await chatbotService.analyzeImage({
          imageData,
          message,
          formationId,
        });
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze image');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const uploadAndAnalyzeImage = useCallback(
    async (file: File, message: string, formationId?: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await chatbotService.uploadAndAnalyze(
          file,
          message,
          formationId
        );
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze image');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteMessage = useCallback(
    async (recordId: string) => {
      setLoading(true);
      setError(null);
      try {
        await chatbotService.deleteChatRecord(recordId);
        setMessages(messages.filter((m) => m._id !== recordId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete message');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    messages,
    loading,
    error,
    loadHistory,
    askQuestion,
    analyzeImage,
    uploadAndAnalyzeImage,
    deleteMessage,
  };
}
