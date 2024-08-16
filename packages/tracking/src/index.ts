(function() {
  const apiUrl = 'http://localhost:3000/collect';

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
    const data = {
      type: 'pageview',
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    sendAnalyticsData(data);
  }

  window.addEventListener('load', collectPageView);
})();