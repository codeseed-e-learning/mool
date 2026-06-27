import { Route } from "../packages/router/src";
import { AuthController } from "../app/controllers/AuthController";

import { AuthMiddleware } from "../app/middleware/auth-middleware";
Route.get("/", AuthController.index).middleware(new AuthMiddleware());

Route.post("/login", (request, response) => {
  response.status(201).json({
    success: true,
    email: request.body.email,
  });

  return;
});

Route.get("/testme", (request, response) => {
  return "Welcome";
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
