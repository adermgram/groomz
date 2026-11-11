import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./app.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://grooms.de";
const TITLE = "GROOMS | Afro & Textured-Hair Barbershop in Berlin";
const DESC =
  "GROOMS is a Berlin barbershop specialising in afro and textured hair: fades, lineups, braids, locs and cornrows, backed by real hair-care knowledge. Book online.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/" },
  icons: { icon: "/assets/favicon.png", apple: "/assets/favicon.png" },
  openGraph: {
    type: "website",
    siteName: "GROOMS",
    title: TITLE,
    description: DESC,
    url: SITE,
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/assets/og-image.png"] },
};

export const viewport: Viewport = { themeColor: "#060608", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HairSalon",
      "@id": `${SITE}/#business`,
      name: "GROOMS",
      description: DESC,
      url: SITE,
      image: `${SITE}/assets/og-image.png`,
      logo: `${SITE}/assets/logo.jpg`,
      areaServed: { "@type": "City", name: "Berlin" },
      address: { "@type": "PostalAddress", addressLocality: "Berlin", addressCountry: "DE" },
      sameAs: ["https://www.instagram.com/groomz.men/"],
      potentialAction: { "@type": "ReserveAction", target: `${SITE}/book` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&family=Fragment+Mono&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('grooms-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
