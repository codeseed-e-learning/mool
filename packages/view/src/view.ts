import { readFileSync, statSync } from "node:fs";
import path from "node:path";

import { compile, type CompiledView, type Stack } from "./engine.js";

interface CacheEntry {
  mtimeMs: number;
  render: CompiledView;
}

const cache = new Map<string, CacheEntry>();
const MAX_LAYOUT_DEPTH = 20;

// Views/layouts/components are read straight off disk (not through the
// ES module graph), so a process-level watcher like `tsx watch` never
// sees them change. Caching by (path, mtime) instead of just path means
// an edit is picked up on the very next render — no restart needed —
// while a repeat render of an unchanged file still hits the cache.
function compileFile(filePath: string, kind: string): CompiledView {
  let mtimeMs: number;

  try {
    mtimeMs = statSync(filePath).mtimeMs;
  } catch {
    throw new Error(`${kind} not found at ${filePath}`);
  }

  const cached = cache.get(filePath);

  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.render;
  }

  const render = compile(readFileSync(filePath, "utf-8"));
  cache.set(filePath, { mtimeMs, render });

  return render;
}

function capture(stack: Stack, fn: () => void): string {
  stack.push("");
  fn();
  return stack.pop() as string;
}

interface LayoutCall {
  name: string;
  data: Record<string, unknown>;
}

export class View {
  /**
   * Renders resources/views/<name>.html with the given data.
   *
   * Two helpers are always in scope inside a template:
   *
   *   layout("layouts/app", { title })
   *     Wraps this view's rendered output in
   *     resources/views/layouts/app.html. The layout receives `data`
   *     merged with the object passed here, plus `children` — the
   *     rendered body of this view — mirroring a React layout's
   *     `{ children }` prop. Layouts may call layout() again to nest.
   *
   *   component("Card", { title }, function () { %> ...markup... <% });
   *     Renders resources/views/components/Card.html with `props`, like
   *     a React component. The optional third argument is a children
   *     callback — the markup it emits is captured and passed to the
   *     component as `children` (React's `props.children`). A plain
   *     string can be passed as `props.children` instead when there's
   *     no markup to capture.
   *
   *     Always call component() as a bare statement inside `<% %>`
   *     (not `<%- %>`/`<%= %>`) — it writes its own output directly so
   *     the children callback's markup can span multiple template tags,
   *     the same way `<% if (...) { %>` already does. Wrapping it in
   *     `<%- %>` would write the output twice.
   *
   * Compiled templates are cached by resolved file path.
   */
  static render(
    name: string,
    data: Record<string, unknown> = {},
    viewsDir = path.resolve(process.cwd(), "resources", "views")
  ): string {
    const stack: Stack = [];
    let layoutCall: LayoutCall | undefined;

    const helpers = {
      component(
        componentName: string,
        props: Record<string, unknown> = {},
        childrenFn?: () => void
      ): string {
        const children =
          typeof childrenFn === "function" ? capture(stack, childrenFn) : (props.children ?? "");

        const filePath = path.join(viewsDir, "components", `${componentName}.html`);
        const render = compileFile(filePath, `Component "${componentName}"`);
        const html = render({ ...helpers, ...props, children }, stack);

        // Self-write into the caller's current frame rather than
        // returning — see the class doc comment on why component() must
        // be called as a bare `<% %>` statement.
        stack[stack.length - 1] += html;

        return html;
      },
      layout(layoutName: string, layoutData: Record<string, unknown> = {}): void {
        layoutCall = { name: layoutName, data: layoutData };
      },
    };

    const filePath = path.join(viewsDir, `${name}.html`);
    const render = compileFile(filePath, `View "${name}"`);

    let output = render({ ...helpers, ...data }, stack);
    let depth = 0;

    while (layoutCall) {
      if (++depth > MAX_LAYOUT_DEPTH) {
        throw new Error(
          `Layout nesting exceeded ${MAX_LAYOUT_DEPTH} levels while rendering "${name}" — check for a layout() cycle.`
        );
      }

      const { name: layoutName, data: layoutData } = layoutCall;
      layoutCall = undefined;

      const layoutPath = path.join(viewsDir, `${layoutName}.html`);
      const renderLayout = compileFile(layoutPath, `Layout "${layoutName}"`);

      output = renderLayout({ ...helpers, ...data, ...layoutData, children: output }, stack);
    }

    return output;
  }

  static clearCache(): void {
    cache.clear();
  }
}
