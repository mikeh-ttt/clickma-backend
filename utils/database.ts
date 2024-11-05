import { kv } from '@vercel/kv';

export const set = async (key: string, value: unknown) => {
  await kv.set(key, value);
};
export const hset = async <TData>(
  key: string,
  value: Record<string, TData>
) => {
  await kv.hset(key, value);
};

export const get = async <TData>(key: string) => {
  const data = await kv.get<TData>(key);
  return data;
};

export const hget = async <TData>(key: string, field: string) => {
  const data = await kv.hget<TData>(key, field);
  return data;
};
