import { Request } from "../../http/src/request";
import { Route } from "./route";
import { RouteMatcher } from "./matchers/route-matcher";

export class Router {
  private readonly matcher = new RouteMatcher();

  resolve(request: Request): unknown {
    console.log("Method:", request.method);
    console.log("URL:", request.url);

    console.log(
      Route.all().map((route) => ({
        method: route.method,
        path: route.path,
      })),
    );
    const match = this.matcher.match(request.method, request.url, Route.all());

    if (!match) {
      return "404 Not Found";
    }

    request.params = match.params;

    // Execute middlewares
    for (const middleware of match.route.middlewares) {
      const allowed = middleware.handle(request);

      if (!allowed) {
        return "401 Unauthorized";
      }
    }

    return match.route.handler(request);
  }
}
