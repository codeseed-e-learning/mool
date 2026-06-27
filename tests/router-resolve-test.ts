import { Route } from "../packages/router/src/route";
import { Router } from "../packages/router/src/router";

Route.get("/", () => "Welcome to Mool");

Route.get("/about", () => "About Page");

const router = new Router();

console.log(router.resolve("GET", "/"));

console.log(router.resolve("GET", "/about"));

console.log(router.resolve("GET", "/contact"));