import { Provider } from "./provider.js";

export class ProviderRepository {
  private readonly providers: Provider[] = [];

  add(provider: Provider): void {
    this.providers.push(provider);
  }

  register(): void {
    for (const provider of this.providers) {
      provider.register();
    }
  }

  boot(): void {
    for (const provider of this.providers) {
      provider.boot();
    }
  }
}