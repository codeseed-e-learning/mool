export abstract class Migration {
  abstract up(): void | Promise<void>;

  abstract down(): void | Promise<void>;
}
