import type { Request } from "../request.js";

export type RouteHandler = (
    request: Request
) => unknown | Promise<unknown>;