"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "../app/admin/actions";

/** Avatar button (top right of the admin) with an account dropdown. */
export default function ProfileMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="pm" ref={box}>
      <button
        type="button"
        className="pm-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
      >
        {email.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className="pm-menu" role="menu">
          <div className="pm-who">
            <span className="ad-sub">Signed in as</span>
            <b>{email}</b>
          </div>
          <Link href="/admin/profile" role="menuitem" onClick={() => setOpen(false)}>Change password</Link>
          <a href="/" target="_blank" rel="noopener" role="menuitem">View website ↗</a>
          <form action={signOut}>
            <button role="menuitem" className="pm-out">Sign out</button>
          </form>
        </div>
      )}
    </div>
  );
}
