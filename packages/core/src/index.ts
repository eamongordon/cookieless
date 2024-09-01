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

export type eventData = {
    siteId: string;
    type: string;
    url: string;
    name?: string;
    timestamp: string;
    useragent: string;
}