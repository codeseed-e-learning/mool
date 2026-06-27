import { Route } from "../packages/router/src";

Route.get("/", () => "Hello");

Route.get("/about", () => "About");

console.log(Route.all());