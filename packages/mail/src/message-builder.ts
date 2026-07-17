import { randomBytes } from "node:crypto";

export interface BuildMessageOptions {
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Builds a raw RFC 5322 message (headers + blank line + body) ready to
 * hand to the SMTP client's DATA command.
 *
 * Subjects/addresses are sent as plain UTF-8, not RFC 2047-encoded — most
 * modern mail servers and clients handle that fine, but a strictly
 * ASCII-only mail server could reject or mangle non-ASCII subjects. A
 * known limitation, not a bug: full MIME header encoding is out of scope
 * for a minimal mailer.
 */
export function buildMessage(options: BuildMessageOptions): string {
  const boundary = `mool-${Date.now()}-${randomBytes(8).toString("hex")}`;

  const headers = [
    `From: ${options.from}`,
    `To: ${options.to.join(", ")}`,
    ...(options.cc && options.cc.length > 0 ? [`Cc: ${options.cc.join(", ")}`] : []),
    `Subject: ${options.subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${randomBytes(8).toString("hex")}@mool>`,
    "MIME-Version: 1.0",
  ];

  if (options.text && options.html) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);

    const body = [
      `--${boundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      options.text,
      `--${boundary}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      options.html,
      `--${boundary}--`,
    ].join("\r\n");

    return `${headers.join("\r\n")}\r\n\r\n${body}`;
  }

  headers.push(`Content-Type: ${options.html ? "text/html" : "text/plain"}; charset=utf-8`);

  return `${headers.join("\r\n")}\r\n\r\n${options.html ?? options.text ?? ""}`;
}
