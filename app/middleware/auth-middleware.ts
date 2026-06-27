import { Middleware } from "../../packages/router/src/contracts/middleware";
import { Request } from "../../packages/http/src/request";

export class AuthMiddleware implements Middleware {
  handle(request: Request): boolean {
    console.log(
      `[AuthMiddleware] ${request.method} ${request.url}`
    );

    return true;
  }
}