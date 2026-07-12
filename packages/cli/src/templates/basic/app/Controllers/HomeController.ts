import { Config } from "@codeseedelearning/mool-config";

export class HomeController {
  static index(): Record<string, unknown> {
    return {
      message: `Welcome to ${Config.get("app.name", "Mool")}`,
    };
  }
}
