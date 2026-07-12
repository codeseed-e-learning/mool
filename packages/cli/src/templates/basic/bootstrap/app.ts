import { Application } from "@codeseedelearning/mool-core";
import { loadEnv, Config } from "@codeseedelearning/mool-config";
import { runMigrations } from "@codeseedelearning/mool-database";

import "../routes/web.js";

loadEnv();
await Config.load();
await runMigrations();

const app = new Application();

app.bootstrap();

export default app;
