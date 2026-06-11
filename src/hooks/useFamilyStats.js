import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Real-time Family Statistics Hook
 */
export const useFamilyStats = () => {
  const [familyCount, setFamilyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pollingIntervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  const fetchFamilyCount = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.log('Supabase Error:', error);
        throw error;
      }

      console.log('Profiles data:', data);

      setFamilyCount(data?.length || 0);
      setError(null);
      lastUpdateRef.current = Date.now();
    } catch (err) {
      console.error('Error fetching family count:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamilyCount();

    pollingIntervalRef.current = setInterval(() => {
      fetchFamilyCount();
    }, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchFamilyCount]);

  const refreshCount = useCallback(() => {
    setTimeout(() => {
      fetchFamilyCount();
    }, 300);
  }, [fetchFamilyCount]);

  const forceRefresh = useCallback(() => {
    fetchFamilyCount();
  }, [fetchFamilyCount]);

  return {
    familyCount,
    loading,
    error,
    refreshCount,
    forceRefresh,
    lastUpdate: lastUpdateRef.current
  };
};