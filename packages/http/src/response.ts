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
}