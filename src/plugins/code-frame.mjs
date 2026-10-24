// Shiki transformer: wraps code blocks in a header (language, title="...")
// and marks text given as mark="..." in the fence info string.
const LABELS = { shellsession: "terminal", js: "javascript", ts: "typescript" };

const el = (tagName, properties, children) => ({ type: "element", tagName, properties, children });
const text = (value) => ({ type: "text", value });
const classOf = (node) => String(node.properties?.class ?? node.properties?.className ?? "");
const hasClass = (node, name) => classOf(node).split(/[\s,]+/).includes(name);

// Splits the tokens of a line so each occurrence of a word gets its own span.
function markLine(line, words) {
  const tokens = line.children.filter((c) => c.type === "element");
  const full = tokens.map((t) => t.children.map((c) => c.value ?? "").join("")).join("");
  const ranges = [];
  for (const word of words) {
    for (let at = full.indexOf(word); at !== -1; at = full.indexOf(word, at + word.length)) {
      ranges.push([at, at + word.length]);
    }
  }
  if (!ranges.length) return;

  const out = [];
  let offset = 0;
  for (const token of tokens) {
    const value = token.children.map((c) => c.value ?? "").join("");
    const end = offset + value.length;
    const cuts = new Set([0, value.length]);
    for (const [from, to] of ranges) {
      if (from > offset && from < end) cuts.add(from - offset);
      if (to > offset && to < end) cuts.add(to - offset);
    }
    const points = [...cuts].sort((a, b) => a - b);
    for (let i = 0; i < points.length - 1; i++) {
      const piece = value.slice(points[i], points[i + 1]);
      const start = offset + points[i];
      const inside = ranges.some(([from, to]) => start >= from && start < to);
      const props = { ...token.properties };
      if (inside) props.class = `${classOf(token)} highlighted-word`.trim();
      out.push(el(token.tagName, props, [text(piece)]));
    }
    offset = end;
  }
  line.children = out;
}

export function codeFrame() {
  return {
    name: "code-frame",
    // title and mark are removed from the meta so other transformers don't parse them
    preprocess(_code, options) {
      const meta = options.meta;
      if (!meta?.__raw) return;
      meta.__marks = [...meta.__raw.matchAll(/mark="([^"]*)"/g)].map((m) => m[1]);
      meta.__title = /title="([^"]*)"/.exec(meta.__raw)?.[1];
      meta.__raw = meta.__raw.replace(/(?:title|mark)="[^"]*"/g, "");
    },
    root(root) {
      const lang = this.options.lang;
      const { __title: title, __marks: marks = [] } = this.options.meta ?? {};

      if (marks.length) {
        const pre = root.children.find((c) => c.tagName === "pre");
        const code = pre?.children.find((c) => c.tagName === "code");
        code?.children.filter((c) => c.type === "element" && hasClass(c, "line")).forEach((l) => markLine(l, marks));
      }

      const header = el("div", { class: "code-h" }, [
        el("span", { class: "lang" }, [text(LABELS[lang] ?? lang)]),
        ...(title ? [el("span", { class: "file" }, [text(title)])] : []),
      ]);
      root.children = [el("div", { class: "code", "data-lang": lang }, [header, ...root.children])];
    },
  };
}
