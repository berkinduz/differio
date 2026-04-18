"use client";

import { useEffect, useState } from "react";
import { Landing } from "@/components/Landing";
import { Tool } from "@/components/Tool";
import { Result } from "@/components/Result";
import { SAMPLE_ORIGINAL, SAMPLE_MODIFIED } from "@/lib/diff";
import type { View } from "@/components/ViewToggle";

type Screen = "landing" | "tool" | "result";

export default function Page() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [view, setView] = useState<View>("side");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("differio:state") || "{}");
      if (saved.screen) setScreen(saved.screen);
      if (saved.original != null) setOriginal(saved.original);
      if (saved.modified != null) setModified(saved.modified);
      if (saved.view) setView(saved.view);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        "differio:state",
        JSON.stringify({ screen, original, modified, view })
      );
    } catch {}
  }, [hydrated, screen, original, modified, view]);

  const goTool = () => {
    if (!original && !modified) {
      setOriginal(SAMPLE_ORIGINAL);
      setModified(SAMPLE_MODIFIED);
    }
    setScreen("tool");
  };
  const goHome = () => setScreen("landing");
  const goResult = () => setScreen("result");
  const goEdit = () => setScreen("tool");
  const goNew = () => {
    setOriginal("");
    setModified("");
    setScreen("tool");
  };

  if (screen === "tool") {
    return (
      <Tool
        original={original}
        modified={modified}
        setOriginal={setOriginal}
        setModified={setModified}
        view={view}
        setView={setView}
        onCompare={goResult}
        onHome={goHome}
      />
    );
  }
  if (screen === "result") {
    return (
      <Result
        original={original}
        modified={modified}
        view={view}
        setView={setView}
        onHome={goHome}
        onEdit={goEdit}
        onNew={goNew}
      />
    );
  }
  return <Landing onLaunch={goTool} />;
}
