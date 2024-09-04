import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import cors from '@koa/cors';
import { type eventData, insertEvent } from '@repo/database';

dotenv.config();

const app = new Koa();
const router = new Router();

// Use the CORS middleware globally
app.use(cors());

router.get('/', async (ctx) => {
  ctx.body = 'Hello, Analytics SaaS!';
});

router.post('/collect', async (ctx) => {
  try {
    const data = ctx.request.body as eventData;
    const eventWithIp = {
      ...data,
      ip: ctx.request.ip,
    };
    await insertEvent(eventWithIp);
    console.log('Received analytics data:', data);
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