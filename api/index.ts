import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { handle } from 'hono/vercel';
import clickupRouter from '../routes/clickup';
import oauthRoutes from '../routes/oauth';
export const config = {
  runtime: 'edge',
};

const RATE_LIMIT_KEY = process.env.RATE_LIMIT_KEY || 'rate_limit_key';

const app = new Hono().basePath('/api');

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => RATE_LIMIT_KEY,
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

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
