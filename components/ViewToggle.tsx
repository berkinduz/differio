"use client";

export type View = "side" | "unified";

export function ViewToggle({ view, setView }: { view: View; setView: (v: View) => void }) {
  const views: View[] = ["side", "unified"];
  return (
    <div
      style={{
        display: "inline-flex",
        padding: 3,
        background: "var(--bg-raised)",
        borderRadius: 6,
        border: "1px solid var(--divider)",
      }}
    >
      {views.map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          style={{
            padding: "6px 12px",
            fontSize: 12.5,
            fontWeight: 500,
            borderRadius: 4,
            background: view === v ? "var(--surface)" : "transparent",
            color: view === v ? "var(--fg)" : "var(--fg-muted)",
            boxShadow: view === v ? "0 0 0 1px var(--divider)" : "none",
            transition: "background-color 0.15s ease",
          }}
        >
          {v === "side" ? "Side-by-side" : "Unified"}
        </button>
      ))}
    </div>
  );
}
