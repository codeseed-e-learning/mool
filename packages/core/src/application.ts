import { Server } from "../../http/src";
import { RouteServiceProvider } from "../../../app/provider/route-service-provider";

import { Container, Constructor } from "./container";
import { ProviderRepository } from "./providers/provider-repository";

export class Application {
  public readonly container: Container;

  private readonly server: Server;

  private readonly providers: ProviderRepository;

  constructor() {
    this.container = new Container();

    this.container.bind(Server);

    this.server = this.container.make(Server);

    this.providers = new ProviderRepository();

    this.providers.add(new RouteServiceProvider());
  }

  make<T>(constructor: Constructor<T>): T {
    return this.container.make(constructor);
  }

  bootstrap(): void {
    console.log("🚀 Bootstrapping Mool...");

    this.providers.register();
    this.providers.boot();
  }

  start(): void {
    this.server.listen(3000);
  }
}