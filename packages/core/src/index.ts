const apiUrl = 'http://localhost:3001/collect';

function sendAnalyticsData(data: any) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export function trackPageView() {
    const data = {
        type: 'pageview',
        url: window.location.href,
        timestamp: new Date().toISOString()
    };
    sendAnalyticsData(data);
}

export function trackEvent() {
    const data = {
        type: 'pageview',
        url: window.location.href,
        timestamp: new Date().toISOString()
    };
    sendAnalyticsData(data);
}
