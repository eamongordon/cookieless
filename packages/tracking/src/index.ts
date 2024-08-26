(function() {
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

  function collectPageView() {
    console.log('Collecting page view...');
    const data = {
      type: 'pageview',
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    sendAnalyticsData(data);
  }
  sendAnalyticsData({ type: 'pageview', url: window.location.href, timestamp: new Date().toISOString() });
  window.addEventListener('load', collectPageView);
})();