"use client";
import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "../app/admin/actions";

export default function ProfileForm() {
  const [st, action, pending] = useActionState(changePassword, null as { error?: string; ok?: boolean } | null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (st?.ok) form.current?.reset();
  }, [st]);

  return (
    <form ref={form} action={action} className="ad-card">
      <div className="ad-form" style={{ gridTemplateColumns: "1fr", maxWidth: "26rem" }}>
        <label>Current password<input type="password" name="current" autoComplete="current-password" required /></label>
        <label>New password (min. 10 characters)<input type="password" name="next" autoComplete="new-password" minLength={10} required /></label>
        <label>Repeat new password<input type="password" name="again" autoComplete="new-password" minLength={10} required /></label>
      </div>
      {st?.error && <p className="bk-err" role="alert">{st.error}</p>}
      {st?.ok && <p className="bk-ok" role="status">Password changed.</p>}
      <div><button className="ad-btn primary" disabled={pending}>{pending ? "Saving…" : "Change password"}</button></div>
    </form>
  );
}
