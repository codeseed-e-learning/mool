import { RouteCollection } from "./route-collection.js";
import { RouteDefinition } from "./route-definition.js";
import { RouteHandler } from "./contracts/route-handler.js";
import { Middleware } from "./contracts/middleware.js";

export interface RouteGroupOptions {
  /** Prepended to every route path registered inside the group's callback. */
  prefix?: string;
  /**
   * Applied to every route registered inside the group's callback, ahead of
   * any middleware chained on the route itself via `.middleware()` — group
   * middleware runs first (outermost), per-route middleware runs closer to
   * the handler.
   */
  middleware?: Middleware[];
}

interface GroupContext {
  prefix: string;
  middlewares: Middleware[];
}

const ROOT_CONTEXT: GroupContext = { prefix: "", middlewares: [] };

export class Route {
  private static readonly routes = new RouteCollection();
  private static readonly groupStack: GroupContext[] = [];

  /**
   * Groups routes under a shared path prefix and/or shared middleware.
   * Nestable — a nested group's prefix is appended to its parent's, and its
   * middleware is appended after its parent's:
   *
   *   Route.group({ prefix: "/api", middleware: [new AuthMiddleware()] }, () => {
   *     Route.get("/users", UserController.index); // GET /api/users, AuthMiddleware applied
   *
   *     Route.group({ prefix: "/admin" }, () => {
   *       Route.get("/stats", AdminController.stats); // GET /api/admin/stats, AuthMiddleware still applied
   *     });
   *   });
   */
  static group(options: RouteGroupOptions, callback: () => void): void {
    const parent = this.currentContext();

    this.groupStack.push({
      prefix: parent.prefix + this.normalizePrefix(options.prefix ?? ""),
      middlewares: [...parent.middlewares, ...(options.middleware ?? [])],
    });

    try {
      callback();
    } finally {
      this.groupStack.pop();
    }
  }

  static get(path: string, handler: RouteHandler): RouteDefinition {
    return this.register("GET", path, handler);
  }

  static post(path: string, handler: RouteHandler): RouteDefinition {
    return this.register("POST", path, handler);
  }

  static put(path: string, handler: RouteHandler): RouteDefinition {
    return this.register("PUT", path, handler);
  }

  static delete(path: string, handler: RouteHandler): RouteDefinition {
    return this.register("DELETE", path, handler);
  }

  static all(): RouteDefinition[] {
    return this.routes.all();
  }

  private static register(method: string, path: string, handler: RouteHandler): RouteDefinition {
    const context = this.currentContext();

    const route = new RouteDefinition(
      method,
      this.combinePath(context.prefix, path),
      handler,
      [...context.middlewares]
    );

    this.routes.add(route);

    return route;
  }

  private static currentContext(): GroupContext {
    return this.groupStack[this.groupStack.length - 1] ?? ROOT_CONTEXT;
  }

  private static normalizePrefix(prefix: string): string {
    const trimmed = prefix.replace(/^\/+|\/+$/g, "");

    return trimmed ? `/${trimmed}` : "";
  }

  private static combinePath(prefix: string, path: string): string {
    if (!prefix) {
      return path;
    }

    if (path === "/" || path === "") {
      return prefix;
    }

    return prefix + (path.startsWith("/") ? path : `/${path}`);
  }
}
