import { useAnalytics } from '../AnalyticsContext';

export const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
  const { siteId } = useAnalytics();

  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, eventName, properties }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};