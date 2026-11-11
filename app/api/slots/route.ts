import { NextResponse } from "next/server";
import { getSlots } from "../../../lib/slots";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const service = u.searchParams.get("service") || "";
  const date = u.searchParams.get("date") || "";
  const ignore = u.searchParams.get("ignore") || undefined;
  if (!/^[0-9a-f-]{36}$/.test(service) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const slots = await getSlots(service, date, ignore && /^[0-9a-f-]{36}$/.test(ignore) ? ignore : undefined);
  return NextResponse.json({ slots });
}
