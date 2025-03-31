import type { EventData } from "@repo/database";

const apiUrl = 'http://localhost:3001/collect';

export async function sendAnalyticsData(data: EventData) {
    console.log('Sending analytics data:', data);
    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        throw new Error(`Failed to send analytics data: ${res.statusText}`);
    }
    const responseData = await res.json();
    if (!responseData || !responseData.length) {
        throw new Error('No response data received');
    }
    console.log('Response_DATA:', responseData);
    console.log('Analytics data sent successfully:', responseData);
    return responseData[0] as EventData;
}