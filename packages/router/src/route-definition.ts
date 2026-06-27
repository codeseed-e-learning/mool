import { RouteHandler } from "./contracts/route-handler";

export class RouteDefinition {
  constructor(
    public readonly method: string,
    public readonly path: string,
    public readonly handler: RouteHandler
  ) {}
}