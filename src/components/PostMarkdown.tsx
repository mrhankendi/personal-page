/**
 * Renders AI-generated Markdown from posts.json.
 * Groups content into sections for richer styling:
 *   - TL;DR → blue callout box
 *   - Key Results → green box with checkmark bullets
 *   - All other ## headings → accent left-border style
 * Does not render *italic* — strips asterisks as plain text.
 */

type Token =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "bullet"; text: string }
  | { type: "image"; alt: string; src: string }
  | { type: "paragraph"; text: string }
  | { type: "blank" };

type Section = {
  heading: string | null;
  tokens: Token[];
};

function tokenize(markdown: string): Token[] {
  const tokens: Token[] = [];
  for (const raw of markdown.split("\n")) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      tokens.push({ type: "blank" });
    } else if (line.startsWith("### ")) {
      tokens.push({ type: "h3", text: line.slice(4).trim() });
    } else if (line.startsWith("## ")) {
      tokens.push({ type: "h2", text: line.slice(3).trim() });
    } else if (/^[-*] /.test(line)) {
      tokens.push({ type: "bullet", text: line.slice(2).trim() });
    } else if (/^!\[.*?\]\(.+?\)$/.test(line.trim())) {
      const m = /^!\[(.*?)\]\((.+?)\)$/.exec(line.trim());
      if (!m) continue;
      tokens.push({ type: "image", alt: m[1], src: m[2] });
    } else {
      tokens.push({ type: "paragraph", text: line.trim() });
    }
  }
  return tokens;
}

function groupSections(tokens: Token[]): Section[] {
  const sections: Section[] = [];
  let current: Section = { heading: null, tokens: [] };
  for (const tok of tokens) {
    if (tok.type === "h2") {
      if (current.tokens.length > 0 || current.heading !== null) {
        sections.push(current);
      }
      current = { heading: tok.text, tokens: [] };
    } else if (tok.type !== "blank") {
      current.tokens.push(tok);
    }
  }
  if (current.tokens.length > 0 || current.heading !== null) {
    sections.push(current);
  }
  return sections;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      return <strong key={`bold-${inner.slice(0, 15)}-${i}`}>{inner}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return part.slice(1, -1);
    }
    return part;
  });
}

function renderBodyTokens(tokens: Token[], checkmarks: boolean): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let idx = 0;

  function flushBullets() {
    if (bulletBuffer.length === 0) return;
    const bullets = [...bulletBuffer];
    bulletBuffer = [];
    if (checkmarks) {
      elements.push(
        <ul key={`ul-${idx++}`} className="space-y-2.5">
          {bullets.map((b, i) => (
            <li key={`${i}-${b.slice(0, 20)}`} className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 font-bold text-emerald-600 dark:text-emerald-400">
                ✓
              </span>
              <span className="text-(--text)">{renderInline(b)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ul key={`ul-${idx++}`} className="ml-5 list-disc space-y-1">
          {bullets.map((b, i) => (
            <li key={`${i}-${b.slice(0, 20)}`} className="text-(--text)">
              {renderInline(b)}
            </li>
          ))}
        </ul>
      );
    }
  }

  for (const tok of tokens) {
    if (tok.type === "bullet") {
      bulletBuffer.push(tok.text);
      continue;
    }
    flushBullets();
    if (tok.type === "h3") {
      elements.push(
        <h3 key={`h3-${idx++}`} className="mt-4 mb-1.5 text-base font-semibold text-(--text)">
          {renderInline(tok.text)}
        </h3>
      );
    } else if (tok.type === "image") {
      elements.push(
        <figure key={`img-${idx++}`} className="my-4">
          <div className="overflow-hidden rounded-xl border border-(--border) bg-(--surface-muted)">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tok.src} alt={tok.alt} className="h-auto w-full object-contain" />
          </div>
          {tok.alt && (
            <figcaption className="mt-2 text-center text-xs text-(--muted-text)">
              {tok.alt}
            </figcaption>
          )}
        </figure>
      );
    } else if (tok.type === "paragraph") {
      elements.push(
        <p key={`p-${idx++}`} className="leading-relaxed text-(--text)">
          {renderInline(tok.text)}
        </p>
      );
    }
  }
  flushBullets();
  return elements;
}

export default function PostMarkdown({ content }: Readonly<{ content: string }>) {
  const tokens = tokenize(content);
  const sections = groupSections(tokens);

  return (
    <div className="space-y-6">
      {sections.map((section, si) => {
        const h = section.heading;
        const isTldr = h?.toUpperCase() === "TL;DR" || h?.toUpperCase() === "TLDR";
        const isHook = !!h && /^hook$/i.test(h.trim());
        const isResults = !!h && /result/i.test(h);
        const isTakeaways = !!h && /takeaway|still matters|why this/i.test(h);
        const sectionKey = h ?? `section-${si}`;

        // Hook: render body only, no heading label
        if (isHook) {
          return (
            <section key={sectionKey}>
              <div className="space-y-3 text-base leading-relaxed">
                {renderBodyTokens(section.tokens, false)}
              </div>
            </section>
          );
        }

        if (isTldr) {
          return (
            <div
              key={sectionKey}
              className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/40 dark:bg-blue-950/20 sm:p-5"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400">
                TL;DR
              </p>
              <div className="space-y-2 text-[0.9375rem]">
                {renderBodyTokens(section.tokens, false)}
              </div>
            </div>
          );
        }

        if (isResults) {
          return (
            <section key={sectionKey}>
              <h2 className="mb-3 border-l-2 border-emerald-500 pl-3 text-xl font-semibold text-emerald-700 dark:border-emerald-500/70 dark:text-emerald-400">
                {h}
              </h2>
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20 sm:p-5">
                {renderBodyTokens(section.tokens, true)}
              </div>
            </section>
          );
        }

        // Takeaways / Why This Still Matters: amber tint
        if (isTakeaways) {
          return (
            <section key={sectionKey}>
              <h2 className="mb-3 border-l-2 border-amber-500 pl-3 text-xl font-semibold text-amber-700 dark:border-amber-500/70 dark:text-amber-400">
                {h}
              </h2>
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-950/20 sm:p-5">
                <div className="space-y-3">
                  {renderBodyTokens(section.tokens, false)}
                </div>
              </div>
            </section>
          );
        }

        if (isTldr) {
          return (
            <div
              key={sectionKey}
              className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/40 dark:bg-blue-950/20 sm:p-5"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400">
                TL;DR
              </p>
              <div className="space-y-2 text-[0.9375rem]">
                {renderBodyTokens(section.tokens, false)}
              </div>
            </div>
          );
        }

        if (isResults) {
          return (
            <section key={sectionKey}>
              <h2 className="mb-3 border-l-2 border-emerald-500 pl-3 text-xl font-semibold text-emerald-700 dark:border-emerald-500/70 dark:text-emerald-400">
                {h}
              </h2>
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20 sm:p-5">
                {renderBodyTokens(section.tokens, true)}
              </div>
            </section>
          );
        }

        return (
          <section key={sectionKey}>
            {h && (
              <h2 className="mb-3 border-l-2 border-(--accent) pl-3 text-xl font-semibold text-(--text)">
                {h}
              </h2>
            )}
            <div className="space-y-3">
              {renderBodyTokens(section.tokens, false)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
