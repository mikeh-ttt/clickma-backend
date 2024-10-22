import { Context } from 'hono';
import { STATUS_CODE } from './constants';

export type StatusCodeType = (typeof STATUS_CODE)[keyof typeof STATUS_CODE];

type ResponseMessage<T> = {
  status: 'success' | 'error';
  message: string;
  data?: T;
  code?: StatusCodeType; // Optional for error responses
};

const sendResponse = <T>(
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
    return c.json(response, code); // Send the response with the provided error code
  }

  return c.json(response, 200); // Default to 200 for success responses
};

export default sendResponse;
