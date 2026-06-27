import { ServerResponse } from "node:http";

export class Response {
  constructor(
    private readonly response: ServerResponse
  ) {}

  send(body: string): void {
    this.response.statusCode = 200;
    this.response.setHeader("Content-Type", "text/plain");
    this.response.end(body);
  }

  json(data: unknown): void {
    this.response.statusCode = 200;
    this.response.setHeader("Content-Type", "application/json");
    this.response.end(JSON.stringify(data));
  }
}