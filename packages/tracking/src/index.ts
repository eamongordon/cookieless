(function () {
  const apiUrl = 'https://cookieless-api-server-production.up.railway.app/collect';

  // Get the site ID and custom properties from the script tag
  function getScriptConfig() {
    const scripts = document.querySelectorAll('script[data-site-id]');
    for (let script of scripts) {
      const siteId = script.getAttribute('data-site-id');
      if (siteId) {
        // Extract custom properties from data attributes
        const customProperties: Record<string, any> = {};
        
        // Get all data-custom-* attributes
        for (let i = 0; i < script.attributes.length; i++) {
          const attr = script.attributes[i];
          if (attr && attr.name.startsWith('data-custom-')) {
            // Convert data-custom-property-name to property_name
            const propName = attr.name.substring(12).replace(/-/g, '_');
            customProperties[propName] = attr.value;
          }
        }

        return { siteId, customProperties };
      }
    }
    console.warn('Cookieless Analytics: No data-site-id found in script tag');
    return { siteId: null, customProperties: {} };
  }

  const { siteId, customProperties: scriptProperties } = getScriptConfig();

  function sendAnalyticsData(data: any) {
    if (!siteId) {
      console.warn('Cookieless Analytics: Cannot send data without site ID');
      return;
    }

    // Merge script properties, global properties, and event properties
    const globalProperties = (window as any).cookielessGlobalProperties || {};
    const mergedCustomProperties = {
      ...scriptProperties,
      ...globalProperties,
      ...(data.custom_properties || {})
    };

    const payload = {
      ...data,
      siteId: siteId,
      custom_properties: mergedCustomProperties
    };

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  function collectPageView(customProperties?: Record<string, any>) {
    console.log('Collecting page view...');
    const data = {
      type: 'pageview',
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
      custom_properties: customProperties || {}
    };
    sendAnalyticsData(data);
  }

  // Automatically track pageview when script loads
  if (document.readyState === 'loading') {
    // If DOM is still loading, wait for it to be ready
    document.addEventListener('DOMContentLoaded', () => collectPageView());
  } else {
    // DOM is already ready, track immediately
    collectPageView();
  }

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
    
    trackPageView: function(properties?: Record<string, any>) {
      collectPageView(properties);
    },

    // Set global custom properties that will be added to all future events
    setCustomProperties: function(properties: Record<string, any>) {
      (window as any).cookielessGlobalProperties = properties;
    }
  };
})();