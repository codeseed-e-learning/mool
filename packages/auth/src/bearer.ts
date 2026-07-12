import type { Request } from "@codeseedelearning/mool-http";

/**
 * Extracts the token from an `Authorization: Bearer <token>` header.
 * Returns null if the header is missing or not in Bearer form.
 */
export function getBearerToken(request: Request): string | null {
  const header = request.headers.authorization;
  const value = Array.isArray(header) ? header[0] : header;

  if (!value || !value.startsWith("Bearer ")) {
    return null;
  }

  return value.slice("Bearer ".length).trim();
}
