"use client";

import { useEffect, useMemo } from "react";
import { SAMPLE_ORIGINAL, SAMPLE_MODIFIED, detectLanguage } from "@/lib/diff";
import { ViewToggle, type View } from "./ViewToggle";

function ToolNav({ onHome }: { onHome: () => void }) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        borderBottom: "1px solid var(--divider)",
        background: "var(--bg)",
      }}
    >
      <button onClick={onHome} className="wordmark" style={{ padding: 0, cursor: "pointer" }}>
        differio<span className="dot">.</span>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13, color: "var(--fg-muted)" }}>
        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
          Docs
        </a>
        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
          GitHub
        </a>
      </div>
    </nav>
  );
}

function ControlBar({
  view,
  setView,
  language,
  onCompare,
  canCompare,
  onSwap,
  onClear,
}: {
  view: View;
  setView: (v: View) => void;
  language: string;
  onCompare: () => void;
  canCompare: boolean;
  onSwap: () => void;
  onClear: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 32px",
        borderBottom: "1px solid var(--divider)",
        background: "var(--bg)",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ViewToggle view={view} setView={setView} />
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11.5,
            color: language === "auto" ? "var(--fg-subtle)" : "var(--fg-muted)",
            padding: "5px 9px",
            border: "1px solid var(--divider)",
            borderRadius: 5,
            letterSpacing: "0.02em",
          }}
        >
          <span style={{ color: "var(--fg-subtle)" }}>lang: </span>
          {language}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn btn-ghost" onClick={onSwap} style={{ fontSize: 13 }}>
          Swap
        </button>
        <button className="btn btn-ghost" onClick={onClear} style={{ fontSize: 13 }}>
          Clear
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="kbd">⌘</span>
          <span className="kbd">↵</span>
          <button
            className="btn btn-primary"
            onClick={onCompare}
            disabled={!canCompare}
            style={{
              opacity: canCompare ? 1 : 0.45,
              cursor: canCompare ? "pointer" : "not-allowed",
              padding: "9px 18px",
            }}
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}

function PasteArea({
  label,
  value,
  onChange,
  placeholder,
  onUseSample,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onUseSample: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-raised)",
        border: "1px solid var(--divider)",
        borderRadius: 8,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid var(--divider)",
          fontSize: 12,
          color: "var(--fg-muted)",
        }}
      >
        <span style={{ letterSpacing: "0.02em", fontWeight: 500 }}>{label}</span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "var(--fg-subtle)", fontFamily: "var(--mono)", fontSize: 11 }}>
            {value ? `${value.split("\n").length} lines` : "—"}
          </span>
          {!value && (
            <button
              onClick={onUseSample}
              style={{
                fontSize: 11.5,
                color: "var(--accent)",
                padding: 0,
                textDecoration: "underline",
                textUnderlineOffset: 2,
                textDecorationThickness: 1,
              }}
            >
              use sample
            </button>
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          flex: 1,
          minHeight: 340,
          padding: "16px 18px",
          border: "none",
          outline: "none",
          resize: "none",
          background: "transparent",
          color: "var(--fg)",
          fontFamily: "var(--mono)",
          fontSize: 13,
          lineHeight: 1.7,
          width: "100%",
        }}
      />
    </div>
  );
}

export function Tool({
  original,
  modified,
  setOriginal,
  setModified,
  view,
  setView,
  onCompare,
  onHome,
}: {
  original: string;
  modified: string;
  setOriginal: (v: string) => void;
  setModified: (v: string) => void;
  view: View;
  setView: (v: View) => void;
  onCompare: () => void;
  onHome: () => void;
}) {
  const language = useMemo(() => detectLanguage(modified || original), [original, modified]);
  const canCompare = original.trim().length > 0 && modified.trim().length > 0 && original !== modified;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canCompare) {
        e.preventDefault();
        onCompare();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [canCompare, onCompare]);

  const onSwap = () => {
    const t = original;
    setOriginal(modified);
    setModified(t);
  };
  const onClear = () => {
    setOriginal("");
    setModified("");
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <ToolNav onHome={onHome} />
      <ControlBar
        view={view}
        setView={setView}
        language={language}
        onCompare={onCompare}
        canCompare={canCompare}
        onSwap={onSwap}
        onClear={onClear}
      />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          padding: "24px 32px 32px",
        }}
      >
        <PasteArea
          label="ORIGINAL"
          value={original}
          onChange={setOriginal}
          placeholder="Paste original"
          onUseSample={() => setOriginal(SAMPLE_ORIGINAL)}
        />
        <PasteArea
          label="MODIFIED"
          value={modified}
          onChange={setModified}
          placeholder="Paste modified"
          onUseSample={() => setModified(SAMPLE_MODIFIED)}
        />
      </div>

      <div
        style={{
          padding: "0 32px 24px",
          color: "var(--fg-subtle)",
          fontSize: 12,
          display: "flex",
          gap: 20,
        }}
      >
        <span>No accounts. Nothing leaves your browser until you hit share.</span>
      </div>
    </div>
  );
}
