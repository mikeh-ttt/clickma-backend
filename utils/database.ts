import { kv } from '@vercel/kv';

export interface Storage {
  set(key: string, value: unknown): Promise<void>;
  hset<TData>(key: string, value: Record<string, TData>): Promise<void>;
  get<TData>(key: string): Promise<TData | null>;
  hget<TData>(key: string, field: string): Promise<TData | null>;
}

class VercelKVStorage implements Storage {
  async set(key: string, value: unknown) {
    await kv.set(key, value);
  }

  async hset<TData>(key: string, value: Record<string, TData>) {
    await kv.hset(key, value);
  }

  async get<TData>(key: string) {
    return await kv.get<TData>(key);
  }

  async hget<TData>(key: string, field: string) {
    return await kv.hget<TData>(key, field);
  }
}

// In-memory storage implementation
class InMemoryStorage implements Storage {
  private cache = new Map<string, any>();

  async set(key: string, value: unknown) {
    this.cache.set(key, value);
  }

  async hset<TData>(key: string, value: Record<string, TData>) {
    const existing = this.cache.get(key) || {};
    this.cache.set(key, { ...existing, ...value });
  }

  async get<TData>(key: string) {
    return (this.cache.has(key) ? this.cache.get(key) : null) as TData | null;
  }

  async hget<TData>(key: string, field: string) {
    const data = this.cache.get(key);
    return data ? (data[field] as TData | null) : null;
  }
}

// Singleton instance for the storage
let storageInstance: Storage | null = null;

// Factory function to get the appropriate storage instance
export const getStorageInstance = (): Storage => {
  if (storageInstance) {
    return storageInstance; // Return the existing instance if it already exists
  }

  const useDatabase = process.env.USE_DATABASE;
  switch (useDatabase) {
    case 'vercel-kv':
      storageInstance = new VercelKVStorage();
      break;
    case 'in-memory':
      storageInstance = new InMemoryStorage();
      break;
    default:
      storageInstance = new InMemoryStorage();
      break;
  }

  return storageInstance;
};
