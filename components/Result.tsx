"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { diffLines, detectLanguage, type DiffOp } from "@/lib/diff";
import { HighlightedLine } from "./Highlight";
import { ViewToggle, type View } from "./ViewToggle";

function SummaryChip({ adds, dels }: { adds: number; dels: number }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 12px",
        background: "var(--bg-raised)",
        border: "1px solid var(--divider)",
        borderRadius: 6,
        fontFamily: "var(--mono)",
        fontSize: 12,
      }}
    >
      <span style={{ color: "var(--add-text)", fontWeight: 500 }}>+{adds} additions</span>
      <span style={{ color: "var(--divider-strong)" }}>·</span>
      <span style={{ color: "var(--del-text)", fontWeight: 500 }}>−{dels} deletions</span>
    </div>
  );
}

function SharePopover({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", onClick), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onClose]);
  const copy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div
      ref={ref}
      className="fade-in"
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        width: 320,
        background: "var(--surface)",
        border: "1px solid var(--divider)",
        borderRadius: 8,
        padding: 14,
        zIndex: 20,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>Shareable link</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          background: "var(--bg-raised)",
          border: "1px solid var(--divider)",
          borderRadius: 5,
          fontFamily: "var(--mono)",
          fontSize: 12.5,
        }}
      >
        <span style={{ color: "var(--fg-subtle)" }}>https://</span>
        <span style={{ color: "var(--fg)", flex: 1 }}>{url.replace(/^https?:\/\//, "")}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--fg-muted)" }}>
          <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} />
          Expire in 7 days
        </label>
        <button className="btn btn-primary" onClick={copy} style={{ padding: "6px 12px", fontSize: 12.5 }}>
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function LineNum({ n }: { n: number | string | null }) {
  return (
    <div
      style={{
        color: "var(--fg-subtle)",
        textAlign: "right",
        paddingRight: 10,
        fontSize: 11,
        userSelect: "none",
        fontFamily: "var(--mono)",
        minWidth: 44,
      }}
    >
      {n ?? ""}
    </div>
  );
}

function UnifiedView({ ops }: { ops: DiffOp[] }) {
  let oln = 0;
  let mln = 0;
  const rows = ops.map((op, i) => {
    if (op.type === "keep") {
      oln++;
      mln++;
      return { ...op, oln, mln, key: i };
    }
    if (op.type === "del") {
      oln++;
      return { ...op, oln, key: i };
    }
    mln++;
    return { ...op, mln, key: i };
  });

  return (
    <div style={{ fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.7, background: "var(--surface)" }}>
      {rows.map((r) => {
        const bg = r.type === "add" ? "var(--add-bg)" : r.type === "del" ? "var(--del-bg)" : "transparent";
        const gutter =
          r.type === "add" ? "var(--add-gutter)" : r.type === "del" ? "var(--del-gutter)" : "transparent";
        const sign = r.type === "add" ? "+" : r.type === "del" ? "−" : " ";
        const signColor =
          r.type === "add" ? "var(--add-text)" : r.type === "del" ? "var(--del-text)" : "var(--fg-subtle)";
        const text = r.type === "del" ? r.a : r.type === "add" ? r.b : r.a;
        const ol = r.type !== "add" ? (r as { oln: number }).oln : "";
        const ml = r.type !== "del" ? (r as { mln: number }).mln : "";
        return (
          <div
            key={r.key}
            style={{
              display: "grid",
              gridTemplateColumns: "4px 52px 52px 22px 1fr",
              background: bg,
            }}
          >
            <div style={{ background: gutter }} />
            <LineNum n={ol} />
            <LineNum n={ml} />
            <div style={{ color: signColor, textAlign: "center", fontWeight: 500, userSelect: "none" }}>{sign}</div>
            <div style={{ paddingRight: 24, whiteSpace: "pre", overflowX: "hidden" }}>
              <HighlightedLine text={text} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type Pair = {
  type: "keep" | "del" | "add" | "change";
  left: string | null;
  right: string | null;
  oln: number | null;
  mln: number | null;
};

function pairOps(ops: DiffOp[]): Pair[] {
  const rows: Pair[] = [];
  let i = 0;
  let oln = 0;
  let mln = 0;
  while (i < ops.length) {
    const op = ops[i];
    if (op.type === "keep") {
      oln++;
      mln++;
      rows.push({ type: "keep", left: op.a, right: op.b, oln, mln });
      i++;
    } else if (op.type === "del") {
      const dels: Extract<DiffOp, { type: "del" }>[] = [];
      while (i < ops.length && ops[i].type === "del") {
        dels.push(ops[i] as Extract<DiffOp, { type: "del" }>);
        i++;
      }
      const adds: Extract<DiffOp, { type: "add" }>[] = [];
      while (i < ops.length && ops[i].type === "add") {
        adds.push(ops[i] as Extract<DiffOp, { type: "add" }>);
        i++;
      }
      const max = Math.max(dels.length, adds.length);
      for (let k = 0; k < max; k++) {
        const d = dels[k];
        const a = adds[k];
        if (d) oln++;
        if (a) mln++;
        rows.push({
          type: d && a ? "change" : d ? "del" : "add",
          left: d ? d.a : null,
          right: a ? a.b : null,
          oln: d ? oln : null,
          mln: a ? mln : null,
        });
      }
    } else {
      mln++;
      rows.push({ type: "add", left: null, right: op.b, oln: null, mln });
      i++;
    }
  }
  return rows;
}

function SideBySideView({ ops }: { ops: DiffOp[] }) {
  const rows = useMemo(() => pairOps(ops), [ops]);
  const leftBg = (t: Pair["type"]) => (t === "del" || t === "change" ? "var(--del-bg)" : "transparent");
  const rightBg = (t: Pair["type"]) => (t === "add" || t === "change" ? "var(--add-bg)" : "transparent");
  const leftGutter = (t: Pair["type"]) =>
    t === "del" || t === "change" ? "var(--del-gutter)" : "transparent";
  const rightGutter = (t: Pair["type"]) =>
    t === "add" || t === "change" ? "var(--add-gutter)" : "transparent";

  return (
    <div
      style={{
        fontFamily: "var(--mono)",
        fontSize: 13,
        lineHeight: 1.7,
        background: "var(--surface)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          fontFamily: "var(--sans)",
          fontSize: 11.5,
          letterSpacing: "0.04em",
          color: "var(--fg-muted)",
          fontWeight: 500,
          borderBottom: "1px solid var(--divider)",
          borderRight: "1px solid var(--divider)",
          background: "var(--bg-raised)",
        }}
      >
        ORIGINAL
      </div>
      <div
        style={{
          padding: "10px 16px",
          fontFamily: "var(--sans)",
          fontSize: 11.5,
          letterSpacing: "0.04em",
          color: "var(--fg-muted)",
          fontWeight: 500,
          borderBottom: "1px solid var(--divider)",
          background: "var(--bg-raised)",
        }}
      >
        MODIFIED
      </div>

      {rows.map((r, i) => (
        <div key={i} style={{ display: "contents" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "4px 44px 18px 1fr",
              background: leftBg(r.type),
              borderRight: "1px solid var(--divider)",
            }}
          >
            <div style={{ background: leftGutter(r.type) }} />
            <LineNum n={r.oln} />
            <div
              style={{
                color: r.type === "del" || r.type === "change" ? "var(--del-text)" : "var(--fg-subtle)",
                textAlign: "center",
                fontWeight: 500,
                userSelect: "none",
              }}
            >
              {r.type === "del" || r.type === "change" ? "−" : r.left != null ? " " : ""}
            </div>
            <div style={{ paddingRight: 16, whiteSpace: "pre", overflowX: "hidden" }}>
              <HighlightedLine text={r.left} />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "4px 44px 18px 1fr",
              background: rightBg(r.type),
            }}
          >
            <div style={{ background: rightGutter(r.type) }} />
            <LineNum n={r.mln} />
            <div
              style={{
                color: r.type === "add" || r.type === "change" ? "var(--add-text)" : "var(--fg-subtle)",
                textAlign: "center",
                fontWeight: 500,
                userSelect: "none",
              }}
            >
              {r.type === "add" || r.type === "change" ? "+" : r.right != null ? " " : ""}
            </div>
            <div style={{ paddingRight: 16, whiteSpace: "pre", overflowX: "hidden" }}>
              <HighlightedLine text={r.right} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Result({
  original,
  modified,
  view,
  setView,
  onHome,
  onEdit,
  onNew,
}: {
  original: string;
  modified: string;
  view: View;
  setView: (v: View) => void;
  onHome: () => void;
  onEdit: () => void;
  onNew: () => void;
}) {
  const ops = useMemo(() => diffLines(original, modified), [original, modified]);
  const adds = ops.filter((o) => o.type === "add").length;
  const dels = ops.filter((o) => o.type === "del").length;
  const language = useMemo(() => detectLanguage(modified || original), [original, modified]);

  const [sharing, setSharing] = useState(false);
  const shareUrl = useMemo(() => {
    let h = 0;
    const s = original + "\u0001" + modified;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    const code = Math.abs(h).toString(36).slice(0, 6).padEnd(6, "a");
    return `differio.app/d/${code}`;
  }, [original, modified]);

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: "1px solid var(--divider)",
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 32px",
          borderBottom: "1px solid var(--divider)",
          gap: 16,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ViewToggle view={view} setView={setView} />
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11.5,
              color: "var(--fg-muted)",
              padding: "5px 9px",
              border: "1px solid var(--divider)",
              borderRadius: 5,
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ color: "var(--fg-subtle)" }}>lang: </span>
            {language}
          </div>
          <SummaryChip adds={adds} dels={dels} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <button className="btn btn-ghost" onClick={onEdit} style={{ fontSize: 13 }}>
            Edit
          </button>
          <button className="btn btn-ghost" onClick={onNew} style={{ fontSize: 13 }}>
            New diff
          </button>
          <div style={{ position: "relative" }}>
            <button
              className="btn btn-primary"
              onClick={() => setSharing((s) => !s)}
              style={{ padding: "9px 16px" }}
            >
              Share
            </button>
            {sharing && <SharePopover url={shareUrl} onClose={() => setSharing(false)} />}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "14px 32px 0",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--fg-muted)",
        }}
      >
        <span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>pricing.ts</span>
        <span style={{ fontSize: 11, color: "var(--fg-subtle)" }}>— edited just now</span>
      </div>

      <div style={{ padding: "14px 32px 32px", flex: 1 }}>
        <div
          style={{
            border: "1px solid var(--divider)",
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--surface)",
          }}
        >
          {view === "unified" ? <UnifiedView ops={ops} /> : <SideBySideView ops={ops} />}
        </div>
      </div>
    </div>
  );
}
