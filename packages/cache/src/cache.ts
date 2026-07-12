interface CacheEntry {
  value: unknown;
  expiresAt: number | null;
}

export class Cache {
  private static readonly store = new Map<string, CacheEntry>();

  static put(key: string, value: unknown, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;

    this.store.set(key, { value, expiresAt });
  }

  static get<T = unknown>(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  static has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  static forget(key: string): void {
    this.store.delete(key);
  }

  static async remember<T>(
    key: string,
    ttlSeconds: number,
    callback: () => T | Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = await callback();

    this.put(key, value, ttlSeconds);

    return value;
  }

  static flush(): void {
    this.store.clear();
  }
}
