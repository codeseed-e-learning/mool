import { Route } from "../packages/router/src";
import {AuthController} from "../app/controllers/AuthController";

import {AuthMiddleware} from "../app/middleware/auth-middleware"
Route.get("/", AuthController.index)
  .middleware(new AuthMiddleware());


Route.post("/login", (request) => {
  console.log(request.body);

  return {
    success: true,
    message: "Login request received",
    body: request.body,
  };
});


Route.get("/crash", () => {
  throw new Error("Something exploded!");
});

Route.get("/login", () => {
  return "Login Page";
});

Route.get("/about", () => "About Page");

Route.get("/health", () => "Health Check");
Route.get("/users/:id", (request) => {
    return request.params.id;
});