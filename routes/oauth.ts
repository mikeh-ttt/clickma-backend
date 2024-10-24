import { kv } from '@vercel/kv';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { html } from 'hono/html';
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

    return c.html(html`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Authorization Successful</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
            }
          </style>
        </head>
        <body
          class="bg-[#f0f0f0] flex min-h-screen items-center justify-center"
        >
          <div
            class="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl"
          >
            <div class="p-6">
              <h1 class="mb-2 text-center text-2xl font-bold text-[#1E1E1E]">
                Authorization Successful
              </h1>
              <p class="text-center text-gray-600">
                You have been successfully authorized. You can now close this
                window and return to Figma.
              </p>
            </div>
            <div class="bg-gray-50 p-4">
              <button
                onclick="window.close()"
                class="w-full bg-[#000] hover:bg-[#000] text-white font-bold py-2 px-4 rounded"
              >
                Close Window
              </button>
            </div>
          </div>

          <script>
            function closeWindow() {
              window.close();
              // Note: window.close() may not work in all browsers due to security restrictions
              // In a real-world scenario, you might want to redirect to a specific URL instead
            }
          </script>
        </body>
      </html>`);
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
