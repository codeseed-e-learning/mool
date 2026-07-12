import { ServerResponse } from "node:http";

export class Response {
  constructor(
    private readonly response: ServerResponse
  ) {}

  status(code: number): this {
    this.response.statusCode = code;

    return this;
  }

  header(name: string, value: string): this {
    this.response.setHeader(name, value);

    return this;
  }

  send(body: string): void {
    this.header("Content-Type", "text/plain");

    this.response.end(body);
  }

  json(data: unknown): void {
    this.header("Content-Type", "application/json");

    this.response.end(JSON.stringify(data));
  }

  /**
   * Ends the response with a raw body, without touching Content-Type —
   * pair with .header() to set a custom one (e.g. rendered HTML views).
   */
  write(body: string): void {
    this.response.end(body);
  }
}