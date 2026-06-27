import { Route } from "../packages/router/src";
Route.get("/", () => "Welcome to Mool");


Route.get("/about", () => "About Page");

Route.get("/health", () => "Health Check");
