import type { Metadata } from "next";
import BookPage from "../../components/BookPage";

export const metadata: Metadata = {
  title: "Book a chair | GROOMS",
  description: "Book your appointment at GROOMS, Berlin's afro & textured-hair barbershop.",
  alternates: { canonical: "/book" },
};
export const dynamic = "force-dynamic";

export default function Page() {
  return <BookPage />;
}
