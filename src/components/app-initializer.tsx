"use client";

import { useEffect } from 'react';
import { useReferenceStore } from '@/stores/referenceStore';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { loadReferenceData, isLoaded: referenceLoaded } = useReferenceStore();

  useEffect(() => {
    // Load reference data (public, no auth needed)
    if (!referenceLoaded) {
      loadReferenceData().catch(error => {
        console.error('Failed to load reference data:', error);
      });
    }
  }, [referenceLoaded, loadReferenceData]);

  return <>{children}</>;
}
