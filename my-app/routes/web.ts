import { Route } from "@mool/router";

import { HomeController } from "../app/Controllers/HomeController.js";

Route.get("/", HomeController.index);

Route.get("/health", () => "OK");
