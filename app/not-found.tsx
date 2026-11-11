import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nf">
      <Link className="brand" href="/"><img src="/assets/logo.jpg" alt="GROOMS logo" className="brand-logo" /><span className="brand-text" style={{ color: "var(--ink)", textShadow: "none" }}>GROOMS</span></Link>
      <span className="kicker">Error 404</span>
      <h1 className="h2">This chair&apos;s empty.</h1>
      <p style={{ color: "var(--ink-2)", maxWidth: "34rem" }}>The page you were after does not exist, or it moved. The cut you came for is still here, though.</p>
      <div style={{ display: "flex", gap: ".9rem", flexWrap: "wrap" }}>
        <Link className="btn-book" href="/">Back to GROOMS →</Link>
        <Link className="btn-book" style={{ background: "transparent", color: "var(--ink)" }} href="/book">Book now →</Link>
      </div>
    </main>
  );
}
