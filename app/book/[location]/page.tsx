import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookPage from "../../../components/BookPage";
import { allLocations } from "../../../lib/locations";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ location: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const loc = (await allLocations()).find((l) => l.slug === location);
  return {
    title: loc ? `Book at ${loc.name} | GROOMS` : "Book a chair | GROOMS",
    description: loc ? `Book your appointment at GROOMS, ${loc.address}, ${loc.postcode_city}.` : undefined,
    alternates: { canonical: `/book/${location}` },
  };
}

// Shortcut link per location, e.g. /book/mehringdamm: only that location's days are offered.
export default async function Page({ params }: Props) {
  const { location } = await params;
  if (!(await allLocations()).some((l) => l.slug === location)) notFound();
  return <BookPage locationSlug={location} />;
}
