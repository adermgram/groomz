import type { Metadata } from "next";
import { BookHeading, BookHelp } from "../../components/BookText";
import BookingBar from "../../components/BookingBar";
import BookingFlow from "../../components/BookingFlow";
import { admin } from "../../lib/supabase-admin";

export const metadata: Metadata = {
  title: "Book a chair | GROOMS",
  description: "Book your appointment at GROOMS, Berlin's afro & textured-hair barbershop.",
  alternates: { canonical: "/book" },
};
export const dynamic = "force-dynamic";

export default async function BookPage() {
  const { data } = await admin()
    .from("services")
    .select("id,name,description,duration_min,price_cents")
    .eq("active", true)
    .order("sort");
  return (
    <main className="bk-page">
      <BookingBar />
      <BookHeading />
      <BookingFlow services={data ?? []} />
      <BookHelp />
    </main>
  );
}
