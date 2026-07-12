import { Application } from "@mool/core";
import { AppServiceProvider } from "../app/Providers/AppServiceProvider";

const app = new Application();

app.register(new AppServiceProvider());

export default app;