import { kv } from '@vercel/kv';

// Helper function to initialize KV store
export const setInitKv = async (id: string) => {
  await kv.set(getInitializedId(id), true);
};

export const getInitKv = async (id: string) => {
  const val = await kv.get(getInitializedId(id));
  return val;
};

export const getInitializedId = (id: string) => `init-${id}`;
