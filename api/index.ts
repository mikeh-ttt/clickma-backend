import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import oauthRoutes from '@/routes/oauth';

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

// Main endpoint
app.get('/', (c) => {
  return c.json({ message: 'Clickma endpoint is running' });
});

// Use the oauth routes
app.route('/oauth', oauthRoutes);

export default handle(app);
