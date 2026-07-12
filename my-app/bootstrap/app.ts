import { Application } from "@codeseedelearning/mool-core";
import { loadEnv, Config } from "@codeseedelearning/mool-config";

import "../routes/web.js";

loadEnv();
await Config.load();

const app = new Application();

app.bootstrap();

export default app;
