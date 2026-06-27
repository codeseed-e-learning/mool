import { Route } from "../packages/router/src";


import { HomeController } from "../app/controllers/home-controller";

Route.get("/", HomeController.index);




Route.get("/about", () => "About Page");

Route.get("/health", () => "Health Check");
Route.get("/users/:id", (request) => {
    return request.params.id;
});