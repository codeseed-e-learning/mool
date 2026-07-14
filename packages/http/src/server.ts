import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";

import { Router } from "@codeseedelearning/mool-router";
import { Request } from "./request.js";
import { Response } from "./response.js";
import { HttpResponse } from "./http-response.js";

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

// Resolves a request URL to a file under publicDir, or null if there's no
// such file (or the URL tries to escape publicDir via "..").
function resolveStaticFile(publicDir: string, url: string): string | null {
  const pathname = decodeURIComponent(url.split("?")[0] ?? "/");
  const resolved = path.resolve(publicDir, `.${pathname}`);

  if (resolved !== publicDir && !resolved.startsWith(publicDir + path.sep)) {
    return null;
  }

  if (!existsSync(resolved) || !statSync(resolved).isFile()) {
    return null;
  }

  return resolved;
}

export class Server {
  listen(port: number, publicDir = path.resolve(process.cwd(), "public")): void {
    const router = new Router();

    const server = http.createServer(async (req, res) => {
      const request = new Request(req);
      const response = new Response(res);

      console.log(`${request.method} ${request.url}`);

      if (request.method === "GET" || request.method === "HEAD") {
        const filePath = resolveStaticFile(publicDir, request.url);

        if (filePath) {
          response
            .status(200)
            .header("Content-Type", MIME_TYPES[path.extname(filePath)] ?? "application/octet-stream");

          if (request.method === "HEAD") {
            response.raw.end();
          } else {
            createReadStream(filePath)
              .on("error", () => response.raw.end())
              .pipe(response.raw);
          }

          return;
        }
      }

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
