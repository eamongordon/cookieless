import { useCallback } from 'react';
import { useAnalytics } from '../AnalyticsContext';

export const useTrackEvent = () => {
  const { siteId } = useAnalytics();

  const trackEvent = useCallback(async (eventName: string, properties?: Record<string, any>) => {
    const baseUrl = "http://localhost:3001";
    try {
      await fetch(`${baseUrl}/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, eventName, properties }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [siteId]);

  return trackEvent;
};