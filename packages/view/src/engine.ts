export type CompiledView = (data?: Record<string, unknown>) => string;

const TAG = /<%(-|=)?([\s\S]+?)%>/g;

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Compiles a template string into a render function. Tag syntax:
 *   <%= expr %>   HTML-escaped output
 *   <%- expr %>   raw (unescaped) output
 *   <% code %>    arbitrary JS — if/for/etc.
 *
 * Templates are trusted code (compiled with `new Function`), same trust
 * model as EJS — never compile a template sourced from user input.
 */
export function compile(template: string): CompiledView {
  let cursor = 0;
  let body = 'let __out = "";\n';
  let match: RegExpExecArray | null;

  TAG.lastIndex = 0;

  while ((match = TAG.exec(template))) {
    const literal = template.slice(cursor, match.index);
    body += `__out += ${JSON.stringify(literal)};\n`;

    const [, modifier, code] = match;

    if (modifier === "=") {
      body += `__out += __escape(${code.trim()});\n`;
    } else if (modifier === "-") {
      body += `__out += (${code.trim()});\n`;
    } else {
      body += `${code}\n`;
    }

    cursor = match.index + match[0].length;
  }

  body += `__out += ${JSON.stringify(template.slice(cursor))};\n`;
  body += "return __out;";

  const render = new Function("__data", "__escape", `with (__data) {\n${body}\n}`) as (
    data: Record<string, unknown>,
    escape: typeof escapeHtml
  ) => string;

  return (data: Record<string, unknown> = {}) => render(data, escapeHtml);
}
