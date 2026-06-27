export abstract class Provider {
  /**
   * Register services into the container.
   */
  register(): void {}

  /**
   * Boot the provider after all providers are registered.
   */
  boot(): void {}
}