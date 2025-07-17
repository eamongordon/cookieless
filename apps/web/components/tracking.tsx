"use client";

import { useEffect } from 'react';

const TrackingLoader = () => {
  useEffect(() => {
    // For CommonJS modules, we can try require
    try {
      require('@repo/tracking');
    } catch (error) {
      console.warn('Failed to load tracking script:', error);
    }
  }, []);

  return null; // This component does not render anything
};

export default TrackingLoader;