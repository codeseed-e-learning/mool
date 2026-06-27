import { Server } from "../../http/src";


import { Container, Constructor } from "./container";
import { loadRoutes } from "./bootstrap/load-routes"

export class Application {
  public readonly container: Container;

  private readonly server: Server;

  constructor() {
    this.container = new Container();

    this.container.bind(Server);

    this.server = this.container.make(Server);
  }

  make<T>(constructor: Constructor<T>): T {
    return this.container.make(constructor);
  }

  bootstrap(): void {
    console.log("🚀 Bootstrapping Mool...");
     loadRoutes();
  }

  start(): void {
    this.server.listen(3000);
  }
}