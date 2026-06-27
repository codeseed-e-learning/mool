export type Constructor<T = unknown> = new (...args: any[]) => T;

export class Container {
  private readonly instances = new Map<Constructor, unknown>();

  bind<T>(
    constructor: Constructor<T>,
    instance?: T
  ): void {
    this.instances.set(
      constructor,
      instance ?? new constructor()
    );
  }

  make<T>(
    constructor: Constructor<T>
  ): T {
    const instance = this.instances.get(constructor);

    if (!instance) {
      throw new Error(
        `${constructor.name} is not registered in the container.`
      );
    }

    return instance as T;
  }
}