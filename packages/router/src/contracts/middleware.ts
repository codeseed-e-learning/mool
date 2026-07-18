import type { Request } from "../request.js";

export type NextFunction = () => unknown | Promise<unknown>;

export interface Middleware {
  /**
   * Runs before the route handler (or the next middleware in the chain).
   * Call `next()` to continue the chain and get its result — pass it
   * through, transform it, or ignore it. Mutate `request` before calling
   * `next()` to pass data forward (e.g. `request.state.user = ...`).
   * Returning without calling `next()` short-circuits the chain.
   */
  handle(request: Request, next: NextFunction): unknown | Promise<unknown>;
}
