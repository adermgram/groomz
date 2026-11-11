import type { Metadata } from "next";
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
      <span className="kicker">Book a chair</span>
      <h1 className="h2">Pick your time.</h1>
      <BookingFlow services={data ?? []} />
      <p className="bk-muted bk-help">
        Questions first? <a href="https://www.instagram.com/groomz.men/" target="_blank" rel="noopener">Message us on Instagram</a>.
      </p>
    </main>
  );
}
