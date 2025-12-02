"use client";

import { useEffect, useRef } from 'react';
import { useReferenceStore } from '@/stores/referenceStore';

interface AppInitializerProps {
  children: React.ReactNode;
}

// Global flag to prevent multiple initializations across all instances
let globalInitialized = false;
let globalLoading = false;

export function AppInitializer({ children }: AppInitializerProps) {
  const loadReferenceData = useReferenceStore((state) => state.loadReferenceData);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Check both local and global flags
    if (hasInitialized.current || globalInitialized || globalLoading) {
      return;
    }

    // Mark as loading to prevent other instances
    hasInitialized.current = true;
    globalLoading = true;
    
    console.log('AppInitializer: Loading reference data...');
    
    loadReferenceData()
      .then(() => {
        console.log('AppInitializer: Reference data loaded successfully');
        globalInitialized = true;
      })
      .catch(error => {
        console.error('Failed to load reference data:', error);
        // Reset flags on error to allow retry
        hasInitialized.current = false;
        globalInitialized = false;
      })
      .finally(() => {
        globalLoading = false;
      });
  }, [loadReferenceData]);

  return <>{children}</>;
}
