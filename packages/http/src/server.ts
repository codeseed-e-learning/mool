import http from "node:http";

import { Router } from "../../router/src";
import { Request } from "./request";
import { Response } from "./response";

export class Server {
  listen(port: number): void {
    const router = new Router();

    const server = http.createServer((req, res) => {
      const request = new Request(req);
      const response = new Response(res);

      console.log(`${request.method} ${request.url}`);

      const result = router.resolve(request);

      response.send(String(result));
    });

    server.listen(port, () => {
      console.log(`🚀 Mool server running at http://localhost:${port}`);
    });
  }
}
