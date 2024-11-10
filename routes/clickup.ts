import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { StatusCode } from 'hono/utils/http-status';
const CLICKUP_BASE_API = 'https://api.clickup.com/api/v2';
type Env = {
  Variables: {
    clickUpToken: string;
  };
};
const clickupRouter = new Hono<Env>();

const authMiddleware = createMiddleware(async (c, next) => {
  const clickUpToken = c.req.header('Authorization');

  if (!clickUpToken) {
    return c.json({ error: 'Missing ClickUp authentication token' }, 401);
  }

  // Store the token in the environment for use in route handlers
  c.set('clickUpToken', clickUpToken);

  await next();
});

clickupRouter.use('/*', authMiddleware);

clickupRouter.get('/task/:workspaceId/:taskId', async (c) => {
  const taskId = c.req.param('taskId');
  const teamId = c.req.param('workspaceId');
  const customTaskIds = c.req.query('custom_task_ids') || 'false';
  const clickUpToken = c.get('clickUpToken');

  if (!teamId) {
    return c.json({ error: 'Missing workspaceId parameter' }, 400);
  }

  try {
    const response = await fetch(
      `${CLICKUP_BASE_API}/task/${taskId}?team_id=${teamId}&custom_task_ids=${customTaskIds}&include_markdown_description=true`,
      {
        headers: {
          Authorization: clickUpToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return c.json(errorData, response.status as StatusCode);
    }

    const data = await response.json();

    return c.json({ ...data });
  } catch (error) {
    console.error('Error proxying request to ClickUp:', error);
    return c.json({ error: 'Failed to fetch data from ClickUp' }, 500);
  }
});

export default clickupRouter;
