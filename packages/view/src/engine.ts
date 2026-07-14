export type Stack = string[];
export type CompiledView = (data?: Record<string, unknown>, stack?: Stack) => string;

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
 * Output is written to a stack of string buffers (__stack) rather than a
 * single local variable, so a JS callback embedded in a `<% %>` block
 * (e.g. the children callback passed to `component()`, or `section()`)
 * can push its own frame, run, and pop the captured HTML back out —
 * that's how component children / layout sections capture nested markup.
 *
 * Templates are trusted code (compiled with `new Function`), same trust
 * model as EJS — never compile a template sourced from user input.
 */
export function compile(template: string): CompiledView {
  let cursor = 0;
  let body = "";
  let match: RegExpExecArray | null;

  TAG.lastIndex = 0;

  while ((match = TAG.exec(template))) {
    const literal = template.slice(cursor, match.index);
    body += `__write(${JSON.stringify(literal)});\n`;

    const [, modifier, code] = match;

    if (modifier === "=") {
      body += `__write(__escape(${code.trim()}));\n`;
    } else if (modifier === "-") {
      body += `__write(${code.trim()});\n`;
    } else {
      body += `${code}\n`;
    }

    cursor = match.index + match[0].length;
  }

  body += `__write(${JSON.stringify(template.slice(cursor))});\n`;

  const render = new Function(
    "__data",
    "__escape",
    "__stack",
    `__stack.push("");
     function __write(__s) { __stack[__stack.length - 1] += __s; }
     with (__data) {
       ${body}
     }
     return __stack.pop();`
  ) as (data: Record<string, unknown>, escape: typeof escapeHtml, stack: Stack) => string;

  return (data: Record<string, unknown> = {}, stack: Stack = []) => render(data, escapeHtml, stack);
}
