import { IncomingMessage } from "node:http";

export class Request {
  public params: Record<string, string> = {};

  public query: Record<string, string> = {};

  public body: Record<string, unknown> = {};

  /**
   * A generic bag middleware can use to pass data forward to the next
   * middleware/handler in the chain (e.g. `request.state.user = ...`).
   */
  public state: Record<string, unknown> = {};

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