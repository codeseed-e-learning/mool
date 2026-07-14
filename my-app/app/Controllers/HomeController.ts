import { Config } from "@codeseedelearning/mool-config";
import { View , html } from "@codeseedelearning/mool-view";

export class HomeController {
  static index() {
    const rendered = View.render("welcome", {
      title: "Mool",
      message: "Hello from the home page!",
      name: "shri. Amit Kasabe 2",
      features: [
        { icon: "🚦", title: "Routing & Middleware", description: "Path params, real async next() chaining." },
        { icon: "🗄️", title: "Database & ORM", description: "MySQL, plus a chainable query builder." },
        { icon: "🔒", title: "JWT Auth", description: "Password hashing and token middleware, built in." },
        { icon: "🖼️", title: "Views", description: "Layouts and reusable components, React-props style." },
        { icon: "✅", title: "Validation", description: "Laravel-style rule strings for request data." },
        { icon: "⚡", title: "Cache & Events", description: "In-memory TTL cache, and a pub/sub event bus." },
      ],
    });

    return html(rendered);
  }

  static about() {
    const rendered = View.render("about", {
      title: "About Mool",
      message: "This is the about page.",
      name:"shri. Amit Kasabe 2"
    });
    return html(rendered);
  }
}

