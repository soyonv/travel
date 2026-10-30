import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function inline(text: string, keyPrefix = ""): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${index++}`;
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-bold text-ink-900">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-ivory-200 px-1.5 py-0.5 text-[0.9em] text-forest-900">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const internal = href.startsWith("/") && !href.startsWith("//");
        nodes.push(
          internal ? (
            <Link key={key} href={href}>
              {label}
            </Link>
          ) : (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">
              {label}
            </a>
          ),
        );
      }
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "hr" };

function parse(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      blocks.push({ type: "heading", level: 3, text: trimmed.replace(/^###\s+/, "") });
      index += 1;
      continue;
    }
    if (/^##\s+/.test(trimmed)) {
      blocks.push({ type: "heading", level: 2, text: trimmed.replace(/^##\s+/, "") });
      index += 1;
      continue;
    }
    if (/^---+$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }
    if (trimmed.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }
    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      const cells = tableLines
        .filter((row) => !/^\|?[\s:|-]+\|?$/.test(row))
        .map((row) =>
          row
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((cell) => cell.trim()),
        );
      if (cells.length) {
        blocks.push({ type: "table", head: cells[0], rows: cells.slice(1) });
      }
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{2,3}\s|>\s?|[-*]\s|\d+[.)]\s|\||---)/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = parse(content);
  return (
    <div className={cn("prose-editorial", className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h2 key={i}>{inline(block.text, `h${i}`)}</h2>
            ) : (
              <h3 key={i}>{inline(block.text, `h${i}`)}</h3>
            );
          case "paragraph":
            return <p key={i}>{inline(block.text, `p${i}`)}</p>;
          case "ul":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item, `u${i}${j}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item, `o${i}${j}`)}</li>
                ))}
              </ol>
            );
          case "quote":
            return <blockquote key={i}>{inline(block.text, `q${i}`)}</blockquote>;
          case "table":
            return (
              <div key={i} className="my-6 overflow-x-auto rounded-xl border border-ink-900/10">
                <table className="w-full border-collapse text-left text-[15px]">
                  <thead className="bg-ivory-100">
                    <tr>
                      {block.head.map((cell, j) => (
                        <th key={j} className="border-b border-ink-900/10 px-4 py-2.5 font-semibold text-forest-900">
                          {inline(cell, `th${i}${j}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j} className="even:bg-ivory-50/60">
                        {row.map((cell, k) => (
                          <td key={k} className="border-b border-ink-900/5 px-4 py-2.5 align-top">
                            {inline(cell, `td${i}${j}${k}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "hr":
            return <hr key={i} className="my-8 border-ink-900/10" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
