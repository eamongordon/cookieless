"use client";

import { usePathname } from 'next/navigation';
import React, { createContext, useContext, useEffect } from 'react';
import { sendAnalyticsData } from '@repo/core';

interface AnalyticsContextType {
    siteId: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const Analytics: React.FC<{ siteId: string; children: React.ReactNode }> = ({ siteId, children }) => {
    const pathname = usePathname();
    useEffect(() => {
        sendAnalyticsData({
            siteId: siteId,
            type: "pageview",
            url: pathname,
            timestamp: new Date().toISOString(),
            useragent: window.navigator.userAgent
        });
    }, [pathname]);

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