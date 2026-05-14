const _cache = new Map<string, Promise<unknown>>();

export function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!_cache.has(key)) _cache.set(key, fn());
  return _cache.get(key) as Promise<T>;
}
