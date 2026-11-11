"use client";
import { useActionState } from "react";
import { signIn } from "../actions";

export default function Login() {
  const [state, action, pending] = useActionState(signIn, null as { error?: string } | null);
  return (
    <form action={action} className="ad-login">
      <span className="kicker">GROOMS admin</span>
      <h1 className="h2">Sign in.</h1>
      <input name="email" type="email" placeholder="Email" aria-label="Email" autoComplete="email" required />
      <input name="password" type="password" placeholder="Password" aria-label="Password" autoComplete="current-password" required />
      {state?.error && <p className="bk-err" role="alert">{state.error}</p>}
      <button className="btn-accent btn-accent-full" disabled={pending}>{pending ? "Signing in…" : "Sign in →"}</button>
    </form>
  );
}
