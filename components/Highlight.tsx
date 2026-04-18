import { tokenize, type Token } from "@/lib/diff";

const COLORS: Record<Token["t"], string> = {
  kw: "var(--tok-kw)",
  string: "var(--tok-string)",
  num: "var(--tok-num)",
  comment: "var(--tok-comment)",
  id: "var(--tok-id)",
  punct: "var(--tok-punct)",
  ws: "inherit",
};

export function HighlightedLine({ text }: { text: string | null | undefined }) {
  if (text == null) return null;
  const toks = tokenize(text);
  return (
    <>
      {toks.map((t, i) => (
        <span key={i} style={{ color: COLORS[t.t], whiteSpace: "pre" }}>
          {t.v}
        </span>
      ))}
    </>
  );
}
