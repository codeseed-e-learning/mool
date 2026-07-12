import type { Request } from "@codeseedelearning/mool-http";

export interface Middleware {
  handle(request: Request): boolean;
}