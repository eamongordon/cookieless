const apiUrl = 'http://localhost:3001/collect';

export function sendAnalyticsData(data: eventData) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export type eventData = {
    type: string;
    url: string;
    timestamp: string;
    useragent: string;
}