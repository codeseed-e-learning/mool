import { Route } from "../packages/router/src";
import {AuthController} from "../app/controllers/AuthController";

import {AuthMiddleware} from "../app/middleware/auth-middleware"
Route.get("/", AuthController.index)
  .middleware(new AuthMiddleware());




Route.get("/about", () => "About Page");

Route.get("/health", () => "Health Check");
Route.get("/users/:id", (request) => {
    return request.params.id;
});