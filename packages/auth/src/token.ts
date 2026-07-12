import { sign, verify, type JwtPayload } from "@codeseedelearning/mool-jwt";

export interface TokenOptions {
  secret?: string;
  expiresInSeconds?: number;
}

function resolveSecret(secret?: string): string {
  const resolved = secret ?? process.env.APP_KEY;

  if (!resolved) {
    throw new Error(
      "No JWT secret provided. Set APP_KEY in your .env, or pass a secret explicitly."
    );
  }

  return resolved;
}

export function createToken(
  payload: JwtPayload,
  options: TokenOptions = {}
): string {
  return sign(payload, resolveSecret(options.secret), options.expiresInSeconds ?? 3600);
}

export function verifyToken<T extends JwtPayload = JwtPayload>(
  token: string,
  secret?: string
): T {
  return verify<T>(token, resolveSecret(secret));
}
