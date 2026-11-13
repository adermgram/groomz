import { BookHeading, BookHelp } from "./BookText";
import BookingBar from "./BookingBar";
import BookingFlow from "./BookingFlow";
import { admin } from "../lib/supabase-admin";

/** Shared body of /book and /book/[location]. */
export default async function BookPage({ locationSlug }: { locationSlug?: string }) {
  const { data } = await admin()
    .from("services")
    .select("id,name,description,duration_min,price_cents")
    .eq("active", true)
    .order("sort");
  return (
    <main className="bk-page">
      <BookingBar />
      <BookHeading />
      <BookingFlow services={data ?? []} locationSlug={locationSlug} />
      <BookHelp />
    </main>
  );
}
