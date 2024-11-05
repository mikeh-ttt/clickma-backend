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
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  REDIRECT_URL: string;
};
