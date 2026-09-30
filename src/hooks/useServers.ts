import { useState, useCallback, useEffect } from 'react';
import { ServerApi } from '../services/api';
import { Server } from '../types';
import { useAuthContext } from '../contexts/AuthContext';

export const useServers = () => {
  const { session, isAuthenticated } = useAuthContext();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    if (!isAuthenticated || !session) return;

    try {
      setLoading(true);
      setError(null);

      const response = await ServerApi.getAll(session.token);
      
      if (response.success && response.data) {
        setServers(response.data);
      } else {
        setError(response.error || 'Failed to fetch servers');
      }
    } catch (err) {
      setError('Failed to fetch servers');
      console.error('Error fetching servers:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, session]);

  const joinServer = useCallback(async (serverId: string) => {
    if (!isAuthenticated || !session) {
      setError('Please sign in first');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await ServerApi.join(serverId, session.user, session.token);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to join server');
        return null;
      }
    } catch (err) {
      setError('Failed to join server');
      console.error('Error joining server:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, session]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServers();
    }
  }, [isAuthenticated, fetchServers]);

  return {
    servers,
    loading,
    error,
    fetchServers,
    joinServer,
  };
};

export default useServers;
