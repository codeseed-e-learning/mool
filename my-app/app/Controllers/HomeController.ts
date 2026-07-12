import { Config } from "@codeseedelearning/mool-config";
import { View , html } from "@codeseedelearning/mool-view";

export class HomeController {
  static index() {
    const rendered = View.render("welcome", {
      title: "Mool",
      message: "Hello from the home page!",
      name:"shri. Amit Kasabe 2"
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

