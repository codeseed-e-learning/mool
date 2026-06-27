import { Provider } from "../../packages/core/src/providers/provider";
import { loadRoutes } from "../../packages/core/src/bootstrap/load-routes";

export class RouteServiceProvider extends Provider {
  override boot(): void {
    loadRoutes();
  }
}