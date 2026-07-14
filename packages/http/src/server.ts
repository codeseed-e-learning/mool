import http from "node:http";

import { Router } from "@codeseedelearning/mool-router";
import { Request } from "./request.js";
import { Response } from "./response.js";
import { HttpResponse } from "./http-response.js";

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
        const result = await router.resolve(request);

        if (result instanceof HttpResponse) {
          response.status(result.status);

          if (result.contentType) {
            response.header("Content-Type", result.contentType);
            response.write(
              typeof result.body === "string" ? result.body : JSON.stringify(result.body)
            );
            return;
          }

          if (typeof result.body === "string") {
            response.send(result.body);
            return;
          }

          response.json(result.body);
          return;
        }

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
