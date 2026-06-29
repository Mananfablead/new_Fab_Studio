import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

// -------------------------------------------------------------
// 🔧 GLOBAL MAINTENANCE OVERRIDE
// Change this to `true` to force the Maintenance Page to show.
// Change this to `false` to rely on the actual `/is-live` API.
// -------------------------------------------------------------
const FORCE_MAINTENANCE_MODE = false;
const FORCE_MAINTENANCE_MESSAGE = "App is currently undergoing maintenance.";

interface MaintenanceResponse {
  success: boolean;
  is_live: boolean;
  message?: string;
  timestamp?: string;
}

export function useMaintenance() {
  const [isLive, setIsLive] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setError(false);

    // Check manual override first
    if (FORCE_MAINTENANCE_MODE) {
      setTimeout(() => {
        setIsLive(false);
        setMessage(FORCE_MAINTENANCE_MESSAGE);
        setLoading(false);
      }, 500); // Small delay for the loading animation
      return;
    }

    try {
      const response = await api.get<MaintenanceResponse>('/is-live');
      const data = response.data;

      // If the API explicitly returns is_live: false, block the app
      if (data && typeof data.is_live === 'boolean' && data.is_live === false) {
        setIsLive(false);
        setMessage(data.message || 'App is currently undergoing maintenance.');
      } else {
        setIsLive(true);
      }
    } catch (err) {
      console.error('Failed to check maintenance status:', err);
      // On network error or 404, we assume the app is live to prevent accidentally locking out users 
      // if the endpoint is down or not deployed yet.
      setIsLive(true);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return { isLive, message, loading, error, checkStatus };
}
