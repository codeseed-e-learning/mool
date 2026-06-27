import { Route } from "../packages/router/src";
import { RouteMatcher } from "../packages/router/src/matchers/route-matcher";

Route.get("/", () => "Home");

Route.get("/users/:id", () => "User");

const matcher = new RouteMatcher();

const match = matcher.match(
  "GET",
  "/users/25",
  Route.all()
);

console.log(match);