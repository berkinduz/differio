"use client";

import { diffLines } from "@/lib/diff";
import { HighlightedLine } from "./Highlight";

function Nav({ onLaunch }: { onLaunch: () => void }) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 40px",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <div className="wordmark">
        differio<span className="dot">.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <a href="#" style={{ color: "var(--fg-muted)", textDecoration: "none", fontSize: 14 }}>
          Docs
        </a>
        <a href="#" style={{ color: "var(--fg-muted)", textDecoration: "none", fontSize: 14 }}>
          GitHub
        </a>
        <button
          className="btn btn-primary"
          onClick={onLaunch}
          style={{ padding: "8px 14px", fontSize: 13 }}
        >
          Open diff
        </button>
      </div>
    </nav>
  );
}

function HeroDiff() {
  const original = `function formatPrice(amount, currency) {
  const symbol = currency === "USD" ? "$" : "€";
  return symbol + amount.toFixed(2);
}`;
  const modified = `function formatPrice(amount, currency = "USD") {
  const symbols = { USD: "$", EUR: "€", GBP: "£" };
  const symbol = symbols[currency] ?? currency;
  return \`\${symbol}\${amount.toFixed(2)}\`;
}`;
  const ops = diffLines(original, modified);

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
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--divider)",
        borderRadius: 10,
        overflow: "hidden",
        fontFamily: "var(--mono)",
        fontSize: 12.5,
        lineHeight: 1.7,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--divider)",
          background: "var(--bg-raised)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--fg-muted)" }}>
            pricing.ts
          </span>
          <span
            style={{
              fontFamily: "var(--sans)",
              fontSize: 11,
              padding: "2px 7px",
              borderRadius: 4,
              background: "var(--accent-soft)",
              color: "var(--accent)",
              letterSpacing: "0.02em",
            }}
          >
            typescript
          </span>
        </div>
        <div style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--fg-subtle)" }}>
          <span style={{ color: "var(--add-text)" }}>+3</span>
          <span style={{ margin: "0 8px", color: "var(--divider-strong)" }}>·</span>
          <span style={{ color: "var(--del-text)" }}>−2</span>
        </div>
      </div>

      <div style={{ padding: "10px 0" }}>
        {rows.map((r) => {
          const bg = r.type === "add" ? "var(--add-bg)" : r.type === "del" ? "var(--del-bg)" : "transparent";
          const gutterColor =
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
                gridTemplateColumns: "3px 38px 38px 18px 1fr",
                background: bg,
                alignItems: "stretch",
              }}
            >
              <div style={{ background: gutterColor }} />
              <div style={{ color: "var(--fg-subtle)", textAlign: "right", paddingRight: 8, fontSize: 11 }}>
                {ol}
              </div>
              <div style={{ color: "var(--fg-subtle)", textAlign: "right", paddingRight: 8, fontSize: 11 }}>
                {ml}
              </div>
              <div style={{ color: signColor, textAlign: "center", fontWeight: 500 }}>{sign}</div>
              <div style={{ paddingRight: 16, overflow: "hidden" }}>
                <HighlightedLine text={text} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Hero({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "80px 40px 60px",
        display: "grid",
        gridTemplateColumns: "1fr 1.15fr",
        gap: 80,
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--fg-muted)",
            padding: "5px 10px",
            borderRadius: 20,
            border: "1px solid var(--divider)",
            marginBottom: 28,
            letterSpacing: "0.02em",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          A diff checker that respects your time
        </div>

        <h1
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 400,
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
            fontSize: "clamp(44px, 5.2vw, 76px)",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            margin: "0 0 24px 0",
            color: "var(--fg)",
          }}
        >
          See what
          <br />
          <span style={{ fontStyle: "italic", fontWeight: 400 }}>changed.</span>
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            color: "var(--fg-muted)",
            maxWidth: 440,
            margin: "0 0 36px 0",
          }}
        >
          Paste two texts. Get the diff. That&apos;s the entire product — no ads, no accounts, no upsell to a &ldquo;pro tier.&rdquo;
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="btn btn-primary" onClick={onLaunch} style={{ padding: "12px 20px", fontSize: 15 }}>
            Start a diff
            <span style={{ opacity: 0.75 }}>→</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--fg-subtle)", fontSize: 13 }}>
            <span className="kbd">⌘</span>
            <span className="kbd">↵</span>
            <span>to compare</span>
          </div>
        </div>
      </div>

      <HeroDiff />
    </section>
  );
}

function Features() {
  const items = [
    {
      title: "Side-by-side or unified",
      body: "Two layouts, one keystroke apart. Stay in whichever mode fits the change.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3">
          <rect x="2" y="4" width="8" height="14" rx="1" />
          <rect x="12" y="4" width="8" height="14" rx="1" />
        </svg>
      ),
    },
    {
      title: "Language auto-detect",
      body: "Paste TypeScript, Rust, YAML, SQL, or plain prose. Syntax colors follow.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M7 5 L3 11 L7 17" />
          <path d="M15 5 L19 11 L15 17" />
          <path d="M12 4 L10 18" />
        </svg>
      ),
    },
    {
      title: "Shareable shortlinks",
      body: "One click for differio.app/d/a1b2c3. Expires when you say so, not before.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M9 13 L13 9" />
          <path d="M8 6 L10 4 A3 3 0 0 1 14 8 L12 10" />
          <path d="M14 16 L12 18 A3 3 0 0 1 8 14 L10 12" />
        </svg>
      ),
    },
  ];

  return (
    <section
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "80px 40px 60px",
        borderTop: "1px solid var(--divider)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48 }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ color: "var(--accent)", marginBottom: 16 }}>{item.icon}</div>
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 500,
                fontSize: 20,
                letterSpacing: "-0.015em",
                margin: "0 0 8px 0",
                color: "var(--fg)",
              }}
            >
              {item.title}
            </h3>
            <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.55 }}>
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "40px 40px 56px",
        borderTop: "1px solid var(--divider)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 13,
        color: "var(--fg-subtle)",
      }}
    >
      <div>
        <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--fg-muted)" }}>
          Differio
        </span>{" "}
        — made to stay small. © 2026.
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
          Privacy
        </a>
        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
          GitHub
        </a>
        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
          Contact
        </a>
      </div>
    </footer>
  );
}

export function Landing({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="fade-in">
      <Nav onLaunch={onLaunch} />
      <Hero onLaunch={onLaunch} />
      <Features />
      <Footer />
    </div>
  );
}
