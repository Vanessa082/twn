import { Fragment } from "react";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Underlines the words of `query` that appear (as prefixes) in `text`. */
export default function Highlight({ text, query }: { text: string; query: string }) {
  const words = query
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .map(escapeRegExp);
  if (words.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(\\b(?:${words.join("|")})[\\w'’-]*)`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="bg-transparent text-inherit underline decoration-ink-accent decoration-2 underline-offset-4"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
