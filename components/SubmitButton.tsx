"use client";
import { useFormStatus } from "react-dom";

/** Submit button that shows progress while a server action runs. */
export default function SubmitButton({ children, pending = "Saving…", className = "ad-btn primary" }: { children: React.ReactNode; pending?: string; className?: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <button className={className} disabled={busy} aria-busy={busy}>
      {busy ? pending : children}
    </button>
  );
}
