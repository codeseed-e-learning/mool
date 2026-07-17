import net from "node:net";
import tls from "node:tls";

export class SmtpError extends Error {}

export interface SmtpConnectionConfig {
  host: string;
  port: number;
  /** "tls" connects encrypted from the start (implicit TLS, e.g. port 465).
   *  "starttls" connects plain then upgrades if the server offers STARTTLS.
   *  "none" never encrypts — local test servers only. */
  encryption: "tls" | "starttls" | "none";
  username?: string;
  password?: string;
}

export interface SmtpEnvelope {
  from: string;
  to: string[];
  /** Full RFC 5322 message: headers, blank line, body. LF or CRLF either way. */
  message: string;
}

type SmtpSocket = net.Socket | tls.TLSSocket;

interface SmtpResponse {
  code: number;
  text: string;
}

/**
 * Sends one message over a fresh SMTP connection, speaking just enough of
 * RFC 5321 (EHLO, STARTTLS, AUTH LOGIN, MAIL FROM/RCPT TO/DATA) to talk to
 * a real mail server. Opens and closes a new connection per send — no
 * pooling/keep-alive, which is the right tradeoff for the occasional
 * transactional email this framework targets, not bulk sending.
 */
export async function sendSmtp(
  config: SmtpConnectionConfig,
  envelope: SmtpEnvelope
): Promise<void> {
  let socket: SmtpSocket = await connect(config);
  let readResponse = attachReader(socket);

  try {
    await expect(await readResponse(), 220, "Connecting");

    let greeting = await command(socket, readResponse, "EHLO localhost", 250, "EHLO");

    if (config.encryption === "starttls") {
      if (!greeting.text.includes("STARTTLS")) {
        throw new SmtpError(`Server at ${config.host}:${config.port} does not support STARTTLS.`);
      }

      await command(socket, readResponse, "STARTTLS", 220, "STARTTLS");

      socket = await upgradeToTls(socket, config.host);
      readResponse = attachReader(socket);

      greeting = await command(socket, readResponse, "EHLO localhost", 250, "EHLO");
    }

    if (config.username && config.password) {
      await command(socket, readResponse, "AUTH LOGIN", 334, "AUTH LOGIN");
      await command(
        socket,
        readResponse,
        Buffer.from(config.username, "utf-8").toString("base64"),
        334,
        "AUTH username"
      );
      await command(
        socket,
        readResponse,
        Buffer.from(config.password, "utf-8").toString("base64"),
        235,
        "AUTH password"
      );
    }

    await command(socket, readResponse, `MAIL FROM:<${envelope.from}>`, 250, "MAIL FROM");

    for (const recipient of envelope.to) {
      await command(socket, readResponse, `RCPT TO:<${recipient}>`, 250, "RCPT TO");
    }

    await command(socket, readResponse, "DATA", 354, "DATA");

    const normalized = envelope.message.replace(/\r\n|\n/g, "\r\n");
    const dotStuffed = normalized.replace(/^\./gm, "..");

    await command(socket, readResponse, `${dotStuffed}\r\n.`, 250, "message body");

    await command(socket, readResponse, "QUIT", 221, "QUIT").catch(() => {
      // Best-effort — the message is already accepted at this point.
    });
  } finally {
    socket.end();
  }
}

function connect(config: SmtpConnectionConfig): Promise<SmtpSocket> {
  return new Promise((resolve, reject) => {
    if (config.encryption === "tls") {
      // Implicit TLS — don't resolve on the underlying "connect" (that
      // fires before the handshake completes; writing SMTP commands then
      // would hit a socket that isn't actually encrypted yet).
      const socket = tls.connect({ host: config.host, port: config.port });

      socket.once("secureConnect", () => resolve(socket));
      socket.once("error", reject);
      return;
    }

    const socket = net.connect({ host: config.host, port: config.port });

    socket.once("connect", () => resolve(socket));
    socket.once("error", reject);
  });
}

function upgradeToTls(socket: net.Socket, host: string): Promise<tls.TLSSocket> {
  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect({ socket, host });

    secureSocket.once("secureConnect", () => resolve(secureSocket));
    secureSocket.once("error", reject);
  });
}

/** Wires up response parsing for a socket. Call once per socket (including
 *  again after a STARTTLS upgrade, since it's a new socket instance). */
function attachReader(socket: SmtpSocket): () => Promise<SmtpResponse> {
  let buffer = "";
  let pending: { resolve: (response: SmtpResponse) => void; reject: (error: Error) => void } | null = null;

  const flush = () => {
    if (!pending) {
      return;
    }

    const end = findResponseEnd(buffer);

    if (end === -1) {
      return;
    }

    const raw = buffer.slice(0, end);
    buffer = buffer.slice(end);

    const code = Number(raw.slice(0, 3));
    const { resolve } = pending;

    pending = null;
    resolve({ code, text: raw });
  };

  socket.on("data", (chunk: Buffer) => {
    buffer += chunk.toString("utf-8");
    flush();
  });

  socket.on("error", (error) => {
    pending?.reject(error);
    pending = null;
  });

  socket.on("close", () => {
    pending?.reject(new SmtpError("Connection closed unexpectedly."));
    pending = null;
  });

  return () =>
    new Promise((resolve, reject) => {
      pending = { resolve, reject };
      flush();
    });
}

/** SMTP multi-line responses look like "250-First\r\n250-Second\r\n250 Last\r\n"
 *  — every line but the final one has a "-" right after the status code.
 *  Returns the index just past the final line, or -1 if not fully buffered. */
function findResponseEnd(buffer: string): number {
  let position = 0;

  while (true) {
    const lineEnd = buffer.indexOf("\r\n", position);

    if (lineEnd === -1) {
      return -1;
    }

    const line = buffer.slice(position, lineEnd);
    position = lineEnd + 2;

    if (!/^\d{3}[ -]/.test(line)) {
      continue; // stray/blank line — keep scanning
    }

    if (line[3] === " ") {
      return position; // final line of the response
    }
  }
}

async function command(
  socket: SmtpSocket,
  readResponse: () => Promise<SmtpResponse>,
  line: string,
  expectedCode: number,
  label: string
): Promise<SmtpResponse> {
  socket.write(line + "\r\n");

  return expect(await readResponse(), expectedCode, label);
}

function expect(response: SmtpResponse, expectedCode: number, label: string): SmtpResponse {
  if (response.code !== expectedCode) {
    throw new SmtpError(
      `SMTP ${label} failed: expected ${expectedCode}, got ${response.code} — ${response.text.trim()}`
    );
  }

  return response;
}
