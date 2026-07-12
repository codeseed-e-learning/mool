import { Route } from "@codeseedelearning/mool-router";
import { validate } from "@codeseedelearning/mool-validation";
import { Event } from "@codeseedelearning/mool-events";
import { Cache } from "@codeseedelearning/mool-cache";

import { HomeController } from "../app/Controllers/HomeController.js";

Route.get("/", HomeController.index);

Route.get("/health", () => "OK");

Event.listen("user.registered", (payload) => {
  console.log("New user registered:", payload);
});

Route.post("/users", (request) => {
  const { valid, errors } = validate(request.body, {
    name: "required|string|min:2",
    email: "required|email",
  });

  if (!valid) {
    return { success: false, errors };
  }

  Event.dispatch("user.registered", request.body);

  return { success: true, user: request.body };
});

Route.get("/cached-time", async () => {
  const time = await Cache.remember("time", 10, () => new Date().toISOString());

  return { time };
});
