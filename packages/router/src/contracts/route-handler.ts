import type { Request } from "@codeseedelearning/mool-http";

export type RouteHandler = (
    request: Request
) => unknown | Promise<unknown>;