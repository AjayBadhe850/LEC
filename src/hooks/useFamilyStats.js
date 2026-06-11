import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Real-time Family Statistics Hook
 * Provides live family count with automatic updates on CRUD operations
 * Supports: create, update, delete, approve, restore
 */
export const useFamilyStats = () => {
  const [familyCount, setFamilyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const listenerRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  // Fetch current family count from backend
  const fetchFamilyCount = useCallback(async () => {
    try {
      const res = await fetch('/api/families/count');
      const data = await res.json();
      
      if (data.success) {
        setFamilyCount(data.count);
        setError(null);
        lastUpdateRef.current = Date.now();
      } else {
        setError(data.message || 'Failed to fetch family count');
      }
    } catch (err) {
      console.error('Error fetching family count:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize listener on mount
  useEffect(() => {
    fetchFamilyCount();

    // Set up polling for real-time updates
    // Polls every 2 seconds to ensure counts stay synchronized
    pollingIntervalRef.current = setInterval(() => {
      fetchFamilyCount();
    }, 2000);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchFamilyCount]);

  // Trigger refresh when family operations occur
  const refreshCount = useCallback(() => {
    // Add slight delay to ensure backend has processed the operation
    setTimeout(() => {
      fetchFamilyCount();
    }, 300);
  }, [fetchFamilyCount]);

  // Immediate refresh for time-critical updates
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
