import { createHmac, timingSafeEqual } from "node:crypto";

export interface JwtPayload {
  [key: string]: unknown;
  iat?: number;
  exp?: number;
}

export class JwtError extends Error {}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf-8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf-8");
}

function signature(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  return (
    bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB)
  );
}

/**
 * Signs a payload as an HS256 JWT. Adds `iat` and `exp` automatically.
 */
export function sign(
  payload: JwtPayload,
  secret: string,
  expiresInSeconds = 3600
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);

  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;

  return `${unsigned}.${signature(unsigned, secret)}`;
}

/**
 * Verifies an HS256 JWT's signature and expiry, returning its payload.
 * Throws JwtError if the token is malformed, has a bad signature, or has
 * expired.
 */
export function verify<T extends JwtPayload = JwtPayload>(
  token: string,
  secret: string
): T {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new JwtError("Malformed token.");
  }

  const [encodedHeader, encodedPayload, providedSignature] = parts;
  const unsigned = `${encodedHeader}.${encodedPayload}`;

  if (!timingSafeEqualStrings(providedSignature, signature(unsigned, secret))) {
    throw new JwtError("Invalid token signature.");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as T;

  if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new JwtError("Token has expired.");
  }

  return payload;
}
