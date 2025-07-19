(function () {
  const apiUrl = 'https://cookieless-api-server-production.up.railway.app/collect';

  // Get the site ID from the script tag's data-site-id attribute
  function getSiteId() {
    const scripts = document.querySelectorAll('script[data-site-id]');
    for (let script of scripts) {
      const siteId = script.getAttribute('data-site-id');
      if (siteId) {
        return siteId;
      }
    }
    console.warn('Cookieless Analytics: No data-site-id found in script tag');
    return null;
  }

  const siteId = getSiteId();

  function sendAnalyticsData(data: any) {
    if (!siteId) {
      console.warn('Cookieless Analytics: Cannot send data without site ID');
      return;
    }

    const payload = {
      ...data,
      siteId: siteId
    };

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  function collectPageView() {
    console.log('Collecting page view...');
    const data = {
      type: 'pageview',
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    };
    sendAnalyticsData(data);
  }

  sendAnalyticsData({ type: 'pageview', path: window.location.pathname, timestamp: new Date().toISOString() });
  window.addEventListener('load', collectPageView);

  // Expose global tracking function for custom events
  (window as any).cookieless = {
    track: function(eventName: string, properties?: Record<string, any>) {
      const data = {
        type: 'event',
        name: eventName,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        custom_properties: properties || {}
      };
      sendAnalyticsData(data);
    },
    
    trackPageView: function() {
      collectPageView();
    }
  };
})();