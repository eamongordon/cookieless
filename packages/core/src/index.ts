import type { eventData } from "@repo/database";

const apiUrl = 'http://localhost:3001/collect';

export function sendAnalyticsData(data: eventData) {
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}