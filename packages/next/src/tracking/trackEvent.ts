import { useCallback } from 'react';
import { useAnalytics } from '../AnalyticsContext';
import { sendAnalyticsData } from '@repo/core';

export const useTrackEvent = () => {
    const { siteId } = useAnalytics();

    const trackEvent = useCallback(async (eventName: string, properties?: Record<string, any>) => {
        try {
            await sendAnalyticsData({
                siteId: siteId,
                type: "event",
                name: eventName,
                path: window.location.pathname,
                timestamp: new Date().toISOString(),
                useragent: window.navigator.userAgent
            })
        } catch (error) {
            console.error('Failed to track event:', error);
            throw error;
        }
    }, [siteId]);

    return trackEvent;
};