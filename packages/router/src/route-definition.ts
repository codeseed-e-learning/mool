import { RouteHandler } from "./contracts/route-handler.js";
import { Middleware } from "./contracts/middleware.js";

export class RouteDefinition {
  constructor(
    public readonly method: string,
    public readonly path: string,
    public readonly handler: RouteHandler,
    private readonly _middlewares: Middleware[] = []
  ) {}

  middleware(middleware: Middleware): this {
    this._middlewares.push(middleware);

    return this;
  }

  get middlewares(): Middleware[] {
    return this._middlewares;
  }
}