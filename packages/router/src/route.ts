import { RouteCollection } from "./route-collection";
import { RouteDefinition } from "./route-definition";
import { RouteHandler } from "./contracts/route-handler";

export class Route {
  private static readonly routes = new RouteCollection();

  static get(path: string, handler: RouteHandler): void {
    this.routes.add(
      new RouteDefinition("GET", path, handler)
    );
  }

  static post(path: string, handler: RouteHandler): void {
    this.routes.add(
      new RouteDefinition("POST", path, handler)
    );
  }

  static put(path: string, handler: RouteHandler): void {
    this.routes.add(
      new RouteDefinition("PUT", path, handler)
    );
  }

  static delete(path: string, handler: RouteHandler): void {
    this.routes.add(
      new RouteDefinition("DELETE", path, handler)
    );
  }

  static all(): RouteDefinition[] {
    return this.routes.all();
  }
}