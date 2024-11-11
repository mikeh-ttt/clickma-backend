export const MESSAGE = {
  error: 'error',
  success: 'success',
} as const;

export const STATUS_CODE = {
  NOT_FOUND: 404,
  UNAUTHORIZED: 403,
  SUCCESS: 200,
  SERVER_ERROR: 500,
} as const;

export type ENV_VAR = {
  // ClickUp App Credentials
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  REDIRECT_URL: string;

  // Database Option
  USE_DATABASE: 'in-memory' | 'vercel-kv';

  // Encryption Secret
  SECRET_KEY: string;

  // Vercel KV (optional)
  KV_URL?: string;
  KV_REST_API_URL?: string;
  KV_REST_API_TOKEN?: string;
  KV_REST_API_READ_ONLY_TOKEN?: string;
};
