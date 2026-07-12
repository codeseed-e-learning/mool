/**
 * Return one of these from a route handler or middleware to control the
 * HTTP status code of the response (plain return values always send 200).
 * Pass contentType to override the default (text/plain for strings,
 * application/json otherwise) — e.g. "text/html; charset=utf-8" for
 * rendered views.
 */
export class HttpResponse {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    public readonly contentType?: string
  ) {}
}
