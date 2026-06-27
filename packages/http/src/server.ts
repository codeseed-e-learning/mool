import http from "node:http";

import { Router } from "../../router/src";
import { Request } from "./request";
import { Response } from "./response";

export class Server {
  listen(port: number): void {
    const router = new Router();

    const server = http.createServer(async (req, res) => {
      const request = new Request(req);
      const response = new Response(res);

      console.log(`${request.method} ${request.url}`);

      // Read request body
      const chunks: Buffer[] = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      const rawBody = Buffer.concat(chunks).toString();

      if (rawBody.length > 0) {
        try {
          request.body = JSON.parse(rawBody);
        } catch {
          request.body = {};
        }
      }

      try {
        const result = router.resolve(request);

        if (typeof result === "string") {
          response.send(result);
          return;
        }

        response.json(result);
      } catch (error) {
        console.error(error);

        response.json({
          success: false,
          message: "Internal Server Error",
        });
      }
    });

    server.listen(port, () => {
      console.log(`🚀 Mool server running at http://localhost:${port}`);
    });
  }
}
