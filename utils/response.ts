import { Context } from 'hono';
import { STATUS_CODE } from './constants';

export type StatusCodeType = (typeof STATUS_CODE)[keyof typeof STATUS_CODE];

export type ResponseMessage<T> = {
  status: 'success' | 'error';
  message: string;
  data?: T;
  code?: StatusCodeType;
};

export const sendResponse = <T>(
  c: Context,
  status: 'success' | 'error',
  message: string,
  data?: T,
  code?: StatusCodeType
) => {
  const response: ResponseMessage<T> = {
    status,
    message,
    data,
  };

  if (status === 'error' && code !== undefined) {
    response.code = code;
    return c.json(response, code);
  }

  return c.json(response, 200);
};
