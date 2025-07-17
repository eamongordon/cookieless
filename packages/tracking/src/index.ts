(function () {
  const apiUrl = 'https://cookieless-api-server-production.up.railway.app/collect';

  // Get the site ID from the script tag's data-site-id attribute
  function getSiteId() {
    console.log('Cookieless Analytics: Looking for script tags with data-site-id...');
    const scripts = document.querySelectorAll('script[data-site-id]');
    console.log('Cookieless Analytics: Found scripts with data-site-id:', scripts.length);
    
    for (let script of scripts) {
      const scriptEl = script as HTMLScriptElement;
      const siteId = scriptEl.getAttribute('data-site-id');
      console.log('Cookieless Analytics: Script src:', scriptEl.src);
      console.log('Cookieless Analytics: Found siteId:', siteId);
      if (siteId) {
        return siteId;
      }
    }
    
    // Debug: Let's also check all script tags
    const allScripts = document.querySelectorAll('script');
    console.log('Cookieless Analytics: Total script tags found:', allScripts.length);
    allScripts.forEach((script, index) => {
      const scriptEl = script as HTMLScriptElement;
      console.log(`Script ${index}:`, {
        src: scriptEl.src,
        'data-site-id': scriptEl.getAttribute('data-site-id'),
        innerHTML: scriptEl.innerHTML.substring(0, 50) + '...'
      });
    });
    
    console.warn('Cookieless Analytics: No data-site-id found in script tag');
    return null;
  }

  const siteId = getSiteId();
  console.log('Cookieless Analytics: Final siteId:', siteId);

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
      path: window.location.href,
      timestamp: new Date().toISOString()
    };
    sendAnalyticsData(data);
  }

  sendAnalyticsData({ type: 'pageview', path: window.location.href, timestamp: new Date().toISOString() });
  window.addEventListener('load', collectPageView);
})();