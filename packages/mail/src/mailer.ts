import { sendSmtp, type SmtpConnectionConfig } from "./smtp-client.js";
import { buildMessage } from "./message-builder.js";

export interface MailConfig {
  host?: string;
  port?: number;
  /** "tls" (implicit, e.g. port 465), "starttls" (e.g. port 587, the
   *  default), or "none" (unencrypted — local test servers only). */
  encryption?: "tls" | "starttls" | "none";
  username?: string;
  password?: string;
  /** Default "From" address used when a `Mail.send()` call doesn't pass
   *  its own `from`. */
  fromAddress?: string;
  /** Optional display name paired with `fromAddress`, e.g. "Mool App". */
  fromName?: string;
}

export interface MailMessage {
  to: string | string[];
  subject: string;
  /** At least one of `html`/`text` is required. Both together sends a
   *  multipart/alternative message. */
  html?: string;
  text?: string;
  cc?: string | string[];
  /** Overrides the configured `fromAddress`/`fromName` for this send only. */
  from?: string;
}

interface ResolvedMailConfig {
  host: string;
  port: number;
  encryption: "tls" | "starttls" | "none";
  username?: string;
  password?: string;
  fromAddress: string;
  fromName?: string;
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export class Mail {
  private static config: ResolvedMailConfig | null = null;

  /**
   * Configures the mailer. Called automatically (from env vars) on first
   * `send()` if you don't call it yourself.
   *
   * Reads from `config`, falling back to env vars: MAIL_HOST, MAIL_PORT
   * (default 587), MAIL_ENCRYPTION ("tls" | "starttls" [default] |
   * "none"), MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_ADDRESS,
   * MAIL_FROM_NAME.
   */
  static connect(config: MailConfig = {}): void {
    const host = config.host ?? process.env.MAIL_HOST;
    const fromAddress = config.fromAddress ?? process.env.MAIL_FROM_ADDRESS;

    if (!host) {
      throw new Error(
        "Mail is not configured — set MAIL_HOST (and MAIL_FROM_ADDRESS) in .env, or pass them to Mail.connect()."
      );
    }

    if (!fromAddress) {
      throw new Error(
        "No default from address configured — set MAIL_FROM_ADDRESS in .env, or pass fromAddress to Mail.connect()."
      );
    }

    this.config = {
      host,
      port: config.port ?? (process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587),
      encryption:
        config.encryption ?? (process.env.MAIL_ENCRYPTION as MailConfig["encryption"]) ?? "starttls",
      username: config.username ?? process.env.MAIL_USERNAME,
      password: config.password ?? process.env.MAIL_PASSWORD,
      fromAddress,
      fromName: config.fromName ?? process.env.MAIL_FROM_NAME,
    };
  }

  /**
   * Sends an email over SMTP. Opens a fresh connection per call — see
   * "Mail" in guide.md for the tradeoffs. Requires at least one of
   * `message.html`/`message.text`.
   */
  static async send(message: MailMessage): Promise<void> {
    if (!message.html && !message.text) {
      throw new Error("Mail.send() requires at least one of `html` or `text`.");
    }

    const config = this.getConfig();
    const to = toArray(message.to);

    if (to.length === 0) {
      throw new Error("Mail.send() requires at least one recipient in `to`.");
    }

    const from = message.from ?? this.formatFrom(config);
    const cc = toArray(message.cc);

    const smtpConfig: SmtpConnectionConfig = {
      host: config.host,
      port: config.port,
      encryption: config.encryption,
      username: config.username,
      password: config.password,
    };

    const raw = buildMessage({
      from,
      to,
      cc,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    await sendSmtp(smtpConfig, { from: this.extractAddress(from), to: [...to, ...cc], message: raw });
  }

  private static getConfig(): ResolvedMailConfig {
    if (!this.config) {
      this.connect();
    }

    return this.config!;
  }

  private static formatFrom(config: ResolvedMailConfig): string {
    return config.fromName ? `${config.fromName} <${config.fromAddress}>` : config.fromAddress;
  }

  /** "Name <address>" -> "address"; a bare address passes through unchanged. */
  private static extractAddress(from: string): string {
    const match = from.match(/<([^>]+)>/);

    return match ? match[1] : from;
  }
}
