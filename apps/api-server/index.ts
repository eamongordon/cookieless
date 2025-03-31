import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import cors from '@koa/cors';
import { type EventData, insertEvent, updateEventLeftTimestamp } from '@repo/database';
import * as geoip from 'fast-geoip';
import UAParser from 'ua-parser-js';

dotenv.config();

const app = new Koa();
const router = new Router();

// Use the CORS middleware globally
app.use(cors());

router.get('/', async (ctx) => {
  ctx.body = 'Waaasuup';
});

router.post('/collect', async (ctx) => {
  try {
    console.log('responseBody', ctx.request.body);
    const data = ctx.request.body as EventData;
    const ip = ctx.request.ip;
    const geo = await geoip.lookup(ip !== "::1" ? ip : '104.28.85.126');
    const userAgentString = ctx.request.headers['user-agent'];
    const referrer = ctx.request.headers['referer'];
    const parser = new UAParser(userAgentString);
    const parsedBrowser = parser.getBrowser();
    const parsedOS = parser.getOS();
    const parsedDevice = parser.getDevice();
    const modifiedDevice = parsedDevice.type === undefined ? 'Desktop' : parsedDevice.type.charAt(0).toUpperCase() + parsedDevice.type.slice(1);
    const eventWithIp = {
      ...data,
      country: geo?.country,
      region: geo?.country && geo.city ? `${geo?.country}-${geo?.region}` : undefined,
      city: geo?.city,
      os: parsedOS.name,
      browser: parsedBrowser.name,
      size: modifiedDevice,
      referrer: referrer,
      referrer_hostname: referrer ? new URL(referrer).hostname : undefined,
      ip
    } satisfies EventData<"withIp">;
    console.log("eventWithIp", eventWithIp);
    let res;
    console.log("TIMESTAMP", data);
    if (data.left_timestamp) {
      console.log("HANDLING LEFT TIMESTAMP");
      res = await updateEventLeftTimestamp(eventWithIp);
    } else {
      res = await insertEvent(eventWithIp);
    }
    console.log('Received analytics data:', data);
    console.log("APISERVERRES", res);
    ctx.body = res;
    ctx.status = 200;
  } catch (error) {
    console.error('Error processing /collect request:', error);
    ctx.status = 500;
    ctx.body = 'Internal Server Error';
  }
});

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});