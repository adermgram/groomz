"use client";
import { useEffect, useRef } from "react";
import { initLanding } from "../lib/landing";

export default function Landing({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Re-mount fresh nodes before wiring behaviour, so a repeated effect run
    // (React strict mode in dev) can never leave duplicate listeners behind.
    el.innerHTML = html;
    return initLanding();
  }, [html]);
  return <div className="page" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
