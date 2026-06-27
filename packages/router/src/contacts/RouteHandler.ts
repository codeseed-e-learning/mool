import { Request } from "../../../http/src/request";

export type RouteHandler = (
    request: Request
) => unknown | Promise<unknown>;