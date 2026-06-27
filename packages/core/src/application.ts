import { Server } from "../../http/src";
import "../../../routes/web";

import { Container, Constructor } from "./container";

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
  }

  start(): void {
    this.server.listen(3000);
  }
}