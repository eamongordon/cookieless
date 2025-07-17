import type { eventData } from "@repo/database";

const apiUrl = 'https://cookieless-api-server-production.up.railway.app/collect';

export function sendAnalyticsData(data: eventData) {
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}