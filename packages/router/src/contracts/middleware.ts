import { Request } from "../../../http/src/request";

export interface Middleware {
  handle(request: Request): boolean;
}