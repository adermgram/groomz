import type { Metadata } from "next";
import { ManageKicker } from "../../../components/BookText";
import BookingBar from "../../../components/BookingBar";
import ManageBooking from "../../../components/ManageBooking";

export const metadata: Metadata = { title: "Your booking | GROOMS", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="bk-page">
      <BookingBar />
      <ManageKicker />
      <ManageBooking token={token} />
    </main>
  );
}
