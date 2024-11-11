import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { handle } from 'hono/vercel';
import clickupRouter from '../routes/clickup';
import oauthRoutes from '../routes/oauth';
export const config = {
  runtime: 'edge',
};

const app = new Hono().basePath('/api');

// CORS middleware
app.use(
  '/*',
  cors({
    origin: '*',
    allowHeaders: ['Origin', 'Content-Type', 'Authorization', '*'],
    allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
  })
);

app.use(logger());
// Main endpoint
app.get('/', (c) => {
  return c.json({ message: 'Clickma endpoint is running' });
});

// Use the oauth routes
app.route('/oauth', oauthRoutes);
app.route('/clickup', clickupRouter);

export default handle(app);
