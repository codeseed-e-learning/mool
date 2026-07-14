import type { Request } from "@codeseedelearning/mool-http";
import { Route } from "./route.js";
import { RouteMatcher } from "./matchers/route-matcher.js";
import type { NextFunction } from "./contracts/middleware.js";

export class Router {
  private readonly matcher = new RouteMatcher();

  async resolve(request: Request): Promise<unknown> {
    const match = this.matcher.match(request.method, request.url, Route.all());

    if (!match) {
      return "404 Not Found";
    }

    request.params = match.params;

    const runHandler: NextFunction = () => match.route.handler(request);

    const pipeline = match.route.middlewares.reduceRight<NextFunction>(
      (next, middleware) => () => middleware.handle(request, next),
      runHandler
    );

    return await pipeline();
  }
}
