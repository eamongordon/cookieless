import { GetServerSidePropsContext } from 'next';

export const trackServerEvent = async (
  context: GetServerSidePropsContext,
  eventName: string,
  properties?: Record<string, any>
) => {
  const siteId = context.req.headers['x-site-id'] as string;
  if (!siteId) {
    console.error('Site ID not found in request headers');
    return;
  }

  try {
    // Implement your server-side tracking logic here
    console.log(`Tracking event: ${eventName} for site ${siteId}`, properties);

    // You can make an API call to your analytics service here
    // await fetch('your-analytics-api-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ siteId, eventName, properties }),
    // });

  } catch (error) {
    console.error('Failed to track server event:', error);
  }
};