import { HttpResponse } from "@codeseedelearning/mool-http";

/**
 * Wraps a rendered HTML string so the server sends it with
 * Content-Type: text/html instead of the default text/plain.
 */
export function html(body: string, status = 200): HttpResponse {
  return new HttpResponse(status, body, "text/html; charset=utf-8");
}
