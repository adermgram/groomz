"use client";
import { useEffect, useState } from "react";

/** Small theme switch for pages outside the landing page. Shares the `grooms-theme` key. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.getAttribute("data-theme") === "dark"), []);
  return (
    <button
      type="button"
      className="theme-btn"
      aria-label="Toggle light or dark mode"
      onClick={() => {
        const next = dark ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("grooms-theme", next); } catch {}
        setDark(!dark);
      }}
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
