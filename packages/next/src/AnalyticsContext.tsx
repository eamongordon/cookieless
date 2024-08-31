import React, { createContext, useContext, useEffect } from 'react';

interface AnalyticsContextType {
  siteId: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const AnalyticsProvider: React.FC<{ siteId: string; children: React.ReactNode }> = ({ siteId, children }) => {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId, path: window.location.pathname }),
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [siteId]);

  return (
    <AnalyticsContext.Provider value={{ siteId }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};