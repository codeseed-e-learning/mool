import { RouteDefinition } from "../route-definition.js";
import { RouteMatch } from "../types.js";

export class RouteMatcher {
  match(
    method: string,
    path: string,
    routes: RouteDefinition[]
  ): RouteMatch | null {
    for (const route of routes) {
      if (route.method !== method) {
        continue;
      }

      const routeSegments = this.segments(route.path);
      const requestSegments = this.segments(path);

      if (routeSegments.length !== requestSegments.length) {
        continue;
      }

      const params: Record<string, string> = {};

      let matched = true;

      for (let i = 0; i < routeSegments.length; i++) {
        const routeSegment = routeSegments[i];
        const requestSegment = requestSegments[i];

        if (routeSegment.startsWith(":")) {
          params[routeSegment.slice(1)] = requestSegment;
          continue;
        }

        if (routeSegment !== requestSegment) {
          matched = false;
          break;
        }
      }

      if (matched) {
        return {
          route,
          params,
        };
      }
    }

    return null;
  }

  private segments(path: string): string[] {
    return path
      .split("/")
      .filter(Boolean);
  }
}