import { HttpResponse, type Request } from "@codeseedelearning/mool-http";

import { getBearerToken } from "./bearer";
import { verifyToken } from "./token";

type NextFunction = () => unknown | Promise<unknown>;

/**
 * Gates a route behind a valid, unexpired Bearer JWT. On success, attaches
 * the decoded payload to `request.state.user` before calling `next()` — so
 * protected handlers can read `request.state.user` directly instead of
 * re-verifying the token themselves. On failure, short-circuits with a real
 * HTTP 401 (via HttpResponse) instead of calling next().
 *
 * Matches the router's Middleware shape (`handle(request, next)`)
 * structurally, without depending on @codeseedelearning/mool-router
 * directly.
 */
export class AuthMiddleware {
  constructor(private readonly secret?: string) {}

  async handle(request: Request, next: NextFunction): Promise<unknown> {
    const token = getBearerToken(request);

    if (!token) {
      return new HttpResponse(401, { success: false, message: "Unauthorized" });
    }

    try {
      request.state.user = verifyToken(token, this.secret);
    } catch {
      return new HttpResponse(401, { success: false, message: "Unauthorized" });
    }

    return next();
  }
}
