import { Application } from "../packages/core/src/application";
import { Server } from "../packages/http/src/server";

const app = new Application();

const server = app.make(Server);

console.log(server instanceof Server);