import { IncomingMessage } from "node:http";

export class Request {
  public params: Record<string, string> = {};

  public query: Record<string, string> = {};

  public body: Record<string, unknown> = {};

  constructor(
    private readonly request: IncomingMessage
  ) {}

  get method(): string {
    return this.request.method ?? "GET";
  }

  get url(): string {
    return this.request.url ?? "/";
  }

  get headers() {
    return this.request.headers;
  }

  get raw(): IncomingMessage {
    return this.request;
  }
}