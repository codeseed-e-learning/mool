import { Route } from "@codeseedelearning/mool-router";
import { validate } from "@codeseedelearning/mool-validation";
import { Event } from "@codeseedelearning/mool-events";
import { Cache } from "@codeseedelearning/mool-cache";
import {
  hashPassword,
  verifyPassword,
  createToken,
  AuthMiddleware,
} from "@codeseedelearning/mool-auth";
import { View, html } from "@codeseedelearning/mool-view";

import { HomeController } from "../app/Controllers/HomeController.js";
import { User } from "../app/Models/User.js";

Route.get("/", HomeController.index);

Route.get("/health", () => "OK");

Event.listen("user.registered", (payload) => {
  console.log("New user registered:", payload);
});

Route.get("/users", () => {
  return User.all().map((user) => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
});

Route.post("/users", (request) => {
  const { valid, errors } = validate(request.body, {
    name: "required|string|min:2",
    email: "required|email",
    password: "required|string|min:6",
  });

  if (!valid) {
    return { success: false, errors };
  }

  const user = User.create({
    name: request.body.name,
    email: request.body.email,
    password: hashPassword(String(request.body.password)),
    created_at: new Date().toISOString(),
  });

  Event.dispatch("user.registered", { id: user.id, email: user.email });

  const { password, ...safeUser } = user;

  return { success: true, user: safeUser };
});

Route.post("/login", (request) => {
  const { valid, errors } = validate(request.body, {
    email: "required|email",
    password: "required|string",
  });

  if (!valid) {
    return { success: false, errors };
  }

  const [user] = User.where("email", request.body.email);

  if (!user || !verifyPassword(String(request.body.password), String(user.password))) {
    return { success: false, message: "Invalid credentials" };
  }

  const token = createToken({ id: user.id, email: user.email });

  return { success: true, token };
});

// AuthMiddleware verifies the Bearer token, attaches the decoded payload to
// request.state.user, and 401s (a real HTTP 401, via HttpResponse) before
// the handler ever runs if the token is missing/invalid/expired.
Route.get("/profile", (request) => {
  return { success: true, user: request.state.user };
}).middleware(new AuthMiddleware());

Route.get("/welcome", () => {
  const rendered = View.render("welcome", {
    title: "Welcome to Mool",
    name: "developer",
    features: ["Routing", "Validation", "SQLite ORM", "JWT auth", "Views"],
  });

  return html(rendered);
});

Route.get("/cached-time", async () => {
  const time = await Cache.remember("time", 10, () => new Date().toISOString());

  return { time };
});
