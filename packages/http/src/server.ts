import http from "node:http";

import { Request } from "./request";
import { Response } from "./response";

export class Server {
  listen(port: number): void {
    const server = http.createServer((req, res) => {
      const request = new Request(req);
      const response = new Response(res);

      console.log(`${request.method} ${request.url}`);

      response.send("Hello, Mool!");
    });

    server.listen(port, () => {
      console.log(`🚀 Mool server running at http://localhost:${port}`);
    });
  }
}