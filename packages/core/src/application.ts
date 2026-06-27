import { Server } from "../../http/src";
import "../../../routes/web";

export class Application {
  private readonly server = new Server();

  bootstrap(): void {
    console.log("🚀 Bootstrapping Mool...");
  }

  start(): void {
    this.server.listen(3000);
  }
}