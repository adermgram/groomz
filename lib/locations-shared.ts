// Pure helpers/types for locations. Safe to import from client components.

export type Location = {
  id: string;
  slug: string;
  name: string;
  address: string;
  postcode_city: string;
  maps_url: string | null;
  sort: number;
};

export const fullAddress = (l: Pick<Location, "address" | "postcode_city">) => `${l.address}, ${l.postcode_city}`;

/** Link to open the place in a map app (uses the saved link, else a Google Maps search). */
export const mapsUrl = (l: Pick<Location, "address" | "postcode_city" | "maps_url">) =>
  l.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.address}, ${l.postcode_city}`)}`;
