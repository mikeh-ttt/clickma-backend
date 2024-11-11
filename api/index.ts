import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import oauthRoutes from '../routes/oauth';
import clickupRouter from '../routes/clickup';
import { logger } from 'hono/logger';
export const config = {
  runtime: 'edge',
};

const app = new Hono().basePath('/api');

export const SECRET_KEY = process.env.SECRET_KEY || 'encrypt_secret_key';

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
