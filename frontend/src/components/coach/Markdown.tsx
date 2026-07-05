import type { ReactNode } from "react";

/**
 * Minimal, safe markdown-ish renderer for coach replies.
 *
 * Supports **bold**, `code`, bullet lists, and paragraphs. It does NOT use
 * dangerouslySetInnerHTML — everything is rendered as React nodes, so there's
 * no XSS surface even though replies come from an LLM.
 */

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on **bold** and `code` while keeping delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  parts.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={`${keyBase}-b-${i}`} className="font-semibold text-cream">
          {part.slice(2, -2)}
        </strong>,
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(
        <code
          key={`${keyBase}-c-${i}`}
          className="rounded bg-white/10 px-1 py-0.5 text-xs text-cyan-300"
        >
          {part.slice(1, -1)}
        </code>,
      );
    } else if (part) {
      nodes.push(part);
    }
  });
  return nodes;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={key} className="my-1 list-disc space-y-1 pl-5">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item, `${key}-${i}`)}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
    } else {
      flushList(`ul-${i}`);
      blocks.push(
        <p key={`p-${i}`} className="my-1 leading-relaxed">
          {renderInline(trimmed, `p-${i}`)}
        </p>,
      );
    }
  });
  flushList("ul-final");

  return <div className="text-sm text-slate-200">{blocks}</div>;
}
