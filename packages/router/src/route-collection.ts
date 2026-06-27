import { RouteDefinition } from "./route-definition";

export class RouteCollection {
  private readonly routes: RouteDefinition[] = [];

  add(route: RouteDefinition): void {
    this.routes.push(route);
  }

  all(): RouteDefinition[] {
    return this.routes;
  }
}