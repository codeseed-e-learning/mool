import { Application } from "./application.js";

export class Kernel {
  constructor(
    private readonly application: Application
  ) {}

  boot(): void {
    this.application.bootstrap();
  }

  start(): void {
    this.application.start();
  }
}