
export const RENDER_SIZE = 24;
export const CX = RENDER_SIZE / 2;
export const CY = CX;
export const S12 = String(CX);
export const S24 = String(RENDER_SIZE);

// Keeps a full 3,000-icon page warm without allowing unbounded growth.
export const MAX_CACHE_SIZE = 4096;

export const caches = {
  svg: undefined as undefined | Map<string, string>,
  dataUrls: undefined as undefined | Map<string, string>,
};

export function getCacheValue<T>(cache: Map<string, T>, key: string): T | undefined {
  const value = cache.get(key);
  if (value !== undefined) {
    // Map preserves insertion order, so moving a hit to the end marks it as recently used.
    cache.delete(key);
    cache.set(key, value);
  }
  return value;
}

export function setCacheValue<T>(cache: Map<string, T>, key: string, value: T): void {
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(key)) {
    const oldestKey = cache.keys().next().value!;
    cache.delete(oldestKey);
  }

  cache.delete(key);
  cache.set(key, value);
}
