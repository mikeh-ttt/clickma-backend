import { kv } from '@vercel/kv';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { authorizationSuccessfulHtml } from '../templates/authorizationSuccessfulHtml';
import { ENV_VAR, STATUS_CODE } from '../utils/constants';
import { getInitKv, setInitKv } from '../utils/functions';
import { sendResponse } from '../utils/response';
const oauthRouter = new Hono();

/**
 * @route GET /clickup
 * @returns  Redirects to ClickUp authorization URL or sends an error response.
 */
oauthRouter.get('/clickup', async (c) => {
  const { CLIENT_ID, REDIRECT_URL } = env(c);
  const id = c.req.query('id');

  if (!id) {
    return sendResponse(c, 'error', 'No provided ID');
  }

  await setInitKv(id);

  const clickupAuthUrl = `https://app.clickup.com/api?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}?id=${id}`;

  return c.redirect(clickupAuthUrl);
});
/**
 * @route GET /callback
 * @returns Sends an HTML response on success or an error response.
 */
oauthRouter.get('/callback', async (c) => {
  const code = c.req.query('code');
  const id = c.req.query('id');

  if (!code || !id) return sendResponse(c, 'error', 'No code was provided');

  const isValidId = await getInitKv(id);
  if (!isValidId) return sendResponse(c, 'error', 'Invalid request ID');

  const { CLIENT_ID, CLIENT_SECRET } = env<ENV_VAR>(c);

  const tokenAPI = `https://api.clickup.com/api/v2/oauth/token`;

  const workspaceAPI = `https://api.clickup.com/api/v2/team`;

  const body = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: code,
  };

  try {
    const response = await fetch(tokenAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return sendResponse(
        c,
        'error',
        errorResponse.message || 'Failed to retrieve access token',
        undefined,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const data: { access_token: string } = await response.json();

    const { access_token } = data;

    const fetchWorkspace = await fetch(workspaceAPI, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: access_token,
      },
    });

    const fetchWorkspaceResonse = await fetchWorkspace.json();

    const workspace = fetchWorkspaceResonse?.teams?.[0]?.id;

    await kv.hset(id, { access_token: access_token, workspace });

    return c.html(authorizationSuccessfulHtml);
  } catch (error) {
    console.error('Error fetching access token:', error);
    return sendResponse(
      c,
      'error',
      'An error occurred while retrieving the access token',
      undefined,
      STATUS_CODE.UNAUTHORIZED
    );
  }
});

/**
 * POST /access-token
 * Retrieves the access token for a given request ID.
 * @returns {Promise<void>} Sends a response with the access token if available, or an error message if not.
 */
oauthRouter.post('/access-token', async (c) => {
  const body = await c.req.json();
  const { id } = body;
  const accessToken = await kv.hget(id, 'access_token');
  const workspace = await kv.hget(id, 'workspace');
  if (accessToken) {
    return sendResponse(c, 'success', 'Access token retrieved successfully', {
      access_token: accessToken,
      workspace,
    });
  }

  return sendResponse(c, 'error', 'No available access token');
});

export default oauthRouter;
