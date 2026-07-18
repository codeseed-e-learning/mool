// Standalone production entrypoint — the compiled-build counterpart to
// `mool start`. Doesn't need the mool CLI or tsx at runtime at all.
//
//   npm run build              # tsc -> dist/
//   node dist/bootstrap/server.js
//
// Run from the project root either way — .env, public/, resources/views/,
// and database/migrations/ are all read relative to the current working
// directory, not bundled into dist/.
import app from "./app.js";

const port = Number(process.env.PORT) || 3000;

app.start(port);
