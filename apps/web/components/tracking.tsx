"use client";

import { useEffect } from 'react';

const TrackingLoader = () => {
  useEffect(() => {
    // Load the script only on the client side
    import('@repo/tracking');
  }, []);

  return null; // This component does not render anything
};

export default TrackingLoader;