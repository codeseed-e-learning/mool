import { RouteCollection } from "./route-collection.js";
import { RouteDefinition } from "./route-definition.js";
import { RouteHandler } from "./contracts/route-handler.js";

export class Route {
  private static readonly routes = new RouteCollection();

  static get(path: string, handler: RouteHandler): RouteDefinition {
    const route = new RouteDefinition("GET", path, handler);

    this.routes.add(route);

    return route;
  }

  static post(path: string, handler: RouteHandler): RouteDefinition {
    const route = new RouteDefinition("POST", path, handler);

    this.routes.add(route);

    return route;
  }

  static put(path: string, handler: RouteHandler): RouteDefinition {
    const route = new RouteDefinition("PUT", path, handler);

    this.routes.add(route);

    return route;
  }

  static delete(path: string, handler: RouteHandler): RouteDefinition {
    const route = new RouteDefinition("DELETE", path, handler);

    this.routes.add(route);

    return route;
  }

  static all(): RouteDefinition[] {
    return this.routes.all();
  }
}