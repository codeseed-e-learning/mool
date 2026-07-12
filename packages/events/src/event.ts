export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

export class Event {
  private static readonly listeners = new Map<string, EventHandler[]>();

  static listen<T = unknown>(name: string, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(name) ?? [];

    handlers.push(handler as EventHandler);

    this.listeners.set(name, handlers);
  }

  static async dispatch<T = unknown>(name: string, payload?: T): Promise<void> {
    const handlers = this.listeners.get(name) ?? [];

    for (const handler of handlers) {
      await handler(payload);
    }
  }

  static clear(name?: string): void {
    if (name) {
      this.listeners.delete(name);
      return;
    }

    this.listeners.clear();
  }
}
