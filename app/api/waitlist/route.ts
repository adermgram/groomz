import { NextResponse } from "next/server";
import { admin } from "../../../lib/supabase-admin";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const full_name = String(b?.full_name ?? "").trim().slice(0, 120);
  const location = String(b?.location ?? "").trim().slice(0, 120);
  const email = String(b?.email ?? "").trim().toLowerCase().slice(0, 200);
  if (!full_name || !location || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const db = admin();
  // Same email twice = already on the list; treat as success without a second row.
  const { data: existing } = await db.from("waitlist").select("id").eq("email", email).limit(1);
  if (existing?.length) return NextResponse.json({ ok: true, duplicate: true });
  const { error } = await db.from("waitlist").insert({ full_name, location, email });
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
