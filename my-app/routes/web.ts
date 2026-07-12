import { Route } from "@codeseedelearning/mool-router";

import { HomeController } from "../app/Controllers/HomeController.js";

Route.get("/", HomeController.index);

Route.get("/health", () => "OK");
