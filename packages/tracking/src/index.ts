import { type EventData } from '@repo/database';

(function () {
  const apiUrl = 'http://localhost:3001/collect';

  // Retrieve the current script element
  const currentScript = document.currentScript as HTMLScriptElement;

  // Extract the siteId from the custom attribute
  const siteId = currentScript?.getAttribute('data-site-id');
  if (!siteId) {
    console.error('Error: site-id attribute is required for tracking.');
    return;
  }

  let event: EventData | undefined; // Ensure event can be undefined

  async function sendAnalyticsData(data: EventData): Promise<void> {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to send analytics data: ${response.statusText}`);
      }

      const responseData: EventData = await response.json();
      console.log('Analytics data sent successfully:', responseData);
    } catch (error) {
      console.error('Error sending analytics data:', error);
    }
  }

  function collectPageView() {
    console.log('Collecting page view...');

    const data: EventData = {
      type: 'pageview',
      path: window.location.href,
      timestamp: new Date().toISOString(),
      siteId: siteId!,
      useragent: window.navigator.userAgent,
    };
    sendAnalyticsData(data);
  }

  // Remove redundant call to sendAnalyticsData
  window.addEventListener('load', collectPageView);

  document.addEventListener("visibilitychange", function logData() {
    if (document.visibilityState === "hidden" && event) {
      console.log('Sending leftdata to server...');
      navigator.sendBeacon(apiUrl, JSON.stringify(event)); // Ensure event is serialized
      event = undefined;
    }
  });
})();