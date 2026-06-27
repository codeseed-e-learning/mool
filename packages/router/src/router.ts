import { Route } from "./route";
import { RouteDefinition } from "./route-definition";

export class Router {
  resolve(method: string, path: string): unknown {
    const route = Route.all().find(
      (route: RouteDefinition) =>
        route.method === method && route.path === path
    );

    if (!route) {
      return "404 Not Found";
    }

    return route.handler();
  }
}