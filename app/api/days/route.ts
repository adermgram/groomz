import { NextResponse } from "next/server";
import { getDayMap } from "../../../lib/locations";
import { berlinDateStr } from "../../../lib/tz";

export const dynamic = "force-dynamic";

/** Open/closed flag and location for each of the next days, plus the list of locations. */
export async function GET(req: Request) {
  const n = Math.min(Math.max(Number(new URL(req.url).searchParams.get("days")) || 45, 1), 120);
  return NextResponse.json(await getDayMap(berlinDateStr(new Date()), n));
}
