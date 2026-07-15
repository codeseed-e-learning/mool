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
import { ProjectController } from "../app/Controllers/ProjectController.js";
import { User } from "../app/Models/User.js";
import { Project } from "../app/Models/Project.js";

Route.get("/", HomeController.index);

// Portfolio: JSON API backed by a real MySQL table via mool-orm.
Route.get("/projects", ProjectController.index);
Route.get("/projects/:id", ProjectController.show);
Route.post("/projects", ProjectController.store);

// Portfolio: the rendered page — layout + reusable ProjectCard component,
// same pattern Step 8 of guide.md walks through.
Route.get("/portfolio", async () => {
  const projects = await Project.orderBy("created_at", "desc").get();

  const rendered = View.render("portfolio", {
    title: "Amit Kasabe — Portfolio",
    name: "Amit Kasabe",
    projects,
  });

  return html(rendered);
});

Route.get("/health", () => "OK");

Event.listen("user.registered", (payload) => {
  console.log("New user registered:", payload);
});

Route.get("/users", async () => {
  const users = await User.all();

  return users.map((user) => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
});

Route.post("/users", async (request) => {
  const { valid, errors } = validate(request.body, {
    name: "required|string|min:2",
    email: "required|email",
    password: "required|string|min:6",
  });

  if (!valid) {
    return { success: false, errors };
  }

  const user = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: hashPassword(String(request.body.password)),
    created_at: new Date().toISOString(),
  });

  Event.dispatch("user.registered", { id: user.id, email: user.email });

  const { password, ...safeUser } = user;

  return { success: true, user: safeUser };
});

Route.post("/login", async (request) => {
  const { valid, errors } = validate(request.body, {
    email: "required|email",
    password: "required|string",
  });

  if (!valid) {
    return { success: false, errors };
  }

  const [user] = await User.where("email", request.body.email);

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
    features: [
      { icon: "🚦", title: "Routing & Middleware", description: "Path params, real async next() chaining." },
      { icon: "🗄️", title: "Database & ORM", description: "MySQL, plus a chainable query builder." },
      { icon: "🔒", title: "JWT Auth", description: "Password hashing and token middleware, built in." },
      { icon: "🖼️", title: "Views", description: "A minimal, zero-dependency template engine." },
      { icon: "✅", title: "Validation", description: "Laravel-style rule strings for request data." },
      { icon: "⚡", title: "Cache & Events", description: "In-memory TTL cache, and a pub/sub event bus." },
      { icon: "🔁", title: "Transactions", description: "Wrap multi-write operations so they commit or roll back together." },
      { icon: "🛠️", title: "CLI", description: "make:model, make:controller, migrate, and hot-reloading dev server." },
    ],
  });

  return html(rendered);
});

Route.get("/cached-time", async () => {
  const time = await Cache.remember("time", 10, () => new Date().toISOString());

  return { time };
});
