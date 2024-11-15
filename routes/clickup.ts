import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { StatusCode } from 'hono/utils/http-status';
import { ENV_VAR } from '../utils/constants';
const CLICKUP_BASE_API = 'https://api.clickup.com/api';
type Env = {
  Variables: {
    clickUpToken: string;
  };
};
const clickupRouter = new Hono<Env>();

const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'Missing ClickUp authentication token' }, 401);
  }

  const encryptedToken = authHeader.split('Bearer')[1].trim();

  const { SECRET_KEY } = env<ENV_VAR>(c);

  try {
    const decodedPayload = await verify(encryptedToken, SECRET_KEY);

    // Store the token in the environment for use in route handlers
    if (decodedPayload && decodedPayload?.access_token) {
      c.set('clickUpToken', decodedPayload.access_token);
    }
  } catch (error) {
    console.log('Error setting up middleware');
  } finally {
    await next();
  }
});

clickupRouter.use('/*', authMiddleware);

clickupRouter.get('/task/:workspaceId/:taskId', async (c) => {
  const taskId = c.req.param('taskId');
  const workspaceId = c.req.param('workspaceId');
  const customTaskIds = c.req.query('custom_task_ids') || 'false';
  const clickUpToken = c.get('clickUpToken');

  if (!workspaceId) {
    return c.json({ error: 'Missing workspaceId parameter' }, 400);
  }

  try {
    const response = await fetch(
      `${CLICKUP_BASE_API}/v2/task/${taskId}?team_id=${workspaceId}&custom_task_ids=${customTaskIds}&include_markdown_description=true`,
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

clickupRouter.post('/tasks/:workspaceId', async (c) => {
  const workspaceId = c.req.param('workspaceId');
  const clickUpToken = c.get('clickUpToken');
  const tasks = await c.req.json<{ id: string; custom_task_ids: boolean }[]>();

  console.log({ tasks });

  if (!workspaceId) {
    return c.json({ error: 'Missing workspaceId parameter' }, 400);
  }

  if (!tasks || !tasks.length) {
    return c.json(
      { error: 'Missing or empty tasks array in request body' },
      400
    );
  }

  try {
    const results = await Promise.all(
      tasks.map(async (task) => {
        const response = await fetch(
          `${CLICKUP_BASE_API}/v2/task/${task.id}?team_id=${workspaceId}&custom_task_ids=${task.custom_task_ids}&include_markdown_description=true`,
          {
            headers: {
              Authorization: clickUpToken,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          return { error: errorData, status: response.status, id: task.id };
        }

        const data = await response.json();
        return { ...data, id: task.id };
      })
    );

    return c.json({ tasks: results });
  } catch (error) {
    console.error('Error fetching tasks from ClickUp:', error);
    return c.json({ error: 'Failed to fetch data from ClickUp' }, 500);
  }
});

clickupRouter.get('/workspaces/:workspaceId/docs/:docId', async (c) => {
  const workspaceId = c.req.param('workspaceId');
  const docId = c.req.param('docId');
  const clickUpToken = c.get('clickUpToken');

  if (!workspaceId) {
    return c.json({ error: 'Missing workspaceId parameter' }, 400);
  }

  try {
    const response = await fetch(
      `${CLICKUP_BASE_API}/v3/workspaces/${workspaceId}/docs/${docId}`,
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
