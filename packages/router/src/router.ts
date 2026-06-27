import { Request } from "../../http/src/request";
import { Route } from "./route";
import { RouteMatcher } from "./matchers/route-matcher";

export class Router {
  private readonly matcher = new RouteMatcher();

  resolve(request: Request): unknown {
    const match = this.matcher.match(
      request.method,
      request.url,
      Route.all()
    );

    if (!match) {
      return "404 Not Found";
    }

    request.params = match.params;

    return match.route.handler(request);
  }
}