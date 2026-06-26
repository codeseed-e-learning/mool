export class Parser {
  parse(argv: string[]) {
    const [, , command, ...args] = argv;

    return {
      command: command ?? "help",
      args,
    };
  }
}