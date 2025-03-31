"use client";

import { usePathname } from 'next/navigation';
import React, { createContext, useContext, useEffect } from 'react';
import { sendAnalyticsData } from '@repo/core';
import { type EventData } from '@repo/database';

interface AnalyticsContextType {
    siteId: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

const apiUrl = 'http://localhost:3001/collect';

export const Analytics: React.FC<{ siteId: string; children: React.ReactNode }> = ({ siteId, children }) => {
    const pathname = usePathname();

    let event: EventData | undefined = undefined;

    useEffect(() => {
        console.log('Analytics component mounted');
        // Send initial pageview data
        sendAnalyticsData({
            siteId: siteId,
            type: "pageview",
            path: pathname,
            timestamp: new Date().toISOString(),
            useragent: window.navigator.userAgent
        }).then((data) => {
            event = data;
            console.log('Pageview data sent successfully:', data);
        }).catch((error) => {
            console.error('Error sending pageview data:', error);
        });

        // Handle sending data when the user leaves the page
        const handleVisibilityChange = () => {
            console.log('Visibility changed:', document.visibilityState);
            if (document.visibilityState === "hidden") {
                console.log('Sending pageleave data to server...');
                //sendAnalyticsData(data);
                navigator.sendBeacon(apiUrl, JSON.stringify(event)); // Ensure event is serialized
                //event = undefined; // Clear event after sending
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup event listener on unmount
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [pathname, siteId]);

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