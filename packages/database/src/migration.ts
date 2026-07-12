export abstract class Migration {
  abstract up(): void;

  abstract down(): void;
}
