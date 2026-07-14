import { Server } from "@codeseedelearning/mool-http";

import { Container, Constructor } from "./container.js";
import { ProviderRepository } from "./providers/provider-repository.js";
import { Provider } from "./providers/provider.js";

export class Application {
  public readonly container: Container;

  private readonly server: Server;

  private readonly providers: ProviderRepository;

  constructor() {
    this.container = new Container();

    this.container.bind(Server);

    this.server = this.container.make(Server);

    this.providers = new ProviderRepository();
  }

  register(provider: Provider): void {
    this.providers.add(provider);
  }

  make<T>(constructor: Constructor<T>): T {
    return this.container.make(constructor);
  }

  bootstrap(): void {
    console.log("🚀 Bootstrapping Mool...");

    this.providers.register();
    this.providers.boot();
  }

  start(port = 3000): void {
    this.server.listen(port);
  }
}