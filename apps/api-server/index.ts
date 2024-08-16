import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';

const app = new Koa();
const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = 'Hello, Analytics SaaS!';
});

router.post('/collect', async (ctx) => {
  const data = ctx.request.body;
  console.log('Received analytics data:', data);
  ctx.status = 200;
});

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});